const User = require("../models/User");

// Token Decript
function parseJwt(token) {
  let base64Url = token.split(".")[1];
  let base64 = base64Url.replace("-", "+").replace("_", "/");

  return JSON.parse(atob(base64));
}

async function identifyUser(request) {
  // Identifica quem faz a requisição
  const authHeader = request.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const parseToken = parseJwt(token);
  const id = parseToken && parseToken.id;
  const myuser = await User.findById(id, "-password");

  return myuser;
}

const HistoricController = {
  // Criar histórico ou encontrar um.
  async storeHistoric(request, response) {
    try {
      let { type, duration, number, time } = request.body;

      const myUser = await identifyUser(request);
      console.log(
        "🚀 ~ file: historicController.js:27 ~ storeHistoric ~ myUser",
        myUser
      );

      const data = {
        type,
        duration,
        number,
        time,
      };

      try {
        await myUser.historic.push(data);
        await myUser.save();

        return response.status(201).json({
          msg: "Chamada gravada no histórico com sucesso!",
          historic: myUser.historic,
        });
      } catch (error) {
        response.status(500).json({ msg: error });
      }
    } catch (err) {
      console.log(err);
      response.status(500).json({ error: err.message });
    }
  },

  async getHistoric(request, response) {
    const myUser = await identifyUser(request);

    if (!myUser) {
      return response
        .status(500)
        .json({ msg: "Não identificamos o seu usuário" });
    }

    return response.status(200).json({ historic: myUser.historic });
  },
};

module.exports = HistoricController;
