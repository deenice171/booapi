/*
    The base router that all other router extends from
*/

import { Router, Request, Response, NextFunction } from 'express';
import { BaseController } from '../controllers/base.controller';

export class BaseRouter {

    router: Router

    constructor(public controller: BaseController) {
        this.router = Router();
    }

    make() {
        this.router.use('/id/:id', this.controller.findByIdInterceptor);

        this.router.route('/')
            .get(this.controller.getAll)
            .post(this.controller.insert);

        this.router.route('/id/:id')
            .get(this.controller.findById)
            .put(this.controller.update)
            .delete(this.controller.remove);

        this.router.route('/update') // update anything
            .post(this.controller.updateSet);

        this.router.route('/get') // get anything
            .post(this.controller.get);

        return this.router;
    }

    extend(endpoint: string, method: string, controllerCallback: any) {
        switch (method.toLowerCase()) {
            case 'post':
                this.router.route(endpoint).post(controllerCallback);
                break;
            case 'get':
                this.router.route(endpoint).get(controllerCallback);
                break;
            default:
                this.router.route(endpoint).get(controllerCallback);
                break;
        }
    }

}

