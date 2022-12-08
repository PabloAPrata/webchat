const express = require("express");
const app = express();

// Config JSON
app.use(express.json());

// Models
const User = require("../models/User");

module.exports = {
    async send_message(){
        
    }
}