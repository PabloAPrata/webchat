"use strict";

const router = require("express").Router();

const login_controller = require("./controllers/loginController");
const register_controller = require("./controllers/registerController");
const start_controller = require("./controllers/startController");
const user_controller = require("./controllers/userController");
const chat_controller = require("./controllers/chatController");
const token_validator = require("./controllers/tokenController");
const historic_controller = require("./controllers/historicController");

// Tela de login
router.get("/", login_controller.login_screen);

// Tela de registro de novo usuário.
router.get("/register", register_controller.register_screen);

// Envia dados para registro de um novo usuário.
router.post("/auth/register", register_controller.register);

// Envia dados de autenticação para entrar na conta.
router.post("/auth/login", login_controller.login);

// Redireciona para página inicial do usuário logado.
router.get("/home/:id", start_controller.start_screen);

// Private routes
router.get("/user/:id", token_validator.checkToken, user_controller.user);

// Criar chat
router.post(
  "/chat/create",
  token_validator.checkToken,
  chat_controller.createChat
);

// Enviar Mensagem
router.post(
  "/chat/sendMessage",
  token_validator.checkToken,
  chat_controller.sendMessage
);

// Listar todos os chats
router.get("/chat/list", token_validator.checkToken, chat_controller.listChat);

// Listar todos os contatos
router.get(
  "/contacts/list",
  token_validator.checkToken,
  chat_controller.contacts
);

// Adicionar um novo contato
router.post(
  "/contacts/add",
  token_validator.checkToken,
  chat_controller.addUser
);

// Carregar mensagens de um chat
router.get(
  "/chat/messages/:id",
  token_validator.checkToken,
  chat_controller.loadMessages
);

// Gravar ligação no histórico de chamadas
router.post(
  "/calls/historic",
  token_validator.checkToken,
  historic_controller.storeHistoric
);

// Carregar histórico de chamadas
router.get(
  "/calls/historic",
  token_validator.checkToken,
  historic_controller.getHistoric
);

module.exports = router;
