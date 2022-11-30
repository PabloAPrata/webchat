class Routes {
  constructor(app, socket) {
    this.app = app;
    this.io = socket;

    //Array para armazenar a lista de usuários junto com o socket.io respectivo
    this.users = [];
  }

  appRoutes() {
    this.app.get("/", (req, res) => {
      response.render("chat");
    });
  }

  socketEvents() {
    this.io.on("connection", (socket) => {
      socket.on("username", (username) => {
        console.log("Um novo usuário" + username);
        this.users.push({
          id: socket.id,
          username: username,
        });

        let len = this.users.length;
        len--;
        this.io.emit("userList", this.users, this.users[len].id);
      });

      socket.on("getMsg", (data) => {
        console.log("Uma nova mensagem");
        console.log(data);
        socket.broadcast.to(data.toid).emit("sendMsg", {
          msg: data.msg,
          name: data.name,
        });
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
