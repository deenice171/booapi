"use strict";
const api_1 = require('./api');
const express = require('express');
const connectionString = process.env.DB_CONN;
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
    dbName: process.env.dbName,
    user: process.env.dbUser,
    password: process.env.dbPassword,
    host: 'localhost',
    port: 5432,
    connectionString: connectionString
};
let api = new api_1.API(express(), port, options);
api.spawn();
console.log(`listening on port ${port}`);
