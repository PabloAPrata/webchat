const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const http = require("http");

const routes = require("./routes");

const app = express();
const server = http.createServer(app);

//Middlewares
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

// Routes initialization
app.use("/", routes);

module.exports = server;
