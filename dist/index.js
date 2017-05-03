"use strict";
const api_1 = require('./api');
const express = require('express');
//debug('ts-express:server');
const connectionString = process.env.DB_CONN || 'postgres://postgres:Mai2Lucas@localhost:5432/sales-specialty-lucas';
//const connectionString = process.env.DB_CONN || 'mongodb://localhost/bookAPI';
let port = process.env.PORT || 3000;
/*
let options = {
  dbType: 'mongo',
  dbName: 'bookAPI',
  user: '',
  password: '',
  host: 'localhost',
  port: 27017,
  connectionString:connectionString
};
*/
let options = {
    dbType: 'postgres',
    dbName: 'sales-specialty-lucas',
    user: 'postgres',
    password: 'Mai2Lucas',
    host: 'localhost',
    port: 5432,
    connectionString: connectionString
};
let api = new api_1.API(express(), port, options);
api.spawn();
console.log(`listening on port ${port}`);
