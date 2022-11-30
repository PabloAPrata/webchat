class Config {
  constructor(app, express) {

    // Definindo .html como extensão de modelo padrão
    app.set("view engine", "html");

    // Inicializando o motor de template ejs
    app.engine("html", require("ejs").renderFile);

    //Diz para o express onde ele vai encontrar o template
    app.set("views", (__dirname + "/../views"))

    // Arquivos
    app.use(express.static(__dirname + "/../public/"))
  }
}

module.exports = Config;