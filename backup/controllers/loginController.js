const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();

// Config JSON
app.use(express.json());

// Models
const User = require("../models/User");

module.exports = {
  async login(request, response) {
    try {
      const { number, password } = request.body;

      if (!number) {
        return response.status(422).json({ msg: "O número é obrigatório" });
      }
      if (!password) {
        return response.status(422).json({ msg: "A senha é obrigatória" });
      }

      // VERIFICA SE O USUÁRIO EXISTE
      const user = await User.findOne({ number: number });

      if (!user) {
        return response.status(404).json({ msg: "O usuário não existe!" });
      }

      // VERIFICA SE A SENHA CORRESPONDE
      const checkPassword = await bcrypt.compare(password, user.password);

      if (!checkPassword) {
        return response.status(422).json({ msg: "Senha inválida!" });
      }

      try {
        const secret = require("../private/secret").secret;

        const token = jwt.sign(
          {
            id: user._id,
          },
          secret
        );

        response
          .status(200)
          .json({ msg: "Usuário autenticado com sucesso!", token: token });
      } catch (err) {
        console.log(err);
        response.status(500).json({ error: err.message });
      }
    } catch (err) {
      console.log(err);
      response.status(500).json({ error: err.message });
    }
  },
};
