import { BaseModel } from './baseModel';
import { BaseController } from '../controllers/baseController';
import { BaseRouter } from '../routes/baseRouter';
import { Request, Response, NextFunction } from 'express';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;

import { API } from '../api';

export class User extends BaseModel {
    model: any;
    constructor(public options: any, public name:string) {
        // call the super class and create the model
        super(options, name, { // must use mongoose.Schema syntax
            id: { type: Number, key: 'primary' },
            email: { type: String },
            username: { type: String },
            password: { type: String, maxlength: 200 },
            role: { type: Array },
            superAdmin: { type: Boolean, default: false },
            isActivated: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now() },
            updatedAt: { type: Date, default: Date.now() },
            deletedAt: { type: Date, default: Date.now() }
        });
        // create a controller
        this.model.controller = new BaseController(this.options, this.name, this.model);
        // create a router
        this.model.router = new BaseRouter(this.model.controller);
        // initialize custom endpoints
        this.addCustomEndpoints();
    }

    // override controller methods here
    isSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
        if (this.options.dbType == 'mongo') {
            console.log('from userModel r');
            this.model.findById(req.params.id, (err: any, resp: any) => {
                if (!err) {
                    console.log('resp', resp);
                    res.json(this.model.controller.send(200, { isSuperAdmin: resp.superAdmin }));
                } else {
                    res.status(500).send(this.model.controller.sendError(500, err));
                }
            });
        } else if (this.options.dbType == 'postgres') {
            API.db.query(`select "isSuperAdmin" from "${this.name}" where id='${req.params.id}'`, null, (err: any, user: any) => {
                if (err) {
                    console.log('error', err);
                    res.status(500).send(this.model.controller.sendError(500, err));
                } else {
                    res.json({ isSuperAdmin: user.rows[0] });
                }
            });
        }
    }

    findUser(req: Request, res: Response, next: NextFunction) {
        return new Promise((resolve) => {
            if (this.options.dbType == 'mongo') {
                this.model.findOne({ email: req.body.email }, (err: any, user: any) => {
                    if (err) {
                        resolve(err);
                    } else if (user) {
                        resolve(user);
                    }
                });
            } else if (this.options.dbType == 'postgres') {
                API.db.query(`select * from "${this.name}" where email='${req.body.email}'`, null, (err: any, user: any) => {
                    if (user.rows.length == 0) {
                        console.log('error', err);
                        resolve({ errorCode: 500, errorMessage: 'find by email error!' });
                    } else {
                        //res.json(user.rows[0]);
                        resolve(user.rows[0]);
                    }
                });
            }
        });
    }

    findByEmail = (req: Request, res: Response, next: NextFunction) => {
        this.findUser(req, res, next).then((resp) => {
            res.json(resp);
        });
    }

    createSecureUser = (req: Request, res: Response, next: NextFunction) => {
        this.findUser(req, res, next).then((user) => {
            console.log('user from createUser', user);
            if (user['errorCode'] == 500) { // user not exist
                console.log('creating user now....... user: ', user);
                let dirtyPassword = req.body['password'];
                console.log('dirty pass', dirtyPassword);
                bcrypt.hash(dirtyPassword, saltRounds).then((hash: any) => {
                    // Store hash in your password DB.
                    console.log('hash', hash);
                    req.body['password'] = hash;
                    this.model.controller.insert(req, res, next);
                });
            } else { // user exist
                res.status(200).send(this.model.controller.sendError(200, 'user already exist!'));

            }
        });
    }

    login = (req: Request, res: Response, next: NextFunction) => {
        if (this.options.dbType == 'mongo') {
            this.model.findOne({ email: req.body.email }, (err: any, user: any) => {
                if (err) {
                    res.status(500).send(this.model.controller.sendError(500, err));
                } else if (user) {
                    bcrypt.compare(req.body.password, user.password, (err: any, resp: any) => {
                        if (!resp) {
                            res.status(500).send({ message: 'Incorrect password' })
                        } else {
                            res.json({
                                token: jwt.sign(user, process.env.JWT_SECRET),
                                user: user
                            });
                        }
                    })
                } else {
                    res.status(404).send(this.model.controller.sendError(404, err));
                }
            });
        } else if (this.options.dbType == 'postgres') {
            console.log('here...');
            API.db.query(`select * from "${this.name}" where email='${req.body.email}'`, null, (err: any, user: any) => {
                if (err) {
                    console.log('error', err);
                    return err;
                } else {
                    console.log('from query user', user.rows);
                    bcrypt.compare(req.body.password, user.rows[0].password, (err: any, resp: any) => {
                        console.log('resp', resp);
                        if (!resp) {
                            res.status(500).send({ message: 'Incorrect password' })
                        } else {
                            res.json({
                                token: jwt.sign(user, process.env.JWT_SECRET),
                                user: user.rows[0]
                            });
                        }
                    })
                }
            });
        }
    }

    // init all custom endpoints
    addCustomEndpoints() {
        this.model.router.extend('/id/:id/super', 'GET', this.isSuperAdmin);
        this.model.router.extend('/login', 'POST', this.login);
        this.model.router.extend('/find-by-email', 'POST', this.findByEmail);
        this.model.router.extend('/create-secure', 'POST', this.createSecureUser);
    }

}