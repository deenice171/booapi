"use strict";
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bookModel_1 = require('./models/bookModel');
//let bookController = new BaseController(new Book().model);
//const heroRoutes = new BaseRouter(bookController);
console.log('Book', bookModel_1.Book);
// Creates and configures an ExpressJS web server.
class API {
    // ref to Express instance
    //  public express: express.Application;
    //Run configuration methods on the Express instance.
    constructor(app, port, options) {
        this.app = app;
        this.port = port;
        this.options = options;
        // app = express();
        this.configureDatabase(options.db);
        this.configureMiddleware(app);
        this.configureRoutes(app);
    }
    configureDatabase(db) {
        switch (db) {
            case 'mongo':
                mongoose.connect("mongodb://localhost/bookAPI");
                break;
            case 'postgresql':
                break;
            case 'mysql':
                break;
            case 'sql-server':
                break;
            default:
                //console.log('database default to postgresql');
                break;
        }
        // console.log('todo configuring databaser...... db: ', db);
    }
    configureMiddleware(app) {
        app.use(logger('dev'));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));
    }
    configureRoutes(app) {
        let router = express.Router();
        // placeholder route handler
        router.get('/', (req, res, next) => {
            res.json({
                message: 'Hello World!'
            });
        });
        app.use('/', router);
        //console.log('heroRoutes------>', heroRoutes);
        // let hRouter = heroRoutes.make();
        //let b = new Book();
        app.use('/api/v1/stuff', new bookModel_1.Book().model.router.make());
        // more api endpoints below....
    }
    run() {
        this.app.listen(this.port);
    }
}
exports.API = API;
//export default new App().express;
