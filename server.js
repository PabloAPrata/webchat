require('dotenv').config

const bootServer = require('./services/boot');
const app = new bootServer();
const mongoose = require('mongoose');
const db = require('./services/db');

if(db.connectionString) {
  mongoose.connect(db.connectionString, app.appExecute());
} else {
  console.log("No connection string provided");
}




