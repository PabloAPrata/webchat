const express = require("express");
const app = express();

// Config JSON
app.use(express.json());

// Models
const Chat = require("../models/Chat");

module.exports = {
  async createChat(request, response) {
    try {
      let { name, members, group, muted, message } = request.body;

      // Validações
      if (!members) {
        return response.status(422).json({ msg: "Informe os membros" });
      }
      if (!group) {
        group = false;
      }
      if (!muted) {
        muted = false;
      }
      if (!message) {
        message = [""];
      }
      if (!name) {
        name = "";
      }

      const chatExists = await Chat.findOne({ members: members });

      // Devolve o chat existente
      if (chatExists) {
        return response
          .status(200)
          .json({ msg: "O chat já existe", id: chatExists._id });
      }

      // Criar Chat
      const chat = new Chat({
        name,
        members,
        group,
        muted,
        message,
      });

      try {
        await chat.save();

        const createdChat = await Chat.findOne({ members: members });

        return response
          .status(201)
          .json({ msg: "Chat criado com sucesso", id: createdChat._id });
      } catch (error) {
        response.status(500).json({ msg: error });
      }
    } catch (err) {
      console.log(err);
      response.status(500).json({ error: err.message });
    }
  },
};
