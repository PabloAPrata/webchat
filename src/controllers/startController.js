const path = require("path");

const StartController = {
  start_screen(request, response) {
    const filePath = path.join(__dirname, "/../views/index.html");
    response.sendFile(filePath);
  },
};

module.exports = StartController;
