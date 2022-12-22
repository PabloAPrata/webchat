const mongoose = require("mongoose");

const Chat = mongoose.model("Chat", {
  name: String,
  members: Array,
  group: Boolean,
  lmessage: Object,
});

module.exports = Chat;
