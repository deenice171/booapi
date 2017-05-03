"use strict";
const postgres_wrapper_1 = require('../wrapper/postgres.wrapper');
//postgres stuff
const pg = require('pg');
const connectionString = process.env.DB_CONN || 'postgres://postgres:Mai2Lucas@localhost:5432/sales-specialty-lucas';
const client = new pg.Client(connectionString);
class BaseController {
    constructor(options, name, // the table name ie Tank
        model) {
        this.options = options;
        this.name = name;
        this.model = model;
        this.findByIdInterceptor = (req, res, next) => {
            console.log('from intereptor...dbType: ', this.options.dbType);
            if (this.options.dbType == 'mongo') {
                this.model.findById(req.params.id, (err, resp) => {
                    if (err) {
                        res.status(500).send(err);
                    }
                    else if (resp) {
                        req[this.name] = resp;
                        next();
                    }
                    else {
                        res.status(404).send(err);
                    }
                });
            }
            else if (this.options.dbType == 'postgres') {
                console.log('from baseController initializing postgres...');
                this.psql.findById(req, res, next, (data) => {
                    req[this.name] = data;
                    next();
                });
            }
        };
        this.getAll = (req, res, next) => {
            if (this.options.dbType == 'mongo') {
                this.model.find((err, resp) => {
                    if (err) {
                        console.log('err', err);
                    }
                    else {
                        res.json(resp);
                    }
                });
            }
            else if (this.options.dbType == 'postgres') {
                this.psql.getAll(req, res, next, (resp) => {
                    res.json(resp);
                });
            }
        };
        this.findById = (req, res, next) => {
            if (this.options.dbType == 'mongo') {
                res.json(req[this.name]);
            }
            else if (this.options.dbType == 'postgres') {
                console.log('from base controller findById...l req.this.name', req[this.name]);
                res.json(req[this.name]); // the same because of findByIdInterceptor
            }
        };
        this.insert = (req, res, next) => {
            if (this.options.dbType == 'mongo') {
                this.model.create(req.body, (err, resp) => {
                    if (err) {
                        console.log('err', err);
                        res.status(500).send(err);
                    }
                    else {
                        res.status(201).send(resp);
                    }
                });
            }
            else if (this.options.dbType == 'postgres') {
                console.log('from baseController POST postgres...');
                this.psql.insert(req, res, next, (resp) => {
                    res.status(201).send(resp);
                });
            }
        };
        this.update = (req, res, next) => {
            let updatedFields = Object.assign(req[this.name], req.body);
            console.log(`new ${this.name}`, updatedFields);
            if (this.options.dbType == 'mongo') {
                console.log('from baseController update mongo....');
                this.model.update(updatedFields, (err, resp) => {
                    if (err) {
                        res.status(500).send(err);
                    }
                    else {
                        res.json(updatedFields);
                    }
                });
            }
            else if (this.options.dbType == 'postgres') {
                console.log('from baseController udpate method...l');
                this.psql.update(req, res, next, (data) => {
                    res.json(data);
                });
            }
        };
        this.remove = (req, res, next) => {
            if (this.options.dbType == 'mongo') {
                req[this.name].remove((err, resp) => {
                    if (err) {
                        res.status(500).send(err);
                    }
                    else {
                        res.status(200).send({ message: 'delete success' });
                    }
                });
            }
            else if (this.options.dbType == 'postgres') {
                this.psql.delete(req, res, next, (data) => {
                    res.status(200).send({ message: 'delete success' });
                });
            }
        };
        /* passing this to the request body will update serial number to 123 where "isActive = 0"
        {
            "serialNumber":123,
            "updatedAt":"2017-04-24",
            "where":{
                "isActive":0,
                "id":591,
                "clientId":320
            }
        }
        */
        this.updateSet = (req, res, next) => {
            if (this.options.dbType == 'mongo') {
                res.status(200).send({ message: 'Comming soon.' });
            }
            else if (this.options.dbType == 'postgres') {
                this.psql.updateSet(req, res, next, (data) => {
                    res.status(200).send({ message: 'update success', data: data.rows });
                });
            }
        };
        /*
        {
            "get": ["id", "isActive", "clientId", "expAvgDailyUse", "tankName"],
            "join": [{
                    "DeliveryOrder": "tankId",
                    "on": "id",
                    "as": "deliveryOrders",
                    "join":{
                        "Route":"id",
                        "on":"routeId",
                        "as":"route"
                    }
                },{
                    "TankType": "id",
                    "on": "tankTypeId",
                    "as": "tankType"
                }
            ],
            "where": {
                "isActive": 1,
                "id": 815
            },
            "group": [
                    "id"
                ],
            "sort": {
                "id": "ASC",
                "clientId": "DESC"
            }
            }
        */
        this.get = (req, res, next) => {
            if (this.options.dbType == 'mongo') {
                res.status(200).send({ message: 'Comming soon.' });
            }
            else if (this.options.dbType == 'postgres') {
                this.psql.get(req, res, next, (data) => {
                    res.status(200).send({ message: 'get success', data: data.rows });
                });
            }
        };
        this.query = () => {
        };
        this.getError = () => {
            return this.error;
        };
        this.sendError = (status, error) => {
            return {
                errorMessage: error,
                statusCode: status
            };
        };
        this.send = (status, data) => {
            return {
                data: data,
                statusCode: status
            };
        };
        this.setError = (error) => {
            this.error.push(error);
        };
        //console.log('from baseController book: ', this.model);
        //console.log('this.name', this.name);
        this.psql = new postgres_wrapper_1.PSQLWrapper(this.options, this.name);
    }
}
exports.BaseController = BaseController;
