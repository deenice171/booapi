"use strict";
const baseModel_1 = require('./baseModel');
const baseController_1 = require('../controllers/baseController');
const baseRouter_1 = require('../routes/baseRouter');
class Book extends baseModel_1.BaseModel {
    constructor(options) {
        // call the super class and create the model
        super(options, 'Book', {
            id: { type: Number, key: 'primary' },
            title: { type: String, maxlength: 24 },
            author: { type: String, maxlength: 24 },
            genre: { type: String, maxlength: 24 },
            read: { type: Boolean, default: true },
            noteId: {
                type: Number,
                key: 'foreign',
                references: { table: 'Note', foreignKey: 'id' },
                onDelete: 'cascade',
                onUpdate: 'cascade'
            },
            createdAt: { type: Date },
            updatedAt: { type: Date },
            deletedAt: { type: Date }
        });
        this.options = options;
        // override controller methods here
        this.getRead = (req, res, next) => {
            this.model.find({ read: true }, (err, resp) => {
                if (!err) {
                    res.json(resp);
                }
                else {
                    res.status(500).send(err);
                }
            });
        };
        this.toggleRead = (req, res, next) => {
            this.model.findById(req.params.id, (err, resp) => {
                if (err) {
                    res.status(500).send(this.model.controller.sendError(500, err));
                }
                else if (resp) {
                    let read = !resp.read;
                    this.model.update({ _id: req.params.id }, { $set: { read: read } }, (err, book) => {
                        if (book) {
                            book.read = resp.read;
                            res.status(200).send(resp);
                        }
                        else {
                            res.status(404).send(this.model.controller.sendError(404, err));
                        }
                    });
                }
                else {
                    res.status(404).send(this.model.controller.sendError(404, err));
                }
            });
        };
        // create a controller
        this.model.controller = new baseController_1.BaseController(this.options, 'Book', this.model);
        // create a router
        this.model.router = new baseRouter_1.BaseRouter(this.model.controller);
        // initialize custom endpoints
        this.addCustomEndpoints();
    }
    // init all custom endpoints
    addCustomEndpoints() {
        this.model.router.extend('/read', 'GET', this.getRead);
        this.model.router.extend('/id/:id/read/toggle', 'GET', this.toggleRead);
    }
}
exports.Book = Book;
