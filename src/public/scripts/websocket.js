window.socket = io.connect();

socket.on("connect", () => {
  const mySocketID = socket.id;
  console.log("🚀 ~ file: chat.js:89 ~ socket.on ~ mySocketID", mySocketID);
});
