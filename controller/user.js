const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
// Config JSON
app.use(express.json());

// Models
const User = require("../models/User");

module.exports = {
  async user(request, response) {
    const id = request.params.id;

    if (id.length != 24) {
      return response
        .status(502)
        .json({ msg: "O ID informado não possui os requisitos necessários!" });
    }

    // check if user exists
    const user = await User.findById(id, "-password");

    if (!user) {
      return response.status(404).json({ msg: "Usuário não encontrado" });
    }
    // PRECISO ENVIAR O TOKEN
    response.status(200).json({ user });
  },
};
