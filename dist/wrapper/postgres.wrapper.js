"use strict";
const pg = require('pg');
const api_1 = require('../api');
class PSQLWrapper {
    constructor(options, table) {
        this.options = options;
        this.table = table;
        Object.assign(this, this.options);
        console.log('table=====-====>', table);
        // this.client = new pg.Client(this.options.connectionString);
        this.client = api_1.API.db;
    }
    connect(callback) {
        this.client.connect((err, client, done) => {
            if (err) {
                console.log('err', err);
                return { errorCode: 500, errorMessage: err };
            }
            console.log('connected to postgres databaser....');
            callback(client, done);
        });
    }
    // callback is a function that takes a client as arguement and return a query result 
    exec(req, res, next, callback) {
        // takes in client and done as arguements
        this.connect(callback);
    }
    query(query, callback) {
        this.client.query(query, null, (err, resp) => {
            if (err) {
                callback(err); // TODO callback with both err and resp object
            }
            else {
                // console.log('from query resp', resp);
                //return res.json(resp.rows);
                callback(resp); // TODO callback with both err and resp object
            }
        });
    }
    prepareCreate(props) {
        const obj = props;
        let arr = [];
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                //console.log('objkehy', obj[key]);
                let type = obj[key].type != null ? obj[key].type : false;
                let keyType = obj[key].key != null ? obj[key].key : false;
                let maxLength = obj[key].maxlength != null ? obj[key].maxlength : 100; // default to 50
                let defaultVal = obj[key].default != null ? obj[key].default : false;
                let foreignTable = obj[key].references != null ? obj[key].references.table : false;
                let foreignKey = obj[key].references != null ? obj[key].references.foreignKey : false;
                let onDelete = obj[key].onDelete != null ? obj[key].onDelete : false;
                let onUpdate = obj[key].onUpdate != null ? obj[key].onUpdate : false;
                //console.log('type', type, 'keyType', keyType);
                switch (true) {
                    case type == Number && (keyType === 'primary'):
                        arr.push(`"${key}" serial PRIMARY KEY`);
                        break;
                    case type == Number && (keyType === 'foreign'):
                        let foreign = `"${key}" integer references "${foreignTable}"("${foreignKey}")`;
                        onDelete ? foreign += ` on delete ${onDelete}` : false;
                        onUpdate ? foreign += ` on update ${onUpdate}` : false;
                        arr.push(foreign);
                        break;
                    case type == Number && (keyType == false):
                        arr.push(`"${key}" integer`);
                        break;
                    case type == String:
                        arr.push(`"${key}" varchar(${maxLength})`);
                        break;
                    case type == Boolean:
                        arr.push(`"${key}" boolean default ${defaultVal}`); //default to true
                        break;
                    case type == Date:
                        arr.push(`"${key}" timestamp`); //default to true
                        break;
                    default:
                        arr.push(`"${key}" varchar(${maxLength})`);
                        break;
                }
            }
        }
        ;
        let result = arr.join(',');
        return result;
    }
    createTable(schema, callback) {
        let checkIfExist = `select count(*) from pg_class where relname='${this.table}' and relkind='r'`;
        this.query(checkIfExist, (resp) => {
            if (!resp) {
                return { error: `there were errors creating table: ${this.table}` };
            }
            else {
                //console.log('resp', resp);
                //return res.json(resp.rows);
                let exist = resp.rows[0].count;
                if (exist == 1) {
                    console.log(`${this.table} exists...`);
                    callback({ errorCode: 500, errorMessage: `${this.table} already exists!` });
                }
                else {
                    // create the table because it does not exist... TODO
                    let createQuery = `create table "${this.table}"(${this.prepareCreate(schema)})`;
                    //console.log('createQuery', createQuery);
                    this.query(createQuery, (resp) => {
                        console.log('resp', resp.name);
                        if (resp && resp.name == 'error') {
                            callback({ errorCode: 500, errorMessage: `${this.table} could not be created! Please check the schema specs.` });
                        }
                        else {
                            callback({ statusCode: 200, message: `Success! Table ${this.table} was successfully created.` });
                        }
                    });
                }
            }
        });
    }
    getAll(req, res, next, callback) {
        this.exec(req, res, next, (client, done) => {
            client.query(`SELECT * FROM "${this.table}" ORDER BY id ASC;`, (err, resp) => {
                done(err);
                if (err) {
                    return res.status(500).json({ statusCode: 500, errorMessage: err });
                }
                else {
                    console.log('from getAll resp', resp);
                    //return res.json(resp.rows);
                    callback(resp.rows);
                }
            });
        });
    }
    findById(req, res, next, callback) {
        this.exec(req, res, next, (client, done) => {
            client.query(`SELECT * FROM "${this.table}" WHERE id=${req.params.id};`, (err, resp) => {
                //callback(query);
                done(err);
                if (err) {
                    return res.status(500).json({ statusCode: 500, errorMessage: err });
                }
                else {
                    // console.log('from findById resp', resp);
                    // req[this.table] = resp.rows[0]; // findByIdIntereptor
                    callback(resp.rows[0]);
                }
            });
        });
    }
    insert(req, res, next, callback) {
        // console.log('from postgres.wrapper insert function req.body: ', req.body);
        const payload = req.body;
        console.log('payload', payload);
        let attrs = '';
        let values = '';
        let i = 0;
        let fields = Object.keys(payload);
        for (let key in payload) {
            //console.log('key', key, fields.length - 1, 'i', i);
            attrs += `"${key}", `;
            values += `${this.convert(payload[key])}, `;
            //  console.log('tyoeof value = ', typeof payload[key]);
            i++;
        }
        //attrs = attrs.slice(0, attrs.length - 2);
        //values = values.slice(0, values.length - 2);
        attrs += `"createdAt", "updatedAt"`;
        values += `'${this.convertToUTCDate(new Date().toISOString())}',
                    '${this.convertToUTCDate(new Date().toISOString())}'`; // add createdAt
        console.log('attr: ', attrs);
        console.log('values ', values);
        this.exec(req, res, next, (client, done) => {
            client.query(`INSERT into "${this.table}" (${attrs}) VALUES(${values}) RETURNING id;`, (err, resp) => {
                done(err);
                if (err) {
                    console.log('err', err);
                    return res.status(500).json({ statusCode: 500, errorMessage: err });
                }
                else {
                    client.query(`SELECT * FROM "${this.table}" where id=${resp.rows[0].id}`, (err, resp) => {
                        done(err);
                        console.log('resp', resp);
                        callback(resp.rows[0]);
                        //return res.json(resp.rows[0]);
                    });
                }
            });
        });
    }
    update(req, res, next, callback) {
        const bundle = req.body;
        let keyValues = this.prepareObject(bundle);
        //console.log('keyValues', keyValues);
        let query = `UPDATE "${this.table}" SET ${keyValues} where id=${req.params.id};`;
        console.log('query', query);
        this.exec(req, res, next, (client, done) => {
            client.query(query, (err, resp) => {
                done(err);
                if (err) {
                    return res.status(500).json({ statusCode: 500, errorMessage: err });
                }
                else {
                    console.log('resp from update', resp);
                    this.findById(req, res, next, (data) => {
                        // return res.json(data);
                        callback(data);
                    });
                }
            });
        });
    }
    getJoinType(joinOption) {
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
    get(req, res, next, callback) {
        let leftAlias = `_${this.table.toLowerCase()}`;
        let query = `SELECT `;
        let select = req.body.get != null ? this.prepareSelect(leftAlias, req.body.get) : false;
        let join;
        let joinOption = '';
        let arr = {
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
        let where = req.body.where != null ? this.prepareWhere(leftAlias, req.body.where) : false;
        let group = req.body.group != null ? this.prepareGroup(leftAlias, req.body.group, select, join) : false;
        let sort = req.body.sort != null ? this.prepareSort(leftAlias, req.body.sort) : false;
        let limit = req.body.limit != null ? req.body.limit : false;
        delete req.body.where;
        console.log('typeof', typeof join);
        console.log('JOINNNNNNNN NNN------>', joinOption);
        if (select[0] == "*") {
            query += `* ${join ? join.include : ''} FROM "${this.table}" as "${leftAlias}"`;
        }
        else {
            query += select + `${join ? join.include : ''} FROM "${this.table}" as "${leftAlias}"`;
        }
        if (join) {
            query += ` ${joinOption} ${join.query}`;
        }
        if (where) {
            query += ` WHERE ${where}`;
        }
        if (group) {
            query += ` GROUP BY ${group}`;
        }
        if (sort) {
            query += ` ORDER BY ${sort}`;
        }
        if (limit) {
            query += ` LIMIT ${limit}`;
        }
        console.log('query', query);
        this.exec(req, res, next, (client, done) => {
            client.query(query, (err, resp) => {
                done(err);
                if (err) {
                    return res.status(500).json({ statusCode: 500, errorMessage: err });
                }
                else {
                    callback(resp);
                }
            });
        });
    }
    updateSet(req, res, next, callback) {
        let leftAlias = `_${this.table.toLowerCase()}`;
        let where = req.body.where != null ? this.prepareWhere(leftAlias, req.body.where) : false;
        delete req.body.where;
        const bundle = req.body;
        let keyValues = this.prepareObject(bundle);
        let query = `UPDATE "${this.table}" as ${leftAlias} SET ${keyValues} WHERE ${where} RETURNING id;`;
        console.log('query', query);
        this.exec(req, res, next, (client, done) => {
            client.query(query, (err, resp) => {
                done(err);
                if (err) {
                    return res.status(500).json({ statusCode: 500, errorMessage: err });
                }
                else {
                    //let affected = resp.rows;
                    let affectedRows = resp.rows.map((row) => {
                        return row.id;
                    });
                    this.query(`SELECT * FROM "${this.table}" WHERE id in (${affectedRows})`, (data) => {
                        console.log('data from updateSet..');
                        callback(data);
                    });
                }
            });
        });
    }
    delete(req, res, next, callback) {
        this.exec(req, res, next, (client, done) => {
            client.query(`DELETE FROM "${this.table}" WHERE id=${req.params.id};`, (err, resp) => {
                done(err);
                if (err) {
                    return res.status(500).json({ statusCode: 500, errorMessage: err });
                }
                else {
                    callback(resp);
                }
            });
        });
    }
    convert(value) {
        let isArray = value.constructor === Array;
        if (isArray) {
            return `'${value.join()}'`; // turn array of string into a single comma separated string.
        }
        else {
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
    }
    // split object into key vaule string
    prepareObject(props) {
        const obj = props;
        let arr = [];
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                arr.push(`"${key}"=${this.convert(obj[key])}`);
            }
        }
        ;
        let result = arr.join(',');
        // console.log(result);
        return result;
    }
    prepareSelect(leftAlias, array) {
        let arr = [];
        if (array[0] == "*") {
            arr.push(`"${leftAlias}".${array[0]}`);
        }
        else {
            for (let i in array) {
                if (array.hasOwnProperty(i)) {
                    arr.push(`"${leftAlias}"."${array[i]}"`);
                }
            }
            ;
        }
        let result = arr.join(', ');
        //  console.log(result);
        return result;
    }
    prepareWhere(leftAlias, props) {
        const obj = props;
        let arr = [];
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                arr.push(`"${leftAlias}"."${key}"=${this.convert(obj[key])}`);
            }
        }
        ;
        let result = arr.join(' AND ');
        // console.log(result);
        return result;
    }
    prepareGroup(leftAlias, props, select, join) {
        const obj = props;
        let arr = [];
        console.log('select', select, 'join', join['include']);
        let selected = select.split(', ');
        console.log('selected', selected);
        for (let i in obj) {
            if (obj.hasOwnProperty(i)) {
                arr.push(`"${leftAlias}"."${obj[i]}"`);
            }
        }
        ;
        arr.filter((item) => {
            return selected.indexOf(item);
        });
        console.log('arr', arr);
        let result = arr.join(', ');
        console.log(result);
        return result;
    }
    prepareSort(leftAlias, props) {
        const obj = props;
        let arr = [];
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                arr.push(`"${leftAlias}"."${key}" ${obj[key]}`);
            }
        }
        ;
        let result = arr.join(', ');
        //  console.log(result);
        return result;
    }
    prepareJoins(leftAlias, joins, arr, inc) {
        console.log('from prepareJoins', joins);
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
        };
    }
    prepareJoin(leftAlias, props, arr, inc) {
        const obj = props;
        // let arr: Array<any> = [];
        console.log('obj', obj);
        let table = Object.keys(obj)[0];
        let alias = `_${table.toLowerCase()}`;
        arr['item'].push(`"${table}" as "${alias}" ON ("${alias}"."${obj[table]}"="${leftAlias}"."${obj['on']}")`);
        inc.push(`, json_agg("${alias}".*) AS "${table}"`);
        // arr['option'].push("LEFT OUTER JOIN");
        for (let key in obj) {
            if (obj.hasOwnProperty(key) && key == "inner_join") {
                // console.log("from obj[key]", obj[key]);
                arr['option'].push(this.getJoinType(key));
                this.prepareJoin(alias, obj[key], arr, inc);
            }
            else {
            }
        }
        ;
        // arr['option'] = 'LEFT OUTER JOIN';
        // console.log('arr', arr);
        // let query = arr.join(' LEFT OUTER JOIN ');
        // let include = inc.join(' ');
        return {
            arr: arr,
            inc: inc
        };
    }
    convertToUTCDate(date) {
        let dateInput = date || null, dateOutput;
        if (dateInput != null) {
            dateOutput = dateInput.slice(0, dateInput.indexOf('T'));
        }
        return dateOutput;
    }
}
exports.PSQLWrapper = PSQLWrapper;
