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

    console.log(values);

    ajax({
      url: "auth/login",
      metodo: "post",
      body: values,
      sucesso(resposta) {
        console.log(resposta);
        const msg = JSON.parse(resposta.data).msg;
        console.log(msg);
        alert(msg);
        // const token = JSON.parse(resposta).token;
        // localStorage.setItem("token", token);
        // console.log("Login successful");
        // window.location.href = "/home";
      },
      erro(erro) {
        console.log(erro);
        const msg = JSON.parse(erro.data).msg;
        console.log(msg);
        alert(msg);
      },
    });
  });
