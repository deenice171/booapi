import { API } from './api';
import express = require('express');

const port: number = process.env.PORT || 3000;

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

const api = new API(express(), port, options).spawn();
console.log(`listening on port ${port}`);