"use strict";
const baseModel_1 = require('./baseModel');
const baseController_1 = require('../controllers/baseController');
const baseRouter_1 = require('../routes/baseRouter');
class Tank extends baseModel_1.BaseModel {
    constructor(options) {
        // call the super class and create the model
        super(options, 'Tank', {
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
            addressId: { type: Number, key: 'foreign', references: { table: "Address", on: 'id' } },
            tankTypeId: { type: Number, key: 'forign', references: { table: "TankType", on: 'id' } },
            tankDeviceId: { type: Number, key: 'foreign', references: { table: "TankDevice", on: 'id' } },
            productId: { type: Number, key: 'foreign', references: { table: "Product", on: 'id' } },
            clientId: { type: Number, key: 'foreign', references: { table: "Client", on: 'id' } },
            createdAt: { type: Date, default: Date.now() },
            updatedAt: { type: Date, default: Date.now() },
            deletedAt: { type: Date, default: Date.now() }
        });
        this.options = options;
        // create a controller
        this.model.controller = new baseController_1.BaseController(this.options, 'Tank', this.model);
        // create a router
        this.model.router = new baseRouter_1.BaseRouter(this.model.controller);
        // initialize custom endpoints
        this.addCustomEndpoints();
    }
    // init all custom endpoints
    addCustomEndpoints() {
        console.log('create custom endpoints here!');
    }
}
exports.Tank = Tank;
