module.exports = {
  async socketEvents() {
    this.io.on("connection", (socket) => {
      socket.on("register", (user) => {
        user.socket_id = socket.id;

        this.users.push({
          id: socket.id,
          user: user,
        });

        let len = this.users.length;
        len--;

        this.io.emit("online_user_list", this.users, this.users[len].id);
      });

      socket.on("get_msg", (data) => {
        console.log(data);
        console.log(this.users);
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
  },
};
