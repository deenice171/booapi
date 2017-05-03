"use strict";
const logger = require('morgan');
const bodyParser = require('body-parser');
const Models = require('./models/index');
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
class API {
    constructor(app, port, options) {
        this.app = app;
        this.port = port;
        this.options = options;
        this.initialize(app, options);
    }
    configureDatabase(options) {
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
                    max: 10,
                    idleTimeoutMillis: 30000,
                };
                const pool = new pg.Pool(config);
                pool.on('error', function (err, client) {
                    console.error('idle client error', err.message, err.stack);
                });
                API.db = {
                    query: (text, values, callback) => {
                        console.log('from api.ts query: ', text, values);
                        return pool.query(text, values, callback);
                    },
                    connect: (callback) => {
                        return pool.connect(callback);
                    }
                };
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
    configureMiddleware(app) {
        app.use(logger('dev'));
        app.use(bodyParser.json({ limit: '5mb' }));
        app.use(bodyParser.urlencoded({ extended: false }));
    }
    configureRoutes(app) {
        console.log('Models', Models);
        Object.keys(Models).forEach((key, index) => {
            console.log('foreach model name', key);
            // console.log('Models[key] = model ', Models[key]);
            app.use(`/api/v1/${key.toLowerCase()}`, new Models[key](this.options, key).model.router.make());
        });
    }
    configureJWT(app) {
        console.log('process.env.JWT_SECRET', process.env.JWT_SECRET);
        app.use('/', expressJWT({
            secret: process.env.JWT_SECRET,
            credentialsRequired: true,
            getToken: (req) => {
                if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
                    return req.headers.authorization.split(' ')[1];
                }
                else if (req.query && req.query.token) {
                    return req.query.token;
                }
                return null;
            }
        }).unless({
            path: [/\/api\/v1\/user\/login(?!\/renew)/, /\/api\/v1\/user\/reset-password/, /\/api\/v1\/user\/forgot-password/]
        }));
    }
    configurePassport(app) {
        console.log('this.options.dbType', this.options.dbType);
        app.use(passport.initialize());
        passport.use('local', new Strategy({
            usernameField: 'email',
            passwordField: 'password'
        }, (email, password, done) => {
            if (this.options.dbType == 'mongo') {
                let user = mongoose.model('User');
                console.log('user---------->', user);
                user.findOne({ email })
                    .populate([{ path: "role", model: "Role" }, { path: "provider", model: "Provider" }])
                    .then((user) => {
                    if (!user) {
                        return done(null, false, { message: 'Incorrect username.' });
                    }
                    else {
                        bcrypt.compare(password, user.password, (err, res) => {
                            if (!res) {
                                return done(null, false, { message: 'Incorrect password' });
                            }
                            return done(null, user);
                        });
                    }
                });
            }
            else if (this.options.dbType == 'postgres') {
                console.log('here...');
                API.db.query(`select * from USER where email=${email}`, null, (err, user) => {
                    if (err) {
                        console.log('error', err);
                        return err;
                    }
                    else {
                        console.log('from query user', user);
                        bcrypt.compare(password, user[0].password, (err, res) => {
                            if (!res) {
                                return done(null, false, { message: 'Incorrect password' });
                            }
                            else {
                                return done(null, user);
                            }
                        });
                    }
                });
            }
        }));
    }
    configureCors(app) {
        app.options('*', cors());
        // Allow requests from any localhost -- on any port
        const corsHostnameWhitelist = [/http:\/\/localhost(?::\d{1,5})?$/];
        app.use(cors({
            origin: corsHostnameWhitelist
        }));
    }
    initialize(app, options) {
        this.configureDatabase(options);
        this.configureMiddleware(app);
        //this.configurePassport(app);
        this.configureJWT(app);
        this.configureRoutes(app);
        this.configureCors(app);
    }
    spawn() {
        this.app.listen(this.port);
    }
}
exports.API = API;
