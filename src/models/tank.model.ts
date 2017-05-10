/*
    An example model with custom controller methods override
    and router extensions
*/

import { BaseModel } from './base.model';
import { BaseController } from '../controllers/base.controller';
import { BaseRouter } from '../routes/base.router';
import { Request, Response, NextFunction } from 'express';

export class Tank extends BaseModel {

    model: any;

    constructor(public options: any, public name: string) {
        // call the super class and create the model
        super(options, name, { // must use mongoose.Schema syntax
            id: { type: Number, key: 'primary' },
            tank_name: { type: String, maxlength: 24 },
            serial_number: { type: String, maxlength: 24 },
            gallons: { type: Number },
            //addressId: { type: Number, key: 'foreign', references: { table: "Address", foreignKey: 'id' } },
            //tankTypeId: { type: Number, key: 'forign', references: { table: "TankType", foreignKey: 'id' } },
            //tankDeviceId: { type: Number, key: 'foreign', references: { table: "TankDevice", foreignKey: 'id' } },
            //productId: { type: Number, key: 'foreign', references: { table: "Product", foreignKey: 'id' } },
            //clientId: { type: Number, key: 'foreign', references: { table: "Client", foreignKey: 'id' } },
            user_id: {
                type: Number,
                key: 'foreign',
                references: { table: 'User', foreignKey: 'id' },
                onDelete: 'cascade',
                onUpdate: 'cascade'
            },
            active: { type: Boolean, default: true },
            created_at: { type: Date, default: Date.now() },
            updated_at: { type: Date, default: Date.now() },
            deleted_at: { type: Date, default: Date.now() }
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