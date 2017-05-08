/*
    An example model with custom controller methods override
    and router extensions
*/

import { BaseModel } from './baseModel';
import { BaseController } from '../controllers/baseController';
import { BaseRouter } from '../routes/baseRouter';
import { Request, Response, NextFunction } from 'express';

export class Book extends BaseModel {

    model: any;

    constructor(public options: any, public name:string) {
        // call the super class and create the model
        super(options, name, { 
            id: { type: Number, key: 'primary' },
            title: { type: String, maxlength: 24 },
            author: { type: String, maxlength: 24 },
            genre: { type: String, maxlength: 24, unique: true },
            read: { type: Boolean, default: true },
            userId: { 
                type: Number, 
                key: 'foreign', 
                references: { table: 'User', foreignKey: 'id' },
                onDelete:'cascade',
                onUpdate:'restrict',
                unique:true 
            },
            createdAt: { type: Date },
            updatedAt: { type: Date },
            deletedAt: { type: Date }
        });
        // create a controller
        this.model.controller = new BaseController(this.options, this.name, this.model);
        // create a router
        this.model.router = new BaseRouter(this.model.controller);
        // initialize custom endpoints
        this.addCustomEndpoints();
    }

    // override controller methods here
    getRead = (req: Request, res: Response, next: NextFunction) => {
        this.model.find({ read: true }, (err: any, resp: any) => {
            if (!err) {
                res.json(resp);
            } else {
                res.status(500).send(err);
            }
        });
    }

    toggleRead = (req: Request, res: Response, next: NextFunction) => {
        this.model.findById(req.params.id, (err: any, resp: any) => {
            if (err) {
                res.status(500).send(this.model.controller.sendError(500, err));
            } else if (resp) {
                let read = !resp.read;
                this.model.update({ _id: req.params.id }, { $set: { read: read } }, (err: any, book: any) => {
                    if (book) {
                        book.read = resp.read;
                        res.status(200).send(resp);
                    } else {
                        res.status(404).send(this.model.controller.sendError(404, err));
                    }
                });
            } else {
                res.status(404).send(this.model.controller.sendError(404, err));
            }
        })
    }

    // init all custom endpoints
    addCustomEndpoints() {
        this.model.router.extend('/read', 'GET', this.getRead);
        this.model.router.extend('/id/:id/read/toggle', 'GET', this.toggleRead);
    }

}