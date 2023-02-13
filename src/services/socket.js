module.exports = () => {
  const socketio = require("socket.io");
  const server = require("../app");
  const io = socketio(server);
  const io_extra = null;

  let online_users = [];
  let events_losted = [];

  io.on("connection", (socket) => {
    // FUNÇÕES PARA WEBSOCKET
    function check_event_losted(user) {
      for (let i = 0; i < events_losted.length; i++) {
        if (user === events_losted[i].members) {
          io.to(get_id_by_number(events_losted[i].members)).emit(
            "unread messages",
            events_losted[i]
          );
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
      send_message_to(data);
    });

    socket.on("typing", (data) => {
      socket.broadcast.emit("typing", data);
    });

    socket.on("group_created", (data) => {
      data.members.forEach((number) => {
        socket.broadcast
          .to(get_id_by_number(number))
          .emit("group_created", data);
      });
    });

    socket.on("disconnect", () => {
      online_users.forEach((elemento, indice) => {
        if (elemento.id === socket.id) {
          online_users.splice(indice, 1);
        }
      });
      io.emit("exit", online_users);
    });

    // FUNÇÕES WEBSOCKET DO WEBRTC
    socket.on("join", (roomName) => {
      let rooms = io.sockets.adapter.rooms;
      let room = rooms.get(roomName);

      if (room == undefined) {
        socket.join(roomName);
        socket.emit("created");
      } else if (room.size == 1) {
        socket.join(roomName);
        socket.emit("joined");
      } else {
        socket.emit("full");
      }
    });

    socket.on("ready", (roomName) => {
      socket.broadcast.to(roomName).emit("ready");
    });

    socket.on("candidate", (candidate, roomName) => {
      socket.broadcast.to(roomName).emit("candidate", candidate);
    });

    socket.on("offer", (offer, roomName) => {
      socket.broadcast.to(roomName).emit("offer", offer);
    });

    socket.on("answer", (answer, roomName) => {
      socket.broadcast.to(roomName).emit("answer", answer);
    });

    socket.on("leave", (roomName) => {
      console.log("leave", roomName);
      socket.leave(roomName);
      socket.broadcast.to(roomName).emit("leave", roomName);
    });

    socket.on("calling", (data) => {
      let send = false;
      online_users.forEach((element) => {
        if (!send) {
          if (data.to === element.user.number) {
            send = true;

            socket.broadcast
              .to(get_id_by_number(element.user.number))
              .emit("incoming_call", data);
          }
        }
      });
      if (!send) {
        persistir_evento(data, data.to);
      }
    });

    socket.on("accepted_call", (data) => {
      socket.broadcast
        .to(get_id_by_number(data.to))
        .emit("accepted_call", data);
    });

    socket.on("video", (data) => {
      socket.broadcast.to(data.roomName).emit("video", data);
    });
  });
};
