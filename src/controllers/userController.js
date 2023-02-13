const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
// Config JSON
app.use(express.json());

// Models
const User = require("../models/User");

// Token Decript
function parseJwt(token) {
  let base64Url = token.split(".")[1];
  let base64 = base64Url.replace("-", "+").replace("_", "/");

  return JSON.parse(atob(base64));
}

async function identifyUser(request) {
  // Identifica quem faz a requisição
  const authHeader = request.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const parseToken = parseJwt(token);
  const id = parseToken && parseToken.id;
  const myuser = await User.findById(id, "-password");

  return myuser;
}

module.exports = {
  async user(request, response) {
    const id = request.params.id;

    const myUser = await identifyUser(request);

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

    // Se o ID informado for diferente do token informado, não permite o acesso!
    if (user.number !== myUser.number) {
      return response.status(401).json({ msg: "Sem autorização!" });
    }

    // PRECISO ENVIAR O TOKEN
    response.status(200).json({ user });
  },
};
