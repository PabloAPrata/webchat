module.exports = () => {
  const socketio = require("socket.io");
  const server = require("../app");
  const io = socketio(server);

  let online_users = [];
  let events_losted = [];

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
    console.log(`Conection established with ${socket.id}`);

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
};
