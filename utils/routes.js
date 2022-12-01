"use strict";

class Routes {
  constructor(app, socket) {
    this.app = app;
    this.io = socket;

    //Array para armazenar a lista de usuários junto com o socket.io respectivo
    this.users = [];
  }

  appRoutes() {
    this.app.get("/", (request, response) => {
        response.render("index");
    });
  }

  socketEvents() {
    this.io.on("connection", (socket) => {

      socket.on("register", (user) => {
        user.socket_id = socket.id

        this.users.push({
          id: socket.id,
          user: user,
        });

        console.log("Um novo usuário: ");
        console.log(user);

        let len = this.users.length;
        len--;

        this.io.emit("user_list", this.users, this.users[len].id);
      });

      socket.on("get_msg", (data) => {
        console.log("Uma nova mensagem");
        console.log(data);
        socket.broadcast.to(data.toid).emit("send_msg", data);
      });

      socket.on("disconnect", () => {
        console.log("Alguém foi desconectado");
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
