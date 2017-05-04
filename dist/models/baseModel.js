/*
    The base model for all other models to extend from
*/
"use strict";
const mongoose = require('mongoose');
//const Schema = mongoose.schema;
const postgres_wrapper_1 = require('../wrapper/postgres.wrapper');
class BaseModel {
    constructor(options, name, schema) {
        this.options = options;
        this.name = name;
        this.schema = schema;
        this.psql = new postgres_wrapper_1.PSQLWrapper(this.options, this.name);
        this.make(this.name, this.schema);
    }
    make(name, schema) {
        switch (this.options.dbType) {
            case 'mongo':
                // mongo
                let model = new mongoose.Schema(schema);
                this.model = mongoose.model(name, model);
                break;
            case 'postgres':
                this.buildTable(schema);
                this.model = {
                    controller: null,
                    router: null
                };
                break;
        }
        return this.model;
    }
    buildTable(schema) {
        if (this.options.dbType == 'mongo') {
        }
        else if (this.options.dbType == 'postgres') {
            this.psql.createTable(schema, (resp) => {
                //console.log('table', this.name, 'data', resp);
            });
        }
    }
}
exports.BaseModel = BaseModel;
