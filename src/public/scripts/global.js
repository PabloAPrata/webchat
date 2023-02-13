import { ajax } from "./ajax.js";

let token = localStorage.getItem("token");
const username_div = document.getElementById("profile_name");

// Código a ser executado assim que a página terminar de carregar
window.addEventListener("load", function (event) {
  // Verifica o acesso.
  autentication(token);

  const roomName = this.localStorage.getItem("incall");
  if (roomName) {
    socket.emit("leave", roomName);
    console.log("Saiu da sala " + roomName);
    this.localStorage.removeItem("incall");
  }
});

// Código a ser executado antes da página ser recarregada ou fechada
window.addEventListener("beforeunload", function (event) {});

function autentication(token) {
  const id = get_url_id();

  ajax({
    url: "/user/" + id,
    metodo: "get",
    headers: [{ header: "Authorization", value: `Bearer ${token}` }],
    sucesso(resposta) {
      if (resposta.code === 200) {
        const user = JSON.parse(resposta.data).user;
        account_info.name = user.name;
        account_info.number = user.number;
        account_info.socket_id = user._id;

        username_div.textContent = account_info.name;
        window.account_info = account_info;
        socket.emit("register", account_info);
      } else {
        console.log(resposta);
      }
    },
    erro(erro) {
      window.location.href = "/";
    },
  });
}

function get_url_id() {
  let id = window.location.pathname;

  return id.split("home/")[1];
}
