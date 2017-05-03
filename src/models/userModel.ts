import { BaseModel } from './baseModel';
import { BaseController } from '../controllers/baseController';
import { BaseRouter } from '../routes/baseRouter';
import { Request, Response, NextFunction } from 'express';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

import { API } from '../api';

export class User extends BaseModel {
    model: any;
    constructor(public options: any) {
        // call the super class and create the model
        super(options, 'User', { // must use mongoose.Schema syntax
            email: { type: String },
            username: { type: String },
            password: { type: String },
            role: { type: Array },
            superAdmin: { type: Boolean, default: false }
        });
        // create a controller
        this.model.controller = new BaseController(this.options, 'User', this.model);
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
            API.db.query(`select "isSuperAdmin" from "User" where id='${req.params.id}'`, null, (err: any, user: any) => {
                if (err) {
                    console.log('error', err);
                    res.status(500).send(this.model.controller.sendError(500, err));
                } else {
                    res.json({ isSuperAdmin: user.rows[0] });
                }
            });
        }

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
            API.db.query(`select * from "User" where email='${req.body.email}'`, null, (err: any, user: any) => {
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
    }

}