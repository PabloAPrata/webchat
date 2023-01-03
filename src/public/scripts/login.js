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
        // Se estiver tudo correto com o login, entrará no chat!
        if (resposta.code === 200) {
          const msg = JSON.parse(resposta.data).msg;
          const token = JSON.parse(resposta.data).token;
          const id = parseJwt(token).id;
          localStorage.setItem("token", token);
          window.location.href = "/home/" + id;
        }
      },
      erro(erro) {
        console.log(erro);
        const msg = JSON.parse(erro.data).msg;
        alert(msg);
      },
    });
  });

// Decodificar o token
function parseJwt(token) {
  let base64Url = token.split(".")[1];
  let base64 = base64Url.replace("-", "+").replace("_", "/");

  return JSON.parse(window.atob(base64));
}

function applyPhoneMask(event) {
  let tecla = event.key;
  let telefone = event.target.value.replace(/\D+/g, "");

  if (/^[0-9]$/i.test(tecla)) {
    let tamanho = telefone.length;

    if (tamanho >= 12) {
      return false;
    }

    if (tamanho > 10) {
      telefone = telefone.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
    } else if (tamanho > 5) {
      telefone = telefone.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    } else if (tamanho > 2) {
      telefone = telefone.replace(/^(\d\d)(\d{0,5})/, "($1) $2");
    } else {
      telefone = telefone.replace(/^(\d*)/, "($1");
    }

    event.target.value = telefone;
  }
}

number_input.onkeyup = () => applyPhoneMask(event);
