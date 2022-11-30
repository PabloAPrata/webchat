const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const routes = express.Router();
var http = require("http");
let global_notifications = [];
let global_notifications_aux = 0;

// DATABASE
let contacts = [
  {
    name: "David Muniz",
    number: "984986134",
    image: "",
    chat_id: "1ABC",
    text: "Ocupado",
  },
  {
    name: "Igor Proença",
    number: "999275358",
    image: "",
    chat_id: "2ABC",
    text: "O esforço importa duas vezes mais do que o talento”(Angela Duckworth).",
  },
  {
    name: "Luciano Dias",
    number: "997465255",
    image: "",
    chat_id: "3ABC",
    text: "Que a Palavra te desfaça",
  },
  {
    name: "Max William",
    number: "91016242",
    image: "",
    chat_id: "4ABC",
    text: "Itália",
  },
  {
    name: "Yuri Martins",
    number: "939276484",
    image: "",
    chat_id: "5ABC",
    text: "Busy",
  },
];

let chats_list = [
  {
    name: "Luciano Dias",
    last_message: {
      user: "Luciano Dias",
      number: "",
      text: "Não sou boi não!",
      time: "Sat Nov 19 2022 15:28:05 GMT-0300 (Horário Padrão de Brasília)",
    },
    chat_id: "1ABC",
    image: "",
  },
  {
    name: "Igor Proença",
    last_message: {
      user: "Igor Proença",
      number: "",
      text: "Nada é impossível, basta acreditar",
      time: "Sat Nov 19 2022 15:28:05 GMT-0300 (Horário Padrão de Brasília)",
    },

    chat_id: "2ABC",
    image: "",
  },
  {
    name: "Max William",
    last_message: {
      user: "Max William",
      number: "",
      text: "Olá pessoal, uma boa noite!",
      time: "Sat Nov 19 2022 15:28:05 GMT-0300 (Horário Padrão de Brasília)",
    },

    chat_id: "3ABC",
    image: "",
  },
  {
    name: "Yuri Martins",
    last_message: {
      user: "Yuri Martins",
      number: "",
      text: "O cachorro no triângulo exuberou de boa tarde",
      time: "Sat Nov 19 2022 15:28:05 GMT-0300 (Horário Padrão de Brasília)",
    },

    chat_id: "4ABC",
    image: "",
  },
];

let messages = [
  {
    chat_id: "1ABC",
    mensagens: [
      {
        user: "David Muniz",
        number: "984986134",
        text: "Oi",
        time: "Sat Nov 19 2022 15:28:05 GMT-0300 (Horário Padrão de Brasília)",
        chat_id: "1ABC",
      },
    ],
  },
  {
    chat_id: "2ABC",
    mensagens: [
      {
        user: "Igor Proença",
        number: "999275358",
        text: "Hey",
        time: "Sat Nov 19 2022 15:28:05 GMT-0300 (Horário Padrão de Brasília)",
        chat_id: "2ABC",
      },
    ],
  },
  {
    chat_id: "3ABC",
    mensagens: [
      {
        user: "Luciano Dias",
        number: "997465255",
        text: "Eae!",
        time: "Sat Nov 19 2022 15:28:05 GMT-0300 (Horário Padrão de Brasília)",
        chat_id: "3ABC",
      },
    ],
  },
  {
    chat_id: "4ABC",
    mensagens: [
      {
        user: "David Muniz",
        number: "939276484",
        text: "Coé",
        time: "Sat Nov 19 2022 15:28:05 GMT-0300 (Horário Padrão de Brasília)",
        chat_id: "4ABC",
      },
    ],
  },
];
//----------------------------------------------------------------

function update_chat_list(chat_id, text, number, name) {
  chats_list.forEach((e) => {
    if (e.chat_id == chat_id) {
      e.last_message.text = text;
      e.last_message.number = number;
      e.last_message.name = name;
    }
  });
}

function generate_notification(chat_id, text, number, name) {
  const notification = {
    chat_id: chat_id,
    text: text,
    number: number,
    name: name,
  };
  global_notifications.push(notification);
}

// Model
const User = require("../models/User");

//! Registration
routes.post("/auth/register", async (req, res) => {
  const { name, number, password, text } = req.body;

  if (!number) {
    return res.status(422).json({ msg: "Number is required" });
  }
  if (!password) {
    return res.status(422).json({ msg: "Password is required" });
  }

  const userExists = await User.findOne({ number: number });

  if (userExists) {
    return res.status(422).json({ msg: "Please, use another number" });
  }

  // create password
  const salt = await bcrypt.genSalt(12);
  const passwordhash = await bcrypt.hash(password, salt);

  // create user
  const user = new User({
    name,
    number,
    password: passwordhash,
    text,
  });

  try {
    await user.save();

    res.status(201).json({ msg: "User saved successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err });
  }
});

// ! Login
routes.post("/home", async (req, res) => {
  const { number, password } = req.body;

  // Validations
  if (!number) {
    return res.status(422).json({ msg: "Number is required" });
  }
  if (!password) {
    return res.status(422).json({ msg: "Password is required" });
  }

  const user = await User.findOne({ number: number });

  if (!user) {
    return res.status(422).json({ msg: "User does not exists" });
  }

  // check if password match
  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return res.status(404).json({ msg: "Invalid password" });
  }

  try {
    const secret = process.env.SECRET;

    const token = jwt.sign(
      {
        id: user.id,
      },
      secret
    );

    res.status(200).json({ token: token });
  } catch (error) {
    console.log(error);
    res.json({ msg: error });
  }

  // res.sendFile("converse.html", { root: "./public" });
});

// !Open routes - Public route
routes.get("/", function (req, res) {
  res.sendFile("login.html", { root: "./public" });
});

routes.get("/home", function (req, res) {
  res.sendFile("converse.html", { root: "./public" });
});

// !Private route - Private route
routes.get("/user/:id", check_token, async function (req, res) {
  const id = req.params.id;

  // check if the user exists
  const user = await User.findById(id, "-password");

  if (!user) {
    return res.status(404).json({ msg: "User not found!" });
  }

  res.status(200).json({ user });
});

function check_token(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Access Denied!" });
  }

  try {
    const secret = process.env.SECRET;

    jwt.verify(token, secret);

    next();
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "Token not valid!" });
  }
}

routes.get("/contacts", (req, res) => {
  return res.json(contacts);
});
routes.get("/chats", (req, res) => {
  return res.json(chats_list);
});
routes.get("/conversations", (req, res) => {
  return res.json(messages);
});

routes.put("/send-message", (req, res) => {
  let index = 0;
  const body = req.body;
  const chat_id = body.chat_id;

  messages.forEach(function (e, i) {
    if (e.chat_id == chat_id) {
      const msg = {
        user: body.user,
        number: body.number,
        chat_id: body.chat_id,
        text: body.text,
        time: body.time,
      };
      update_chat_list(body.chat_id, body.text, body.number, body.user);
      generate_notification(body.chat_id, body.text, body.number, body.user);
      e.mensagens.push(msg);
      index = i;
    }
  });
  return res.json(messages[index].mensagens);
});

routes.post("/get-update", (req, res) => {
  const number = req.body.number;

  global_notifications.forEach((e) => {
    if (number != e.number) {
      return res.json(global_notifications);
    }
  });
  return res.json();
});

module.exports = routes;
