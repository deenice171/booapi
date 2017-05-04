"use strict";
const api_1 = require('./api');
const express = require('express');
const port = process.env.PORT || 3000;
/*
const options = {
  dbType: 'mongo',
  dbName: 'bookAPI',
  user: '',
  password: '',
  host: 'localhost',
  port: 27017,
  connectionString:process.env.DB_CONN
};
*/
const options = {
    dbType: 'postgres',
    dbName: process.env.dbName,
    user: process.env.dbUser,
    password: process.env.dbPassword,
    host: 'localhost',
    port: 5432,
    connectionString: process.env.DB_CONN
};
const api = new api_1.API(express(), port, options).spawn();
console.log(`listening on port ${port}`);
