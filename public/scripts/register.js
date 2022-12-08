const password_input = document.getElementById("password-input");
const confirm_password_input = document.getElementById(
  "confirm-password-input"
);
const username_input = document.getElementById("username-input");
const number_input = document.getElementById("number-input");
import { ajax } from "./ajax.js";

// CLIQUE DO BOTÃO CHAMA A API DE REGISTRAR
document
  .getElementById("register-button")
  .addEventListener("click", function (e) {
    e.preventDefault();

    const senhas_conferem = match_password(
      password_input.value,
      confirm_password_input.value
    );

    if (!senhas_conferem) {
      alert("As senhas não coincidem!");
      return;
    }

    const config = {
      name: username_input.value,
      number: number_input.value,
      password: password_input.value,
      confirmpassword: confirm_password_input.value,
    };

    console.log("Entrou aqui");
    ajax({
      url: "auth/register",
      metodo: "post",
      body: config,
      sucesso(resposta) {
        const msg = JSON.parse(resposta.data).msg;
        alert(msg);

        window.location.href = "/";
      },
      erro(erro) {
        const msg = JSON.parse(erro.data).msg;
        alert(msg);
      },
    });
  });

function match_password(value1, value2) {
  if (value1 === value2) {
    return true;
  } else return false;
}
