/*
    An example model with custom controller methods override
    and router extensions
*/
"use strict";
const baseModel_1 = require('./baseModel');
const baseController_1 = require('../controllers/baseController');
const baseRouter_1 = require('../routes/baseRouter');
class Tank extends baseModel_1.BaseModel {
    constructor(options, name) {
        // call the super class and create the model
        super(options, name, {
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
        this.options = options;
        this.name = name;
        // create a controller
        this.model.controller = new baseController_1.BaseController(this.options, this.name, this.model);
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
