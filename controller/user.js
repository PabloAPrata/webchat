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

    // check if user exists
    const user = await User.findById(id, "-password");

    if (!user) {
      return response.status(404).json({ msg: "Usuário não encontrado" });
    }
    // PRECISO ENVIAR O TOKEN
    response.status(200).json({ user });
  },

  checkToken(request, response, next) {
    const authHeader = request.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return response.status(401).json({ msg: "Acesso negado!" });
    }

    try {
      const secret = require("../private/secret").secret;

      jwt.verify(token, secret);

      next();
    } catch (error) {
      response.status(400).json({ msg: "Token inválido!" });
    }
  },
};
