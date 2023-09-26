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

    const check_name = checkName(username_input.value);

    if (!check_name) {
      alert("Insira nome e sobrenome!");
      return;
    }

    const config = {
      name: username_input.value,
      number: number_input.value,
      password: password_input.value,
      confirmpassword: confirm_password_input.value,
    };

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

function checkName(name) {
  // Verifica se a string possui pelo menos um espaço, o que indica que há pelo menos dois nomes
  if (!name.includes(" ")) return false;
  else return true;
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

function limiteCaracteres(event) {
  const nome = event.target.value;

  if (nome.length > 30) {
    alert("O nome excedeu o limite de 30 caracteres");
    event.target.value = "";
  }
}

username_input.onkeydown = () => limiteCaracteres(event);
number_input.onkeyup = () => applyPhoneMask(event);
