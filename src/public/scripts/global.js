// Código a ser executado assim que a página terminar de carregar
window.addEventListener("load", function (event) {
  const roomName = this.localStorage.getItem("incall");
  if (roomName) {
    socket.emit("leave", roomName);
    console.log("Saiu da sala " + roomName);
    this.localStorage.removeItem("incall");
  }
});

// Código a ser executado antes da página ser recarregada ou fechada
window.addEventListener("beforeunload", function (event) {});
