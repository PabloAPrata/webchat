"use strict";

const register_controller = require("../controller/register_controller");
const login_controller = require("../controller/login_controller");

class Routes {
  constructor(app, socket) {
    this.app = app;
    this.io = socket;

    //Array para armazenar a lista de usuários junto com o socket.io respectivo
    this.users = [];
  }

  appRoutes() {
    this.app.get("/", (request, response) => {
      response.render("login");
    });

    this.app.get("/register", (request, response) => {
      response.render("register");
    });

    this.app.post("/auth/register", register_controller.register);

    this.app.post("/auth/login", login_controller.login);
  }

  socketEvents() {
    this.io.on("connection", (socket) => {
      socket.on("register", (user) => {
        user.socket_id = socket.id;

        this.users.push({
          id: socket.id,
          user: user,
        });

        let len = this.users.length;
        len--;

        this.io.emit("user_list", this.users, this.users[len].id);
      });

      socket.on("get_msg", (data) => {
        socket.broadcast.to(data.toid).emit("send_msg", data);
      });

      socket.on("disconnect", () => {
        this.users.forEach((elemento, indice) => {
          if (elemento.id === socket.id) {
            this.users.splice(indice, 1);
          }
        });
        this.io.emit("exit", this.users);
      });
    });
  }

  routesConfig() {
    this.appRoutes();
    this.socketEvents();
  }
}
module.exports = Routes;
