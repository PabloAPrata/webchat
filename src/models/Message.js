const mongoose = require("mongoose");

const Message = mongoose.model("Message", {
  chat_id: String,
  messages: Array,
});

module.exports = Message;
