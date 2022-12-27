"use strict";

// CONTROLLER
const register_controller = require("../controller/register");
const login_controller = require("../controller/login");
const user_controller = require("../controller/user");
const chat_controller = require("../controller/chat");
const token_validator = require("../controller/token");
const chat = require("../controller/chat");
let io_extra = null;

let online_users = [];
let events_losted = [];

// Tela de login
app.get("/", (request, response) => {
  response.render("login");
});

// Tela de registro de novo usuário.
app.get("/register", (request, response) => response.render("register"));

// Envia dados para registro de um novo usuário.
app.post("/auth/register", register_controller.register);

// Envia dados de autenticação para entrar na conta.
app.post("/auth/login", login_controller.login);

// Redireciona para página inicial do usuário logado.
app.get("/:id", (request, response) => response.render("index"));

// Private routes
app.get("/user/:id", token_validator.checkToken, user_controller.user);

// Criar chat
app.post(
  "/chat/create",
  token_validator.checkToken,
  chat_controller.createChat
);

// Enviar Mensagem
app.post(
  "/chat/sendMessage",
  token_validator.checkToken,
  chat_controller.sendMessage
);

// Listar todos os chats
app.get("/chat/list", token_validator.checkToken, chat_controller.listChat);

// Listar todos os contatos
app.get("/contacts/list", token_validator.checkToken, chat_controller.contacts);

// Adicionar um novo contato
app.post("/contacts/add", token_validator.checkToken, chat_controller.addUser);

// Carregar mensagens de um chat
app.get(
  "/chat/messages/:id",
  token_validator.checkToken,
  chat_controller.loadMessages
);

io.on("connection", (socket) => {
  // FUNÇÕES PARA WEBSOCKET

  function check_event_losted(user) {
    for (let i = 0; i < events_losted.length; i++) {
      if (user === events_losted[i].members) {
        io_extra
          .to(get_id_by_number(events_losted[i].members))
          .emit("unread messages", events_losted[i]);

        events_losted.splice(i, 1);
      }
    }
  }

  function send_message_to(data) {
    data.members.forEach((number) => {
      let send = false;
      online_users.forEach((element) => {
        if (!send) {
          if (number === element.user.number) {
            send = true;

            socket.broadcast
              .to(get_id_by_number(element.user.number))
              .emit("send_msg", data);
          }
        }
      });
      if (!send) {
        persistir_evento(data, number);
      }
    });
  }

  function persistir_evento(data, number) {
    let newData = { ...data };
    newData.members = number;
    events_losted.push(newData);
  }

  function get_id_by_number(number) {
    let id = undefined;

    online_users.forEach((element) => {
      if (element.user.number === number) {
        id = element.id;
      }
    });
    return id;
  }

  // =================================================================
  socket.on("register", (user) => {
    user.socket_id = socket.id;

    online_users.push({
      id: socket.id,
      user: user,
    });

    let len = online_users.length;
    len--;

    io.emit("online_user_list", online_users, online_users[len].id);

    check_event_losted(user.number);
  });

  socket.on("get_msg", (data) => {
    // data.members.forEach((number) => {
    //   socket.broadcast.to(get_id_by_number(number)).emit("send_msg", data);
    // });

    send_message_to(data);
  });

  socket.on("disconnect", () => {
    online_users.forEach((elemento, indice) => {
      if (elemento.id === socket.id) {
        online_users.splice(indice, 1);
      }
    });
    io.emit("exit", online_users);
  });
});

appRoutes();
socketEvents();
