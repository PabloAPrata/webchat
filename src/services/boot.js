"use strict";

const app = require("../app");
const config = require("../configs");
const socket = require("./socket");

module.exports = (err) => {
  if (err) return console.log(err);
};

app.listen(config.app.port, (err) => {
  if (err) {
    return console.error(err);
  }
  console.log(`listening on http://127.0.1:${config.app.port}`);
});

socket();
