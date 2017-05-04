/*
    The base controller file containing default controller methods
*/

import { Router, Request, Response, NextFunction } from 'express';
import { PSQLWrapper } from '../wrapper/postgres.wrapper';

export class BaseController {

    error: Array<String>;
    psql: PSQLWrapper;

    constructor(
        public options: any,
        public name: string, // the table name ie Tank
        public model: any
    ) {
        //console.log('from baseController book: ', this.model);
        //console.log('this.name', this.name);
        this.psql = new PSQLWrapper(this.options, this.name);
    }

    findByIdInterceptor = (req: Request, res: Response, next: NextFunction) => {
        console.log('from intereptor...dbType: ', this.options.dbType);
        if (this.options.dbType == 'mongo') {
            this.model.findById(req.params.id, (err: any, resp: any) => {
                if (err) {
                    res.status(500).send(err);
                } else if (resp) {
                    req[this.name] = resp;
                    next();
                } else {
                    res.status(404).send(err);
                }
            })
        } else if (this.options.dbType == 'postgres') {
            console.log('from baseController initializing postgres...');
            this.psql.findById(req, res, next, (data: any) => {
                req[this.name] = data;
                next();
            });
        }
    }

    getAll = (req: Request, res: Response, next: NextFunction) => {
        if (this.options.dbType == 'mongo') {
            this.model.find((err: any, resp: any) => {
                if (err) {
                    console.log('err', err);
                } else {
                    res.json(resp);
                }
            });
        } else if (this.options.dbType == 'postgres') {
            this.psql.getAll(req, res, next, (resp: any) => {
                res.json(resp)
            });
        }
    }

    findById = (req: Request, res: Response, next: NextFunction) => {
        if (this.options.dbType == 'mongo') {
            res.json(req[this.name]);
        } else if (this.options.dbType == 'postgres') {
            console.log('from base controller findById...l req.this.name', req[this.name]);
            res.json(req[this.name]); // the same because of findByIdInterceptor
        }
    }

    insert = (req: Request, res: Response, next: NextFunction) => {
        if (this.options.dbType == 'mongo') {
            this.model.create(req.body, (err: any, resp: any) => {
                if (err) {
                    console.log('err', err);
                    res.status(500).send(err);
                } else {
                    res.status(201).send(resp);
                }
            })
        } else if (this.options.dbType == 'postgres') {
            console.log('from baseController POST postgres...');
            this.psql.insert(req, res, next, (resp: any) => {
                res.status(201).send(resp);
            });
        }

    }

    update = (req: Request, res: Response, next: NextFunction) => {
        let updatedFields = Object.assign(req[this.name], req.body);
        console.log(`new ${this.name}`, updatedFields);
        if (this.options.dbType == 'mongo') {
            console.log('from baseController update mongo....');
            this.model.update(updatedFields, (err: any, resp: any) => {
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.json(updatedFields);
                }
            });
        } else if (this.options.dbType == 'postgres') {
            console.log('from baseController udpate method...l');
            this.psql.update(req, res, next, (data: any) => {
                res.json(data);
            });
        }

    }

    remove = (req: Request, res: Response, next: NextFunction) => {
        if (this.options.dbType == 'mongo') {
            req[this.name].remove((err: any, resp: any) => {
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.status(200).send({ message: 'delete success' });
                }
            });
        } else if (this.options.dbType == 'postgres') {
            this.psql.delete(req, res, next, (data: any) => {
                res.status(200).send({ message: 'delete success' });
            });
        }
    }

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
    updateSet = (req: Request, res: Response, next: NextFunction) => {
        if (this.options.dbType == 'mongo') {
            res.status(200).send({ message: 'Comming soon.' });
        } else if (this.options.dbType == 'postgres') {
            this.psql.updateSet(req, res, next, (resp: any) => {
                res.status(200).send({ message: 'update success', data: resp });
            });
        }
    }

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
    get = (req: Request, res: Response, next: NextFunction) => {
        if (this.options.dbType == 'mongo') {
            res.status(200).send({ message: 'Comming soon.' });
        } else if (this.options.dbType == 'postgres') {
            this.psql.get(req, res, next, (data: any) => {
                res.status(200).send({ message: 'get success', data: data.rows });
            });
        }
    }

    query = () => {

    }

    getError = (): Array<String> => {
        return this.error;
    }

    sendError = (status: number, error: string) => {
        return {
            errorMessage: error,
            statusCode: status
        }
    }

    send = (status: number, data: any) => {
        return {
            data: data,
            statusCode: status
        }
    }

    setError = (error: string) => {
        this.error.push(error);
    }

}