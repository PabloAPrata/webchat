require('dotenv').config

const bootServer = require('./services/boot');
const app = new bootServer();

app.appExecute();

