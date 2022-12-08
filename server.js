require('dotenv').config

const bootServer = require('./services/boot');
const app = new bootServer();
const mongoose = require('mongoose');
const db = require('./private/db');

if(db.connectionString) {
  mongoose.connect(db.connectionString, app.appExecute());
} else {
  console.log("No connection string provided");
}




