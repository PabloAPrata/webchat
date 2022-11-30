const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const bodyParser = require("body-parser");

const routes = require("./utils/routes");
const config = require("./utils/routes");

class Server {
  constructor() {
    this.port = process.env.PORT || 80;
    this.host = "localhost";

    this.app = express();
    this.http = http.Server(this.app);
    this.socket = socket = socketio(this.http);
  }

  appConfig() {
    this.app.use(bodyParser.json());
    new config(this.app, express);
  }

  // Iniciando o app Routes
  includeRoutes() {
    new routes(this.app, this.socket).routesConfig();
  }

  // Incluindo o fim do app routes
  appExecute() {
    this.appConfig();
    this.includeRoutes();

    this.http.listen(this.port, this.host, () => {
      console.log(`Listening on http://${this.port}`);
    });
  }
}

const app = new Server();
app.appExecute();
