"use strict";
const api_1 = require('./api');
const express = require('express');
const port = process.env.PORT || 3000;
const options = {
    dbType: 'postgres',
    dbName: process.env.DB_NAME,
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASS,
    dbHost: process.env.DB_HOST,
    dbPort: process.env.DB_PORT,
    connectionString: process.env.DB_CONN
};
const api = new api_1.API(express(), port, options).spawn();
console.log(`listening on port ${port}`);
