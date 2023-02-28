import { ajax } from "./ajax.js";
let token = localStorage.getItem("token");

window.call_history = [];
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

get_historic_list(token)
  .then((resposta) => {
    if (resposta.code !== 200) {
      alert("Houve um erro");
    }

    const resposta_data = JSON.parse(resposta.data);
    window.call_history = [...resposta_data.historic];

    load_historic_list();
  })
  .catch((error) => {
    if (error.code === 401) {
      window.location.href = "/";
    }
    console.error(error);
  });

function load_historic_list() {
  side_historic_call.innerHTML = "";
  let list = window.call_history;
  let inverted_list = list.reverse();
  inverted_list.forEach((e) => {
    const { type, duration, number, time, accepted, video } = e;

    const historic_li = document.createElement("li");
    historic_li.setAttribute("type", type);
    historic_li.setAttribute("duration", duration);
    historic_li.setAttribute("number", number);
    historic_li.setAttribute("time", time);
    historic_li.setAttribute("accepted", accepted);
    historic_li.setAttribute("video", video);
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
    } else if (type === "Entrada") {
      icon_icon_type.textContent = "call_received";
    } else {
      icon_icon_type.textContent = "phone_missed";
      icon_icon_type.style.color = "#bf0000";
      text_type.style.color = "#bf0000";
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
    number_element.textContent = get_name_user_by_number(number);
    text_type.textContent = type;
    call_info_date.textContent = formatted_time(time);
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

function incoming_call_div(number, type, room) {
  const incomingCallNtf = document.createElement("div");
  incomingCallNtf.classList.add("incoming_call_ntf");
  incomingCallNtf.setAttribute("id", "incoming_call_ntf");
  incomingCallNtf.setAttribute("from", number);
  incomingCallNtf.setAttribute("type", type);

  const mainIncomingCall = document.createElement("div");
  mainIncomingCall.classList.add("main_incoming_call");
  incomingCallNtf.appendChild(mainIncomingCall);

  const infoIncomingCall = document.createElement("div");
  infoIncomingCall.classList.add("info_incoming_call");
  mainIncomingCall.appendChild(infoIncomingCall);

  const contactInfo = document.createElement("div");
  contactInfo.classList.add("contact_info");
  infoIncomingCall.appendChild(contactInfo);

  const img = document.createElement("img");
  img.style.height = "75px";
  img.src = "../image/user-3296.svg";
  contactInfo.appendChild(img);

  const p = document.createElement("p");
  p.textContent = get_name_user_by_number(number);
  contactInfo.appendChild(p);

  const textInfo = document.createElement("div");
  textInfo.classList.add("text_info");
  textInfo.textContent = `Chamada de ${type}`;
  infoIncomingCall.appendChild(textInfo);

  const containerButtons = document.createElement("div");
  containerButtons.classList.add("container_buttons");
  mainIncomingCall.appendChild(containerButtons);

  const acceptCallButton = document.createElement("button");
  acceptCallButton.classList.add("accept_call_button");
  acceptCallButton.onclick = () => {
    accept_call(number, type, room);
  };
  containerButtons.appendChild(acceptCallButton);

  const acceptCallButtonSpan = document.createElement("span");
  acceptCallButtonSpan.classList.add("material-icons");
  acceptCallButtonSpan.textContent = "call";
  acceptCallButton.appendChild(acceptCallButtonSpan);

  const rejectCallButton = document.createElement("button");
  rejectCallButton.classList.add("reject_call_button");
  rejectCallButton.onclick = () => {
    reject_call(number, type, room);
    add_call_to_local_history(
      "Não atendida",
      "00:00:00",
      number,
      new Date(),
      false,
      type
    );
  };
  containerButtons.appendChild(rejectCallButton);

  const rejectCallButtonSpan = document.createElement("span");
  rejectCallButtonSpan.classList.add("material-icons");
  rejectCallButtonSpan.textContent = "call_end";
  rejectCallButton.appendChild(rejectCallButtonSpan);

  const body = document.getElementsByTagName("body")[0];
  body.appendChild(incomingCallNtf);

  setTimeout(() => {
    incomingCallNtf.style.opacity = "1";
  }, 200);
}

function accept_call(number, type, room) {
  const incomingCallNtf = document.getElementById("incoming_call_ntf");

  openVideoApp();

  join_call_event(number, type, room);

  // VISUAL
  if (incomingCallNtf) {
    incomingCallNtf.style.opacity = "0";
    setTimeout(() => {
      incomingCallNtf.remove();
    }, 500);
  }

  const data = {
    from: window.account_info.number,
    to: number,
    type: type,
    room: room,
  };

  window.current_call.type = "Entrada";
  window.current_call.number = account_info.number;
  window.current_call.roomName = room;
  window.current_call.time = new Date();
  window.current_call.video = type === "video" ? true : false;

  socket.emit("accepted_call", data);
}

function reject_call(number, type, room) {
  const incomingCallNtf = document.getElementById("incoming_call_ntf");

  if (incomingCallNtf) {
    incomingCallNtf.style.opacity = "0";
    setTimeout(() => {
      incomingCallNtf.remove();
    }, 1000);
  }
}

socket.on("incoming_call", (data) => {
  incoming_call_div(data.from, data.type, data.room);
});

socket.on("accepted_call", (data) => {
  const name = get_name_user_by_number(data.from);
  const contact_name_incall = document.getElementById("contact_name_incall");
  contact_name_incall.textContent = name;
  peer_video.setAttribute("metadata", data.from);
  if (data.type === "video") join_video_room(data.room);

  if (data.type === "audio") join_audio_room(data.room);
});

function add_call_to_local_history(
  type,
  duration,
  number,
  time,
  accepted,
  video
) {
  if (video === "video") video = true;
  else if (video === "audio") video = false;

  console.log(window.call_history);

  const data = {
    type,
    duration,
    number,
    time,
    accepted,
    video,
  };

  // /calls/historic
  store_historic_db(data)
    .then((resposta) => {
      if (resposta.code !== 201) {
        alert("Houve um erro");
      }

      const resposta_data = JSON.parse(resposta.data);

      window.call_history = [...resposta_data.historic];

      load_historic_list();
    })
    .catch((error) => {
      if (error.code === 401) {
        window.location.href = "/";
      }
      console.error(error);
    });
}

function store_historic_db(data) {
  return new Promise((resolve, reject) => {
    ajax({
      url: "/calls/historic",
      metodo: "post",
      headers: [{ header: "Authorization", value: `Bearer ${token}` }],
      body: data,
      sucesso: resolve,
      erro: reject,
    });
  });
}

// !! FUNÇÕES DAS DATAS
// ? =================================================================================

// * DD/MM/AA
function get_current_date() {
  let data = new Date();
  let dataFormatada = data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

  return dataFormatada;
}

function get_current_year() {
  let data = new Date();

  let year = data.toLocaleDateString("pt-BR", {
    year: "2-digit",
  });

  return year;
}

function get_current_time() {
  let data = new Date();
  let horas = data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return horas;
}

function get_horas(time) {
  let data = new Date(time);
  let horas = data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return horas;
}

function formatted_time(time) {
  let newTime = new Date(time);

  //
  let time_date = newTime.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

  let time_year = newTime.toLocaleDateString("pt-BR", {
    year: "2-digit",
  });

  let time_only_time = newTime.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // SE FOR A MESMA DATA DE HOJE, RETORNA A HORA APENAS.
  if (time_date === get_current_date()) {
    return time_only_time;
  }

  // SE FOR ESTE MESMO ANO, RETORNA A DATA SEM O ANO.
  if (time_year === get_current_year()) {
    let without_year = newTime.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });

    return without_year;
  }

  return time_date;
}

const hangup_button = document.getElementById("hangup_button");

hangup_button.addEventListener("click", function () {
  add_call_to_local_history(
    window.current_call.type,
    window.current_call.duration,
    window.current_call.number,
    new Date(),
    true,
    window.current_call.video
  );
});
