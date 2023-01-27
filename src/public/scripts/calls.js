import { ajax } from "./ajax.js";
let token = localStorage.getItem("token");
let historic = [];

const side_historic_call = document.getElementById("side_historic_call");
const input_search_contacts_call = document.getElementById("input_search_call");

input_search_contacts_call.addEventListener("keyup", function (e) {});

async function get_historic_list(token) {
  return new Promise((resolve, reject) => {
    ajax({
      url: "/calls/historic",
      metodo: "get",
      headers: [{ header: "Authorization", value: `Bearer ${token}` }],
      sucesso: resolve,
      erro: reject,
    });
  });
}

get_historic_list(token).then((resposta) => {
  if (resposta.code !== 200) {
    alert("Houve um erro");
  }

  const resposta_data = JSON.parse(resposta.data);
  historic = [...resposta_data.historic];

  load_historic_list();
});

function load_historic_list() {
  //   side_historic_call.innerHTML = "";
  historic.forEach((e) => {
    if (!e) return;

    const { type, duration, number, time } = e;

    if (!type || !duration || !number || !time) {
      return;
    }

    const historic_li = document.createElement("li");
    const informations_historico = document.createElement("div");
    const call_info_historico = document.createElement("div");
    const buttons_historico = document.createElement("div");
    const contact_img = document.createElement("span");
    const img = document.createElement("img");
    const info_historico_number_type = document.createElement("span");
    const number_element = document.createElement("div");
    const container_icon_type = document.createElement("span");
    const icon_type = document.createElement("span");
    const icon_icon_type = document.createElement("span");
    const text_type = document.createElement("span");
    const call_info_date = document.createElement("div");
    const call_info_duration = document.createElement("div");
    const icon_button = document.createElement("span");
    const button = document.createElement("button");
    const text_button = document.createElement("span");

    if (type === "Saída") {
      icon_icon_type.textContent = "call_made ";
    }
    if (type === "Entrada") {
      icon_icon_type.textContent = "call_received";
    } else {
      icon_icon_type.textContent = "phone_missed";
    }

    informations_historico.className = "informations_historico";
    call_info_historico.className = "call_info_historico";
    buttons_historico.className = "buttons_historico";
    contact_img.className = "contact_img";
    img.setAttribute("src", "../image/user-3296.svg");
    info_historico_number_type.className = "info_historico_number_type";
    container_icon_type.className = "icon_type";
    icon_icon_type.className = "material-icons";
    icon_type.className = "icon_type";
    text_type.className = "text_type";
    call_info_historico.className = "call_info_historico";
    call_info_date.className = "call_info_date";
    call_info_duration.className = "call_info_duration";
    buttons_historico.className = "buttons_historico";
    icon_button.className = "material-icons";

    icon_button.textContent = "call";
    number_element.textContent = number;
    text_type.textContent = type;
    call_info_date.textContent = time;
    call_info_duration.textContent = duration;
    text_button.textContent = "Ligar";

    icon_type.appendChild(icon_icon_type);
    button.appendChild(icon_button);
    button.appendChild(text_button);
    contact_img.appendChild(img);
    informations_historico.appendChild(contact_img);
    call_info_historico.appendChild(call_info_date);
    call_info_historico.appendChild(call_info_duration);
    info_historico_number_type.appendChild(number_element);
    info_historico_number_type.appendChild(icon_type);
    info_historico_number_type.appendChild(text_type);
    informations_historico.appendChild(info_historico_number_type);

    buttons_historico.appendChild(button);
    historic_li.appendChild(informations_historico);
    historic_li.appendChild(call_info_historico);
    historic_li.appendChild(buttons_historico);

    number_element.style.marginBottom = "5px";

    side_historic_call.appendChild(historic_li);
  });
}
