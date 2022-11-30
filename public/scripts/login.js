let token = localStorage.getItem("token");
const number_input = document.getElementById("number-input");
const password_input = document.getElementById("password-input");

document
  .getElementById("login-button")
  .addEventListener("click", function (event) {
    event.preventDefault();

    const values = {
      number: number_input.value,
      password: password_input.value,
    };

    login(values);
  });

function ajax(config) {
  const xhr = new XMLHttpRequest();
  xhr.open(config.metodo, config.url, true);

  if (config.metodo == "post" || config.metodo == "put") {
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(config.body));
  }
  xhr.onload = (e) => {
    if (xhr.readyState == 4 && xhr.status === 200) {
      config.sucesso(xhr.response);
    } else if (xhr.status >= 400) {
      config.erro({
        code: xhr.status,
        text: xhr.statusText,
      });
    }
  };

  if (config.metodo == "get" || config.metodo == "delete") xhr.send();
}

function login(config) {
  ajax({
    url: "home",
    metodo: "post",
    body: {
      number: config.number,
      password: config.password,
    },
    sucesso(resposta) {
        const token = JSON.parse(resposta).token;
        localStorage.setItem("token", token);
        console.log("Login successful");
        window.location.href = "/home"
    },
  });
}

