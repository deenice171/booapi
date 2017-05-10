import { Router, Request, Response, NextFunction } from 'express';
import { API } from '../api';

export class PSQLWrapper {

    client: any;

    constructor(private options: any, private table: any) {
        Object.assign(this, this.options);
        this.client = API.db;
    }

    connect(callback: Function) {
        this.client.connect((err: any, client: any, done: any) => {
            if (err) {
                console.log('err', err);
                return { errorCode: 500, errorMessage: err };
            }
            console.log('connected to postgres databaser....');
            callback(client, done);
        });
    }
    // callback is a function that takes a client as arguement and return a query result 
    exec(req: Request, res: Response, next: NextFunction, callback: Function) {
        // takes in client and done as arguements
        this.connect(callback);
    }

    query(query: String, callback: Function) {
        this.client.query(query, null, (err: any, resp: any) => {
            if (err) {
                callback(err); // TODO callback with both err and resp object
            } else {
                callback(resp);// TODO callback with both err and resp object
            }
        });
    }

    prepareCreate(props: Object) {
        const obj = props;
        let arr: Array<any> = [];
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                //console.log('objkehy', obj[key]);
                let type = obj[key].type != null ? obj[key].type : false,
                    unique = obj[key].unique != null ? obj[key].unique : false,
                    keyType = obj[key].key != null ? obj[key].key : false,
                    maxLength = obj[key].maxlength != null ? obj[key].maxlength : 100, // default to 50
                    defaultVal = obj[key].default != null ? obj[key].default : false,
                    foreignTable = obj[key].references != null ? obj[key].references.table : false,
                    foreignKey = obj[key].references != null ? obj[key].references.foreignKey : false,
                    onDelete = obj[key].onDelete != null ? obj[key].onDelete : false,
                    onUpdate = obj[key].onUpdate != null ? obj[key].onUpdate : false;
                //console.log('type', type, 'keyType', keyType);

                let str = ``;
                switch (true) {
                    case type == Number && (keyType === 'primary'):
                        arr.push(`"${key}" serial PRIMARY KEY`);
                        break;
                    case type == Number && (keyType === 'foreign'):
                        str = `"${key}" integer references "${foreignTable}"("${foreignKey}")`;
                        onDelete ? str += ` on delete ${onDelete}` : false;
                        onUpdate ? str += ` on update ${onUpdate}` : false;
                        unique ? str += ` unique`: false;
                        arr.push(str);
                        break;
                    case type == Number && (keyType == false):
                        str = `"${key}" integer`;
                        unique ? str += ` unique`: false;
                        arr.push(str);
                        break;
                    case type == String:
                        str = `"${key}" varchar(${maxLength})`;
                        unique ? str += ` unique`: false;
                        arr.push(str);
                        break;
                    case type == Boolean:
                        str = `"${key}" boolean default ${defaultVal}`;
                        unique ? str += ` unique`: false;
                        arr.push(str); //default to true
                        break;
                    case type == Date:
                        str = `"${key}" timestamp`;
                        unique ? str += ` unique`: false;
                        arr.push(str); //default to true
                        break;
                    default:
                        str = `"${key}" varchar(${maxLength})`;
                        unique ? str += ` unique`: false;
                        arr.push(str);
                        break;
                }
            }
        };
        return arr.join(',');
    }

    createTable(schema: any, callback: Function) {
        let checkIfExist = `select count(*) from pg_class where relname='${this.table}' and relkind='r'`
        this.query(checkIfExist, (resp: any) => {
            if (!resp) {
                return { error: `there were errors creating table: ${this.table}` };
            } else {
                let count = resp.rows[0].count;
                if (count == 1) {
                    console.log(`${this.table} exists...`);
                    callback({ errorCode: 500, errorMessage: `${this.table} already exists!` });
                } else {
                    // create the table because it does not exist... TODO
                    let createQuery = `create table "${this.table}"(${this.prepareCreate(schema)})`;
                    //console.log('createQuery', createQuery);
                    this.query(createQuery, (resp: any) => {
                        if (resp && resp.name == 'error') {
                            callback({ errorCode: 500, errorMessage: `${this.table} could not be created! Please check the schema specs.` });
                        } else {
                            callback({ statusCode: 200, message: `Success! Table ${this.table} was successfully created.` });
                        }
                    });
                }
            }
        });
    }

    getAll(req: Request, res: Response, next: NextFunction, callback: Function) {
        this.exec(req, res, next, (client: any, done: any) => {
            client.query(`SELECT * FROM "${this.table}" ORDER BY id ASC;`, (err: any, resp: any) => {
                done(err);
                if (err) {
                    return res.status(500).json({ statusCode: 500, errorMessage: err });
                } else {
                    //return res.json(resp.rows);
                    callback(resp.rows);
                }
            });
        });
    }

    findById(req: Request, res: Response, next: NextFunction, callback: Function) {
        this.exec(req, res, next, (client: any, done: any) => {
            client.query(`SELECT * FROM "${this.table}" WHERE id=${req.params.id};`, (err: any, resp: any) => {
                done(err);
                if (err) {
                    return res.status(500).json({ statusCode: 500, errorMessage: err });
                } else {
                    callback(resp.rows[0]);
                }
            });
        });
    }

    insert(req: Request, res: Response, next: NextFunction, callback: Function) {
        const payload = req.body;
        let attrs: string = '',
            values: string = '',
            i = 0,
            fields = Object.keys(payload);
        for (let key in payload) {
            attrs += `"${key}", `;
            values += `${this.convert(payload[key])}, `;
            i++;
        }
        //attrs = attrs.slice(0, attrs.length - 2);
        //values = values.slice(0, values.length - 2);
        attrs += `"created_at", "updated_at"`;
        values += `'${this.convertToUTCDate(new Date().toISOString())}',
                    '${this.convertToUTCDate(new Date().toISOString())}'`; // add createdAt
        //console.log('attr: ', attrs);
        //console.log('values ', values);
        let query = `INSERT into "${this.table}" (${attrs}) VALUES(${values}) RETURNING id;`;
        console.log('query', query);
        this.exec(req, res, next, (client: any, done: any) => {
            client.query(query, (err: any, resp: any) => {
                done(err);
                if (err) {
                    //console.log('err', err);
                    return res.status(500).json({ statusCode: 500, errorMessage: err });
                } else {
                    client.query(`SELECT * FROM "${this.table}" where id=${resp.rows[0].id}`, (err: any, resp: any) => {
                        done(err);
                        //console.log('resp', resp);
                        callback(resp.rows[0]);
                        //return res.json(resp.rows[0]);
                    });
                }
            });
        });
    }

    update(req: Request, res: Response, next: NextFunction, callback: Function) {
        const bundle = req.body;
        let keyValues = this.prepareObject(bundle);
        //console.log('keyValues', keyValues);
        let query = `UPDATE "${this.table}" SET ${keyValues} where id=${req.params.id};`;
        console.log('query', query);
        this.exec(req, res, next, (client: any, done: any) => {
            client.query(query, (err: any, resp: any) => {
                done(err);
                if (err) {
                    return res.status(500).json({ statusCode: 500, errorMessage: err });
                } else {
                    //console.log('resp from update', resp);
                    this.findById(req, res, next, (data: any) => {
                        // return res.json(data);
                        callback(data);
                    });
                }
            });
        });
    }

    getJoinType(joinOption: any) {
        switch (joinOption) {
            case 'inner_join':
                return 'INNER JOIN';
            case 'outer_join':
                return 'OUTER_JOIN';
            case 'left_outer_join':
                return 'LEFT OUTER JOIN';
            case 'cross_join':
                return 'CROSS JOIN';
            case 'full_outer_join':
                return 'FULL OUTER JOIN';
            default:
                return 'INNER JOIN';
        }
    }

    get(req: Request, res: Response, next: NextFunction, callback: Function) {
        let leftAlias = `_${this.table.toLowerCase()}`,
            query = `SELECT `,
            select: any = req.body.get != null ? this.prepareSelect(leftAlias, req.body.get) : false,
            join: any;

        let joinOption = '',
            arr: any = {
                item: [], option: []
            };
        switch (true) {
            case req.body.inner_join != null:
                joinOption = 'INNER JOIN';
                join = this.prepareJoins(leftAlias, req.body.inner_join, arr, []);
                break;
            case req.body.outer_join != null:
                joinOption = 'OUTER JOIN';
                join = this.prepareJoins(leftAlias, req.body.outer_join, arr, []);
                break;
            case req.body.left_outer_join != null:
                joinOption = 'LEFT OUTER JOIN';
                join = this.prepareJoins(leftAlias, req.body.left_outer_join, arr, []);
                break;
            case req.body.full_outer_join != null:
                joinOption = 'FULL OUTER JOIN';
                join = this.prepareJoins(leftAlias, req.body.full_outer_join, arr, []);
                break;
            case req.body.cross_join != null:
                joinOption = 'CROSS JOIN';
                join = this.prepareJoins(leftAlias, req.body.cross_join, arr, []);
                break;
            default:
                joinOption = 'INNER JOIN';
                join = false;
                break;
        }
        let where = req.body.where != null ? this.prepareWhere(leftAlias, req.body.where) : false,
            group = req.body.group != null ? this.prepareGroup(leftAlias, req.body.group, select, join) : false,
            sort = req.body.sort != null ? this.prepareSort(leftAlias, req.body.sort) : false,
            limit = req.body.limit != null ? req.body.limit : false;

        delete req.body.where;
        // console.log('typeof', typeof join);
        if (select[0] == "*") {
            query += `* ${join ? join.include : ''} FROM "${this.table}" as "${leftAlias}"`;
        } else {
            query += select + `${join ? join.include : ''} FROM "${this.table}" as "${leftAlias}"`;
        }
        join ? query += ` ${joinOption} ${join.query}` : false;
        where ? query += ` WHERE ${where}` : false;
        group ? query += ` GROUP BY ${group}` : false;
        sort ? query += ` ORDER BY ${sort}` : false;
        limit ? query += ` LIMIT ${limit}` : false;

        //console.log('query', query);
        this.exec(req, res, next, (client: any, done: any) => {
            client.query(query, (err: any, resp: any) => {
                done(err);
                if (err) {
                    return res.status(500).json({ statusCode: 500, errorMessage: err });
                } else {
                    callback(resp);
                }
            });
        });
    }

    updateSet(req: Request, res: Response, next: NextFunction, callback: Function) {
        const bundle = req.body;
        let leftAlias = `_${this.table.toLowerCase()}`,
            where = req.body.where != null ? this.prepareWhere(leftAlias, req.body.where) : false,
            keyValues = this.prepareObject(bundle),
            query = `UPDATE "${this.table}" as ${leftAlias} SET ${keyValues} WHERE ${where} RETURNING id;`;
        delete req.body.where;
        console.log('query', query);
        this.exec(req, res, next, (client: any, done: any) => {
            client.query(query, (err: any, resp: any) => {
                done(err);
                console.log('here.........');
                if (err) {
                    return res.status(500).json({ statusCode: 500, errorMessage: err });
                } else {
                    let affectedRows = resp.rows.map((row: any) => {
                        return row.id;
                    });
                    console.log('affectedRows', affectedRows);
                    // if more than one record is affected, find and return all the records
                    if (affectedRows.length > 0) {
                        this.query(`SELECT * FROM "${this.table}" WHERE id in (${affectedRows})`, (data: any) => {
                            console.log(data);
                            callback(data.rows);
                        });
                    } else {
                        callback({ result: `No records affected!` }); // empty array
                    }

                }
            });
        });
    }

    delete(req: Request, res: Response, next: NextFunction, callback: Function) {
        this.exec(req, res, next, (client: any, done: any) => {
            client.query(`DELETE FROM "${this.table}" WHERE id=${req.params.id};`, (err: any, resp: any) => {
                done(err);
                if (err) {
                    return res.status(500).json({ statusCode: 500, errorMessage: err });
                } else {
                    callback(resp);
                }
            });
        });
    }

    convert(value: any) {
        if (value != null) {
            let isArray = value.constructor === Array;
            if (isArray) {
                return `'${value.join()}'`; // turn array of string into a single comma separated string.
            } else {
                switch (typeof value) {
                    case 'number':
                        return parseInt(value);
                    case 'string':
                        return `'${value.trim()}'`;
                    case 'object':
                        return value;
                    case 'boolean':
                        return value;
                    case null:
                        return null;
                    default:
                        return value;
                }
            }
        } else {
            return value;
        }

    }

    // split object into key vaule string
    prepareObject(props: Object) {
        const obj = props;
        let arr: Array<any> = [];
        for (let key in obj) {
            console.log('hey', key);
            if (obj.hasOwnProperty(key) && key != 'where') {
                arr.push(`"${key}"=${this.convert(obj[key])}`);
            }
        }
        return arr.join(',');
    }

    prepareSelect(leftAlias: string, array: Array<string>) {
        let arr: Array<any> = [];
        if (array[0] == "*") {
            arr.push(`"${leftAlias}".${array[0]}`);
        } else {
            for (let i in array) {
                if (array.hasOwnProperty(i)) {
                    arr.push(`"${leftAlias}"."${array[i]}"`);
                }
            };
        }
        return arr.join(', ');
    }

    prepareWhere(leftAlias: string, props: Object) {
        const obj = props;
        let arr: Array<any> = [];
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                arr.push(`"${leftAlias}"."${key}"=${this.convert(obj[key])}`);
            }
        };
        return arr.join(' AND ');
    }

    prepareGroup(leftAlias: string, props: Object, select: string, join: Object) {
        const obj = props;
        let arr: Array<any> = [],
            selected = select.split(', ');
        for (let i in obj) {
            if (obj.hasOwnProperty(i)) {
                arr.push(`"${leftAlias}"."${obj[i]}"`);
            }
        };
        arr.filter((item) => {
            return selected.indexOf(item);
        });
        return arr.join(', ');
    }

    prepareSort(leftAlias: string, props: Object) {
        const obj = props;
        let arr: Array<any> = [];
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                arr.push(`"${leftAlias}"."${key}" ${obj[key]}`);
            }
        };
        return arr.join(', ');
    }

    prepareJoins(leftAlias: string, joins: Array<Object>, arr: Object, inc: Array<any>) {

        joins.forEach((props) => {
            this.prepareJoin(leftAlias, props, arr, inc);
        });
        let query = arr['item'].join(` LEFT OUTER JOIN `);
        // let test = arr['item'].map((join:any, index:number, array:Array<any>) => {
        // console.log('i', join);
        // return join + ` ${arr['option'][index]} `
        //});
        //console.log('test', test);
        let include = inc.join(' ');

        return {
            query: query,
            include: include
        }

    }
    prepareJoin(leftAlias: string, props: Object, arr: Object, inc: Array<any>) {
        const obj = props;
        // let arr: Array<any> = [];
        console.log('obj', obj);
        let table = Object.keys(obj)[0];
        let alias = `_${table.toLowerCase()}`;
        let as = obj['as'];

        arr['item'].push(`"${table}" as "${alias}" ON ("${alias}"."${obj[table]}"="${leftAlias}"."${obj['on']}")`);
        inc.push(`, json_agg("${alias}".*) AS "${as}"`);
        // arr['option'].push("LEFT OUTER JOIN");
        for (let key in obj) {
            if (obj.hasOwnProperty(key) && key == "inner_join") {
                // console.log("from obj[key]", obj[key]);
                arr['option'].push(this.getJoinType(key));
                this.prepareJoin(alias, obj[key], arr, inc);
            } else {

            }
        };
        // arr['option'] = 'LEFT OUTER JOIN';
        // console.log('arr', arr);
        // let query = arr.join(' LEFT OUTER JOIN ');
        // let include = inc.join(' ');
        return {
            arr: arr,
            inc: inc
        }

    }

    convertToUTCDate(date: string) {
        let dateInput = date || null,
            dateOutput: string;
        if (dateInput != null) {
            dateOutput = dateInput.slice(0, dateInput.indexOf('T'));
        }
        return dateOutput;
    }

}