/*
    An example model with custom controller methods override
    and router extensions
*/

import { BaseModel } from './baseModel';
import { BaseController } from '../controllers/baseController';
import { BaseRouter } from '../routes/baseRouter';
import { Request, Response, NextFunction } from 'express';

export class Tank extends BaseModel {

    model: any;

    constructor(public options: any, public name: string) {
        // call the super class and create the model
        super(options, name, { // must use mongoose.Schema syntax
            id: { type: Number, key: 'primary' },
            PK_Tank: { type: Number },
            tankName: { type: String, maxlength: 24 },
            serialNumber: { type: String, maxlength: 24 },
            serviceThreshholdAlert: { type: Number },
            serviceThreshholdCritical: { type: Number },
            tankLAT: { type: String, maxlength: 24 },
            tankLON: { type: String, maxlength: 24 },
            expAvgDailyUse: { type: Number },
            isActive: { type: Number },
            currentGallons: { type: Number },
            //addressId: { type: Number, key: 'foreign', references: { table: "Address", foreignKey: 'id' } },
            //tankTypeId: { type: Number, key: 'forign', references: { table: "TankType", foreignKey: 'id' } },
            //tankDeviceId: { type: Number, key: 'foreign', references: { table: "TankDevice", foreignKey: 'id' } },
            //productId: { type: Number, key: 'foreign', references: { table: "Product", foreignKey: 'id' } },
            //clientId: { type: Number, key: 'foreign', references: { table: "Client", foreignKey: 'id' } },
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

    // init all custom endpoints
    addCustomEndpoints() {
        console.log('create custom endpoints here!');
    }

}