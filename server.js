require("dotenv").config();
const mongoose = require("mongoose");
const boot = require("./src/services/boot");
const config = require("./src/configs");

if (config.db.connectionString) {
  mongoose.connect(config.db.connectionString, boot);
} else {
  console.log("Couldn't connect to Mongoose");
}
