let token = localStorage.getItem("token");
const number_input = document.getElementById("number-input");
const password_input = document.getElementById("password-input");
import { ajax } from "./ajax.js";

document
  .getElementById("login-button")
  .addEventListener("click", function (event) {
    event.preventDefault();

    const values = {
      number: number_input.value,
      password: password_input.value,
    };

    ajax({
      url: "auth/login",
      metodo: "post",
      body: values,
      sucesso(resposta) {
        console.log(resposta);
        const msg = JSON.parse(resposta.data).msg;
        const token = JSON.parse(resposta.data).token;
        alert(msg);
        localStorage.setItem("token", token);
        // window.location.href = "/home";
      },
      erro(erro) {
        console.log(erro);
        const msg = JSON.parse(erro.data).msg;
        alert(msg);
      },
    });
  });

function parseJwt(token) {
  let base64Url = token.split(".")[1];
  let base64 = base64Url.replace("-", "+").replace("_", "/");

  return JSON.parse(window.atob(base64));
}
