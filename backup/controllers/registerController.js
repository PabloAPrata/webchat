const express = require("express");
const bcrypt = require("bcrypt");
const app = express();
const path = require("path");

// Config JSON
app.use(express.json());

// Models
const User = require("../models/User");

module.exports = {
  async register(request, response) {
    try {
      const { name, number, password, confirmpassword } = request.body;
      // Validações
      if (!name) {
        return response.status(422).json({ msg: "O nome é obrigatório" });
      }
      if (!number) {
        return response.status(422).json({ msg: "O número é obrigatório" });
      }
      if (!password) {
        return response.status(422).json({ msg: "A senha é obrigatória" });
      }
      if (!confirmpassword) {
        return response.status(422).json({ msg: "Confirme sua senha." });
      }
      if (password !== confirmpassword) {
        return response.status(422).json({ msg: "As senhas não coincidem!" });
      }

      const userExists = await User.findOne({ number: number });

      if (userExists) {
        return response
          .status(422)
          .json({ msg: "Este número já está registrado!" });
      }

      // Criar senha
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      // Criar usuário
      const user = new User({
        name,
        number,
        password: passwordHash,
      });

      try {
        await user.save();

        return response
          .status(201)
          .json({ msg: "Usuário criado com sucesso!" });
      } catch (error) {
        response.status(500).json({ msg: error });
      }
    } catch (err) {
      response.status(500).json({ error: err.message });
    }
  },
};
