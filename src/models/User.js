const mongoose = require("mongoose");

const User = mongoose.model("User", {
  name: String,
  number: String,
  password: String,
  contacts: Array,
  historic: Array,
});

module.exports = User;
