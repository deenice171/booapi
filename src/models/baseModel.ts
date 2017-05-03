//import * as mongoose from "mongoose";
import { Router, Request, Response, NextFunction } from 'express';
import { BaseController } from '../controllers/baseController';
import { BaseRouter } from '../routes/baseRouter';

const mongoose = require('mongoose');
const Schema = mongoose.schema;

import { PSQLWrapper } from '../wrapper/postgres.wrapper';

interface IModel {
    controller: BaseController;
    router: BaseRouter;
}

export class BaseModel {

    model: IModel;
    //name:string;
    psql:PSQLWrapper;

    constructor(
        public options: any,
        public name: string,
        private schema: any) {
        // this.name = name;
        this.psql = new PSQLWrapper(this.options, this.name);
        this.make(this.name, this.schema);
    }

    make(name: any, schema: any) {
        switch (this.options.dbType) {
            case 'mongo':
                // mongo
                let model = new mongoose.Schema(schema);
                this.model = mongoose.model(name, model);
                //console.log('this.model..........', this.model);
                break;

            case 'postgres':
                //SELECT to_regclass('schema_name.table_name');
                this.buildTable(schema);
                this.model = {
                    controller:null,
                    router:null
                };
                break;
        }

        return this.model;
    }

     buildTable(schema:any) {
        if (this.options.dbType == 'mongo') {
            // do nothing because it is managed by mongoose
        } else if (this.options.dbType == 'postgres') {
            this.psql.createTable(schema, (resp: any) => {
                console.log('table', this.name, 'data', resp);
            });
        }
    }

}
