"use strict";
const baseModel_1 = require('./baseModel');
const baseController_1 = require('../controllers/baseController');
const baseRouter_1 = require('../routes/baseRouter');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const api_1 = require('../api');
class User extends baseModel_1.BaseModel {
    constructor(options) {
        // call the super class and create the model
        super(options, 'User', {
            email: { type: String },
            username: { type: String },
            password: { type: String },
            role: { type: Array },
            superAdmin: { type: Boolean, default: false }
        });
        this.options = options;
        // override controller methods here
        this.isSuperAdmin = (req, res, next) => {
            if (this.options.dbType == 'mongo') {
                console.log('from userModel r');
                this.model.findById(req.params.id, (err, resp) => {
                    if (!err) {
                        console.log('resp', resp);
                        res.json(this.model.controller.send(200, { isSuperAdmin: resp.superAdmin }));
                    }
                    else {
                        res.status(500).send(this.model.controller.sendError(500, err));
                    }
                });
            }
            else if (this.options.dbType == 'postgres') {
                api_1.API.db.query(`select "isSuperAdmin" from "User" where id='${req.params.id}'`, null, (err, user) => {
                    if (err) {
                        console.log('error', err);
                        res.status(500).send(this.model.controller.sendError(500, err));
                    }
                    else {
                        res.json({ isSuperAdmin: user.rows[0] });
                    }
                });
            }
        };
        this.login = (req, res, next) => {
            if (this.options.dbType == 'mongo') {
                this.model.findOne({ email: req.body.email }, (err, user) => {
                    if (err) {
                        res.status(500).send(this.model.controller.sendError(500, err));
                    }
                    else if (user) {
                        bcrypt.compare(req.body.password, user.password, (err, resp) => {
                            if (!resp) {
                                res.status(500).send({ message: 'Incorrect password' });
                            }
                            else {
                                res.json({
                                    token: jwt.sign(user, process.env.JWT_SECRET),
                                    user: user
                                });
                            }
                        });
                    }
                    else {
                        res.status(404).send(this.model.controller.sendError(404, err));
                    }
                });
            }
            else if (this.options.dbType == 'postgres') {
                console.log('here...');
                api_1.API.db.query(`select * from "User" where email='${req.body.email}'`, null, (err, user) => {
                    if (err) {
                        console.log('error', err);
                        return err;
                    }
                    else {
                        console.log('from query user', user.rows);
                        bcrypt.compare(req.body.password, user.rows[0].password, (err, resp) => {
                            console.log('resp', resp);
                            if (!resp) {
                                res.status(500).send({ message: 'Incorrect password' });
                            }
                            else {
                                res.json({
                                    token: jwt.sign(user, process.env.JWT_SECRET),
                                    user: user.rows[0]
                                });
                            }
                        });
                    }
                });
            }
        };
        // create a controller
        this.model.controller = new baseController_1.BaseController(this.options, 'User', this.model);
        // create a router
        this.model.router = new baseRouter_1.BaseRouter(this.model.controller);
        // initialize custom endpoints
        this.addCustomEndpoints();
    }
    // init all custom endpoints
    addCustomEndpoints() {
        this.model.router.extend('/id/:id/super', 'GET', this.isSuperAdmin);
        this.model.router.extend('/login', 'POST', this.login);
    }
}
exports.User = User;
