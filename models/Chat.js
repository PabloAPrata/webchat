const mongoose = require("mongoose");

const Chat = mongoose.model("Chat", {
  name: String,
  members: Array,
  group: Boolean,
  muted: Boolean,
  message: Array,
});

module.exports = Chat;
