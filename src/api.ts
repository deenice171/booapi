import * as path from 'path';
import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as Models from './models/index';

// cors
const cors = require('cors');

// mongoose
const mongoose = require('mongoose');

// api authentication
const passport = require('passport');
const Strategy = require('passport-local');
const expressJWT = require('express-jwt');
const bcrypt = require('bcrypt');

// environment variable
const envFile = require('../.env');
const dotEnv = require('dotenv').load(envFile);

interface IOption {
    dbType: string,
    dbName: string,
    user: string,
    password: string,
    host: string,
    port: number,
    connectionString: string
}

export class API {
    static db: any;
    constructor(
        private app: express.Express,
        private port: number,
        private options: IOption) {
        this.initialize(app, options);
    }

    configureDatabase(options: IOption) {
        switch (options.dbType) {
            case 'mongo':
                mongoose.connect(this.options.connectionString);
                // set this.db = mongoose.connect
                break;
            case 'postgres':
                const pg = require('pg');
                let config = {
                    user: options.user,
                    database: options.dbName,
                    password: options.password,
                    host: options.host,
                    port: options.port,
                    max: 10, // max number of clients in the pool
                    idleTimeoutMillis: 30000,
                };
                const pool = new pg.Pool(config);
                pool.on('error', function (err: any, client: any) {
                    console.error('idle client error', err.message, err.stack);
                });

                API.db = {
                    query: (text: any, values: any, callback: any) => {
                        console.log('from api.ts query: ', text, values);
                        return pool.query(text, values, callback);
                    },
                    connect: (callback: any) => {
                        return pool.connect(callback);
                    }
                }
                break;
            case 'mysql':
                break;
            case 'sql-server':
                break;
            default:
                console.log('database default to postgres');
                break;
        }
        // console.log('todo configuring databaser...... db: ', db);
    }

    private configureMiddleware(app: express.Express): void {
        app.use(logger('dev'));
        app.use(bodyParser.json({ limit: '5mb' }));
        app.use(bodyParser.urlencoded({ extended: false }));
    }

    private configureRoutes(app: express.Express): void {
        console.log('Models', Models);
        Object.keys(Models).forEach((key: any, index: number) => {
            console.log('foreach model name', key);
            // console.log('Models[key] = model ', Models[key]);
            app.use(`/api/v1/${key.toLowerCase()}`, new Models[key](this.options, key).model.router.make());
        });
    }

    configureJWT(app: express.Express) {
        console.log('process.env.JWT_SECRET', process.env.JWT_SECRET);
        app.use('/', expressJWT({
            secret: process.env.JWT_SECRET,
            credentialsRequired: true,
            getToken: (req: any) => {
                if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
                    return req.headers.authorization.split(' ')[1];
                } else if (req.query && req.query.token) {
                    return req.query.token;
                }
                return null;
            }
        }).unless({
            path: [/\/api\/v1\/user\/login(?!\/renew)/, /\/api\/v1\/user\/reset-password/, /\/api\/v1\/user\/forgot-password/]
        }));
    }

    configurePassport(app: express.Express) {
        console.log('this.options.dbType', this.options.dbType);
        app.use(passport.initialize());
        passport.use('local', new Strategy({
            usernameField: 'email',
            passwordField: 'password'
        }, (email: string, password: string, done: any) => {
            if (this.options.dbType == 'mongo') {
                let user = mongoose.model('User');
                console.log('user---------->', user);
                user.findOne({ email })
                    .populate([{ path: "role", model: "Role" }, { path: "provider", model: "Provider" }])
                    .then((user: any) => {
                        if (!user) {
                            return done(null, false, { message: 'Incorrect username.' });
                        } else {
                            bcrypt.compare(password, user.password, (err: any, res: any) => {
                                if (!res) {
                                    return done(null, false, { message: 'Incorrect password' })
                                }
                                return done(null, user);
                            })
                        }
                    })
            } else if (this.options.dbType == 'postgres') {
                console.log('here...');
                API.db.query(`select * from USER where email=${email}`, null, (err: any, user: any) => {
                    if (err) {
                        console.log('error', err);
                        return err;
                    } else {
                        console.log('from query user', user);
                        bcrypt.compare(password, user[0].password, (err: any, res: any) => {
                            if (!res) {
                                return done(null, false, { message: 'Incorrect password' })
                            } else {
                                return done(null, user);
                            }
                        })
                    }
                });
            }

        }));
    }

    configureCors(app: express.Express) {
        app.options('*', cors());
        // Allow requests from any localhost -- on any port
        const corsHostnameWhitelist = [/http:\/\/localhost(?::\d{1,5})?$/];
        app.use(cors({
            origin: corsHostnameWhitelist
        }));
    }

    private initialize(app: express.Express, options: IOption) {
        this.configureDatabase(options);
        this.configureMiddleware(app);

        //this.configurePassport(app);
        this.configureJWT(app);
        this.configureRoutes(app);
        this.configureCors(app);
    }

    public spawn() {
        this.app.listen(this.port);
    }

}