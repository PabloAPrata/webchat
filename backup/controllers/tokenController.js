const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
// Config JSON
app.use(express.json());

module.exports = {
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
      response
        .status(400)
        .json({ msg: "Você precisa se autenticar primeiro!" });
    }
  },
};
