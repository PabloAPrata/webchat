// Models
const Chat = require("../models/Chat");
const User = require("../models/User");
const Message = require("../models/Message");

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

const ChatController = {
  // Criar ou procurar um chat.
  async createChat(request, response) {
    try {
      let { name, members, group, muted, lmessage } = request.body;

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
      if (!lmessage) {
        lmessage = [""];
      }
      if (!name) {
        name = "";
      }

      members.sort();

      const chatExists = await Chat.findOne({ members: members });

      // Se existir
      // Devolve o chat existente
      if (chatExists) {
        return response
          .status(200)
          .json({ msg: "O chat já existe", id: chatExists._id });
      }

      //Se não
      // Criar Chat
      const chat = new Chat({
        name,
        members,
        group,
        muted,
        lmessage,
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

  // Listar todos os chats.
  async listChat(request, response) {
    try {
      const myUser = await identifyUser(request);

      const number = myUser.number;
      // Validações

      const chatsList = await Chat.find({ members: { $all: [number] } });

      // Se existir
      // Devolve o chat existente
      if (chatsList && chatsList.length > 0) {
        return response.status(200).json({ chatsList });
      }

      // Se não houver chat para este usuário
      return response
        .status(204)
        .json({ msg: "Nenhum chat encontrado com esse usuário" });
    } catch (err) {
      console.log(err);
      response.status(500).json({ error: err.message });
    }
  },

  // Adicionar um novo usuário
  async addUser(request, response) {
    try {
      let { number } = request.body;

      // Identifica quem faz a requisição
      const myUser = await identifyUser(request);

      // Verifica se o usuário existe
      const userExists = await User.findOne(
        { number: number },
        "-password -contacts -__v"
      );

      // Validações
      if (!number) {
        return response
          .status(422)
          .json({ msg: "É necessário informar número!" });
      }
      if (myUser.number === number) {
        return response
          .status(422)
          .json({ msg: "Você está adicionando seu número" });
      }
      if (!userExists) {
        return response.status(422).json({ msg: "Não encontramos o usuário." });
      }

      let alreadyOnList = false;
      myUser.contacts.forEach((element) => {
        if (element.number === number) {
          alreadyOnList = true;
        }
      });

      if (alreadyOnList) {
        return response.status(422).json({
          msg: "Você já possui essa pessoa na sua lista de contatos!",
        });
      }

      try {
        // Adicionar usuário a lista de contatos
        await myUser.contacts.push(userExists);
        await myUser.save();

        return response.status(201).json({
          msg: "Usuário adicionado com sucesso!",
          contacts: myUser.contacts,
        });
      } catch (error) {
        response.status(500).json({ msg: error });
      }
    } catch (err) {
      console.log(err);
      response.status(500).json({ error: err.message });
    }
  },

  // Enviar uma mensagem
  async sendMessage(request, response) {
    try {
      let { chat_id, text } = request.body;

      // Identifica quem faz a requisição
      const myUser = await identifyUser(request);

      // Validações
      if (!chat_id) {
        return response
          .status(422)
          .json({ msg: "Informe o chat que deseja enviar a mensagem!" });
      }
      if (chat_id.length != 24) {
        return response.status(502).json({
          msg: "O ID informado não possui os requisitos necessários!",
        });
      }
      if (!text) {
        return response
          .status(422)
          .json({ msg: "Nenhum texto está sendo enviado!" });
      }

      // Corpo da mensagem
      const message = {
        sender_name: myUser.name,
        sender_number: myUser.number,
        text: text,
        time: new Date(),
      };

      // Encontrar chat
      const chat = await Chat.findById(chat_id);

      if (!chat) {
        return response.status(422).json({ msg: "O chat não foi encontrado." });
      }

      // Atualizar a última mensagem
      chat.lmessage = message;
      await chat.save();

      const chatExists = await Message.findOne({ chat_id: chat_id });

      if (!chatExists) {
        const messageDB = new Message({
          chat_id,
          messages: [message],
        });
        await messageDB.save();
        return response
          .status(201)
          .json({ msg: "Mensagem enviada com sucesso!" });
      }

      try {
        await chatExists.messages.push(message);
        await chatExists.save();

        return response
          .status(201)
          .json({ msg: "Mensagem enviada com sucesso!" });
      } catch (error) {
        response.status(500).json({ msg: error });
      }
    } catch (err) {
      console.log(err);
      response.status(500).json({ error: err.message });
    }
  },

  async loadMessages(request, response) {
    try {
      let chat_id = request.params.id;

      const chatExists = await Message.findOne({ chat_id: chat_id });

      // Validações
      if (!chat_id) {
        return response.status(422).json({ msg: "Informe o chat_id!" });
      }
      if (chatExists) {
        return response.status(200).json({ messages: chatExists.messages });
      }

      return response.status(200).json({ messages: [] });
    } catch (error) {
      console.log(error);
      response.status(500).json({ error: error.message });
    }
  },

  async contacts(request, response) {
    try {
      const myUser = await identifyUser(request);
      const contacts = myUser.contacts;

      // Validações
      if (!contacts) {
        return response
          .status(200)
          .json({ msg: "Você não possui nenhum contato." });
      }

      return response.status(200).json({ contacts: contacts });
      // const contactsList = await User.find({ members: { $all: [number] } });
    } catch (err) {
      console.log(err);
      response.status(500).json({ error: err.message });
    }
  },
};

module.exports = ChatController;
