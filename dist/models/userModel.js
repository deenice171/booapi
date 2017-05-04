/*
    The default user model is required by the application
*/
"use strict";
const baseModel_1 = require('./baseModel');
const baseController_1 = require('../controllers/baseController');
const baseRouter_1 = require('../routes/baseRouter');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;
const api_1 = require('../api');
class User extends baseModel_1.BaseModel {
    constructor(options, name) {
        // call the super class and create the model
        super(options, name, {
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
        this.options = options;
        this.name = name;
        // override controller methods here
        this.isSuperAdmin = (req, res, next) => {
            if (this.options.dbType == 'mongo') {
                this.model.findById(req.params.id, (err, resp) => {
                    if (!err) {
                        res.json(this.model.controller.send(200, { isSuperAdmin: resp.superAdmin }));
                    }
                    else {
                        res.status(500).send(this.model.controller.sendError(500, err));
                    }
                });
            }
            else if (this.options.dbType == 'postgres') {
                api_1.API.db.query(`select "isSuperAdmin" from "${this.name}" where id='${req.params.id}'`, null, (err, user) => {
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
        this.findByEmail = (req, res, next) => {
            this.findUser(req, res, next).then((resp) => {
                res.json(resp);
            });
        };
        this.createSecureUser = (req, res, next) => {
            this.findUser(req, res, next).then((user) => {
                if (user['errorCode'] == 500) {
                    let dirtyPassword = req.body['password'];
                    bcrypt.hash(dirtyPassword, saltRounds).then((hash) => {
                        // Store hash in your password DB.
                        req.body['password'] = hash;
                        this.model.controller.insert(req, res, next);
                    });
                }
                else {
                    res.status(200).send(this.model.controller.sendError(200, 'user already exist!'));
                }
            });
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
                api_1.API.db.query(`select * from "${this.name}" where email='${req.body.email}'`, null, (err, user) => {
                    if (err) {
                        res.status(500).send({ message: err });
                    }
                    else {
                        bcrypt.compare(req.body.password, user.rows[0].password, (err, resp) => {
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
        this.model.controller = new baseController_1.BaseController(this.options, this.name, this.model);
        // create a router
        this.model.router = new baseRouter_1.BaseRouter(this.model.controller);
        // initialize custom endpoints
        this.addCustomEndpoints();
    }
    findUser(req, res, next) {
        return new Promise((resolve) => {
            if (this.options.dbType == 'mongo') {
                this.model.findOne({ email: req.body.email }, (err, user) => {
                    if (err) {
                        resolve(err);
                    }
                    else if (user) {
                        resolve(user);
                    }
                });
            }
            else if (this.options.dbType == 'postgres') {
                api_1.API.db.query(`select * from "${this.name}" where email='${req.body.email}'`, null, (err, user) => {
                    if (user.rows.length == 0) {
                        resolve({ errorCode: 500, errorMessage: 'find by email error!' });
                    }
                    else {
                        //res.json(user.rows[0]);
                        resolve(user.rows[0]);
                    }
                });
            }
        });
    }
    // init all custom endpoints
    addCustomEndpoints() {
        this.model.router.extend('/id/:id/super', 'GET', this.isSuperAdmin);
        this.model.router.extend('/login', 'POST', this.login);
        this.model.router.extend('/find-by-email', 'POST', this.findByEmail);
        this.model.router.extend('/create-secure', 'POST', this.createSecureUser);
    }
}
exports.User = User;
