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
                        unique ? str += ` unique` : false;
                        arr.push(str);
                        break;
                    case type == Number && (keyType == false):
                        str = `"${key}" integer`;
                        unique ? str += ` unique` : false;
                        arr.push(str);
                        break;
                    case type == String:
                        str = `"${key}" varchar(${maxLength})`;
                        unique ? str += ` unique` : false;
                        arr.push(str);
                        break;
                    case type == Boolean:
                        str = `"${key}" boolean default ${defaultVal}`;
                        unique ? str += ` unique` : false;
                        arr.push(str); //default to true
                        break;
                    case type == Date:
                        str = `"${key}" timestamp`;
                        unique ? str += ` unique` : false;
                        arr.push(str); //default to true
                        break;
                    default:
                        str = `"${key}" varchar(${maxLength})`;
                        unique ? str += ` unique` : false;
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

    get(req: Request, res: Response, next: NextFunction, callback: Function) {
        let leftAlias = `_${this.table.toLowerCase()}`,
            query = `SELECT `,
            select: any = req.body.get != null ? this.prepareSelect(leftAlias, req.body.get) : false,
            join: any;

        let options: Object = {
            query: [],
            joinType: [],
            where: [],
            group: []
        },
            includes: Array<string> = [];

        if (req.body.join != null) {
            // joinOption = req.body.join[0].joinType;
            join = this.prepareJoins(leftAlias, req.body.join, options, includes);
        }
        let where: string = '',
            group: string = '',
            sort: string = '',
            limit: number = null;

        req.body.where != null ? where = this.prepareWhere(leftAlias, req.body.where) : false,
            req.body.group != null ? group = this.prepareGroup(leftAlias, req.body.group, select) : false,
            req.body.sort != null ? sort = this.prepareSort(leftAlias, req.body.sort) : false,
            req.body.limit != null ? limit = req.body.limit : false;

        if (join.group && group.length > 0) {
            group += `,${join.group}`;
        } else if (join.group) {
            group += `${join.group}`
        }
        //join.group && group.length > 0 ? group += `,${join.group}` : false;
        //join.group && group.length > 0 ? group += `,${join.group}` : false;
        delete req.body.where;

        if (select[0] == "*") {
            query += `* ${join ? join.include : ''} FROM "${this.table}" as "${leftAlias}"`;
        } else {
            query += select + `${join ? join.include : ''} FROM "${this.table}" as "${leftAlias}"`;
        }

        join ? query += ` ${join.query}` : false;
        where ? query += ` WHERE ${where}` : false;
        join.where.length > 0 ? query += ` AND ${join.where}` : false;
        group ? query += ` GROUP BY ${group}` : false;
        sort ? query += ` ORDER BY ${sort}` : false;
        limit ? query += ` LIMIT ${limit}` : false;

        console.log('query', query);
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

    prepareOnClause(array: Array<Object>) {
        //const arr = array;
        let arr: Array<any> = [];
        for (let item in array) {
            let obj = array[item];
            //console.log('obj------>', obj);
            let table1 = Object.keys(obj)[0];
            let table2 = Object.keys(obj)[1];
            let table1Key = obj[table1];
            let table2Key = obj[table2];
            arr.push(`"_${table1.toLowerCase()}"."${table1Key}"="_${table2.toLowerCase()}"."${table2Key}"`);
        }
        //let onClause = ` AND ` + arr.join(' AND ');
        //console.log('onCluase from lll', onClause);
        // return onClause;
        //arr = arr.join(' AND ');
        return arr.join(' AND ');

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

    prepareGroup(leftAlias: string, props: Object, select: string) {
        const obj = props;
        let arr: Array<any> = [],
            selected = select.split(', '),
            output: string = '';
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

    prepareJoins(leftAlias: string, joins: Array<Object>, options: Object, includes: Array<any>) {

        joins.forEach((props) => {
            this.prepareJoin(leftAlias, props, options, includes);
        });
        let query = options['query'].join(` `);
        let where: string = ``;
        let group: string = ``;

        //options['where'].length > 0 ? where += ` AND ` : false;
        options['where'].length > 0 ? where += options['where'].join(` AND `) : false;
        options['group'].length > 0 ? group += options['group'].join(`, `) : false;
        console.log('group', options['group']);
        //let where = options['where'].join(` `);
        // let test = options['item'].map((join:any, index:number, array:Array<any>) => {
        // console.log('i', join);
        // return join + ` ${options['option'][index]} `
        //});
        //console.log('where', where);

        let include = includes.join('');

        return {
            query: query,
            include: include,
            where: where,
            group: group
        }

    }
    prepareJoin(leftAlias: string, props: Object, options: Object, includes: Array<any>) {
        const obj = props;
        // let arr: Array<any> = [];
        //console.log('obj', obj);
        //let table = Object.keys(obj)[0];
        //console.log('include.....', obj['include']);
        let count = options['query'].length;

        let table: string = obj['table'];
        let include: boolean = obj['include'] != null ? obj['include'] : true;
        let joinType: string = obj['joinType'] != null ? obj['joinType'] : "INNER JOIN";
        let foreignKey: any = obj['foreignKey'] != null ? obj['foreignKey'] : false;
        let alias: string = `_${table.toLowerCase()}`;
        let asProp: string = obj['as'];
        let on: Array<Object> = obj['on'];
        let where: string = '';
        let get: string;
        let onClause: string = '';
        let returnType = obj['returnType'] != null ? obj['returnType'] : 'array';
        let needSubQuery: boolean = obj['get'] != null && obj['get'][0] != "*";
        let group = obj['group'] != null ? obj['group'] : [];

        //on != null ? onClause = this.prepareOnClause(on) : false;
        if (on != null) {
            onClause = this.prepareOnClause(on);
            if (foreignKey) {
                onClause = `"${leftAlias}"."id"="${alias}"."${foreignKey}" AND ` + onClause;
            }
        } else {
            onClause = `"${leftAlias}"."id"="${alias}"."${foreignKey}"`;
        }
        //foreignKey ? onClause = `"${leftAlias}"."id"="${alias}"."${foreignKey}" AND ` + onClause : false;
        get = needSubQuery ? this.prepareSelect(alias, obj['get']) : returnType == 'array' ? `DISTINCT "${alias}".*` : ` "${alias}".*`;
        obj['where'] != null ? where = this.prepareWhere(alias, obj['where']) : false; // optional
        //console.log('onClause', onClause);

        let query = `${joinType} "${table}" as "${alias}" ON (${onClause.length > 0 ? onClause : ''})`;
        options['query'].push(`${joinType} "${table}" as "${alias}" ON (${onClause.length > 0 ? onClause : ''} )`);

        needSubQuery ? options['group'].push(this.prepareGroup(alias, group, get)) : false;
        obj['where'] != null ? options['where'].push(`${where}`) : false;
        console.log('where from asdfasdfasdfasdf', where.length);
        let subsWhere = where.length > 0 ? ` WHERE ` + where : '';
        let subs: string = needSubQuery ? `(select view from (select ${get} from "${table}" ${subsWhere} limit 1 ) as view)` : '';
        //console.log('onclude -------', include);
        console.log('subswhere', subsWhere);
        if (include) {
            if (returnType == 'object') {
                !needSubQuery ? includes.push(`, row_to_json(${get}, true) AS "${asProp}"`) : includes.push(`, row_to_json(${subs}, true) AS "${asProp}"`);
                options['group'].push(`"${alias}".*`);
            } else if (returnType == 'array') {
                !needSubQuery ? includes.push(`, json_agg(${get}) AS "${asProp}"`) : includes.push(`, json_agg(${subs}) AS "${asProp}"`);
                //options['group'].push(`"${alias}".*`);
            }
        }

        //console.log('get', get);
        // arr['option'].push("LEFT OUTER JOIN");
        for (let key in obj) {
            if (obj.hasOwnProperty(key) && key == "join") {
                // console.log("from obj[key]", obj[key]);
                // arr['type'].push(this.getJoinType(key));
                /*
                let joinOn: Array<Object> = obj[key]['on'];
                let joinOnClause: string = '';
                let joinAlias: string = `_${obj[key].table.toLowerCase()}`;

                if (joinOn != null) {
                    joinOnClause = this.prepareOnClause(joinOn);
                    if (obj[key].foreignKey) {
                        joinOnClause = `"${alias}"."id"="${joinAlias}"."${obj[key].foreignKey}" AND ` + joinOnClause;
                    }
                } else {
                    joinOnClause = `"${alias}"."id"="${joinAlias}"."${obj[key].foreignKey}"`;
                }

                let joinQuery = `${obj[key].joinType} "${obj[key].table}" as "${joinAlias}" ON (${joinOnClause.length > 0 ? joinOnClause : ''})`;

                console.log('form llooooop....', options['query']);
                query = `(${query} ${joinQuery})`;
                options['query'].push(query);
                console.log('after transforem', options['query']);
                */
                options['joinType'].push(obj[key].joinType);
                this.prepareJoin(alias, obj[key], options, includes);

            } else {
            }
        };
        //console.log("options['query'].length", options['query'].length,  " count: ", count);
        //if (count > options['query'].length) { // looped and inserted a query

        // } else {
        // console.log('insertting------>',`${joinType} "${table}" as "${alias}" ON (${onClause.length > 0 ? onClause : ''} )`);
        // options['query'].push(`${joinType} "${table}" as "${alias}" ON (${onClause.length > 0 ? onClause : ''} )`);
        // }

        //console.log('index', count);
        //console.log('test', options['query']);
        //arr['joinType'] = joinType;
        // console.log('arr', arr);
        //console.log('arr.joinType', options['joinType']);
        // let query = arr.join(' LEFT OUTER JOIN ');
        // let include = inc.join(' ');
        return {
            options: options, // query, joinType, where
            includes: includes
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