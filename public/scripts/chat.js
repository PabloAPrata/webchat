// VARIÁVEIS GLOBAIS
import { ajax } from "./ajax.js";
let database_messages = [];
let z_index_chat_list = 0;
let transform_chat_list = 0;
let user_list = [];
let chat_list = [];
let socket_id = null;
let chat_selected = null;
let token = localStorage.getItem("token");

const account_info = {
  socket_id: null,
  name: null,
  number: null,
  text: "Nothing",
};

function autentication(token) {
  const id = get_url_id();

  ajax({
    url: "/user" + id,
    metodo: "get",
    headers: [{ header: "Authorization", value: `Bearer ${token}` }],
    sucesso(resposta) {
      if (resposta.code === 200) {
        const user = JSON.parse(resposta.data).user;
        account_info.name = user.name;
        account_info.number = user.number;
        account_info.socket_id = user._id;

        username_div.textContent = account_info.name;
        socket.emit("register", account_info);
      } else {
        console.log(resposta);
      }
    },
    erro(erro) {
      const msg = JSON.parse(erro.data).msg;
      alert(msg);
    },
  });
}

// ----------------------------------------------------------------
// ELEMENTOS DA DOM

const ul = document.getElementById("container-list");
const chat_container = document.getElementById("chat-container");
const conversation_body = document.getElementById("conversation");
const username_div = document.getElementById("your-name-header");
const new_chat = document.getElementById("new-chat");
const section_contacts = document.getElementById("section-contacts");
const side_arrow_back = document.getElementById("side_arrow_back");
const side_search_icon = document.getElementById("side-search-icon");
const side_more_vert = document.getElementById("more_vert");
const menu_option = document.getElementById("menu_option");
const filter_list = document.getElementById("filter_list");

// ----------------------------------------------------------------
// FUNÇÕES DO SOCKET

const socket = io.connect();

socket.on("user_list", (user_list_coming, socket_id_coming) => {
  if (socket_id === null) {
    socket_id = socket_id_coming;
  }
  user_list = user_list_coming;
  load_lista_chat();
});

socket.on("exit", (user_list_coming) => {
  user_list = user_list_coming;
  load_lista_chat();
});

socket.on("send_msg", (data) => {
  receive_message(data);
});

//----------------------------------------------------------------
//----------------------------------------------------------------
//----------------------------------------------------------------
//----------------------------------------------------------------
// BOTÕES DA INTERFACE - INTERAÇÕES

new_chat.addEventListener("click", (event) => {
  // section_contacts.style.opacity = 1;
  setTimeout(() => {
    section_contacts.style.transform = "translateX(0px)";
  }, 100);
  section_contacts.style.display = "block";
});

side_arrow_back.addEventListener("click", (event) => {
  section_contacts.style.transform = null;
  // section_contacts.style.opacity = null;
  setTimeout(() => {
    // section_contacts.style.opacity = null;
    section_contacts.style.display = "none";
  }, 200);
});

side_more_vert.addEventListener("click", () => {
  if (menu_option.style.display == "block") {
    menu_option.style.display = "none";
  } else {
    menu_option.style.display = "block";
  }
});

filter_list.addEventListener("click", (event) => {
  if (filter_list.style.background == "rgb(4, 167, 132)") {
    filter_list.style.background = null;
    filter_list.style.color = null;
  } else {
    filter_list.style.background = "rgb(4, 167, 132)";
    filter_list.style.color = "white";
  }
});

function receive_message(data) {
  update_chat_on_list(data.fromid, data.text, data.user, new Date());
  put_chat_first(data.fromid);
  save_message_on_storage(data);

  if (data.fromid == chat_selected) {
    append_new_message(data);
  }
}

function append_new_message(data) {
  const container_message_other = document.createElement("div");
  const other_message = document.createElement("div");

  const conversation_space = document.getElementById(
    "conversation-panel-messages"
  );

  container_message_other.className = "they-message-container";
  other_message.className = "they-message message-baloon";

  other_message.textContent = data.text;
  container_message_other.appendChild(other_message);

  conversation_space.appendChild(container_message_other);

  conversation_space.scrollTop = conversation_space.scrollHeight;
}

function load_lista_chat() {
  ul.innerHTML = "";
  z_index_chat_list = 0;
  transform_chat_list = 0;
  user_list.forEach(function (e) {
    if (e.id == socket_id) return;
    const chat_li = document.createElement("li");
    const div_infos = document.createElement("div");
    const contact_image = document.createElement("div");
    const img = document.createElement("img");
    const contact_info = document.createElement("div");
    const name_user = document.createElement("div");
    const last_message = document.createElement("div");
    const time = document.createElement("div");

    time.className = "time-stamp";
    // time.textContent = e.last_message.time;
    last_message.className = "last-message";
    // last_message.textContent = `${e.last_message.user}: ${e.last_message.text}`;
    name_user.className = "name-user";
    name_user.textContent = e.user.name;
    contact_info.className = "contact-info";
    img.setAttribute("src", "../image/user-3296.svg");
    contact_image.className = "contact-image";
    chat_li.setAttribute("id", e.id);
    chat_li.onclick = open_chat;
    chat_li.setAttribute("user_name", e.user.name);

    contact_info.appendChild(name_user);
    contact_info.appendChild(last_message);
    contact_image.appendChild(img);
    div_infos.appendChild(contact_image);
    div_infos.appendChild(contact_info);
    chat_li.appendChild(div_infos);
    chat_li.appendChild(time);
    chat_li.classList.add("li-chat");

    chat_li.style.zIndex = z_index_chat_list;
    chat_li.style.transform = `translateY(${transform_chat_list}px)`;

    z_index_chat_list++;
    transform_chat_list = transform_chat_list + 71;

    ul.appendChild(chat_li);
  });
}

function load_header_chat(id) {
  let name_user = document.getElementById(id).getAttribute("user_name");

  conversation_body.innerHTML = "";

  const header = document.createElement("header");
  const img = document.createElement("img");
  const information = document.createElement("div");
  const p = document.createElement("p");

  header.setAttribute("id", "conversation-header");
  header.className = "conversation-header";
  img.setAttribute("src", "./image/user-3296.svg");
  information.className = "informations-header";
  p.className = "name-contact-header";

  header.appendChild(img);
  information.appendChild(p);
  header.appendChild(information);
  conversation_body.appendChild(header);

  p.textContent = name_user;
}

function load_messages_chat(database_messages, id) {
  const conversation_space = document.createElement("div");
  conversation_space.className = "conversation-panel-messages";
  conversation_space.setAttribute("id", "conversation-panel-messages");
  // conversation_body.innerHTML = "";
  conversation_body.appendChild(conversation_space);

  database_messages.forEach((e) => {
    if (e.chat_id == id || e.chat_id == socket_id) {
      e.mensagens.forEach((e) => {
        if (e.number == account_info.number) {
          const container_message_self = document.createElement("div");
          const self_message = document.createElement("div");

          container_message_self.className = "self-message-container";
          self_message.className = "self-message message-baloon";

          self_message.textContent = e.text;
          container_message_self.appendChild(self_message);

          conversation_space.appendChild(container_message_self);
        } else {
          const container_message_other = document.createElement("div");
          const other_message = document.createElement("div");

          container_message_other.className = "they-message-container";
          other_message.className = "they-message message-baloon";

          other_message.textContent = e.text;
          container_message_other.appendChild(other_message);

          conversation_space.appendChild(container_message_other);
        }
      });
    }
  });

  conversation_space.scrollTop = conversation_space.scrollHeight;
}

function send_message(text, chat_id) {
  if (text == "") return;
  let input = document.getElementsByClassName("conversation-input")[0];
  const msg = {
    user: account_info.name,
    number: account_info.number,
    toid: chat_id,
    fromid: socket_id,
    text: text,
    time: new Date(),
  };

  // Enviar a mensagem
  socket.emit("get_msg", msg);

  const conversation_space = document.getElementsByClassName(
    "conversation-panel-messages"
  )[0];

  if (text == null || typeof text == "object") {
    text = input.value;
  }

  const container_message_self = document.createElement("div");
  const self_message = document.createElement("div");

  container_message_self.className = "self-message-container";
  self_message.className = "self-message message-baloon";

  self_message.textContent = text;
  container_message_self.appendChild(self_message);

  conversation_space.appendChild(container_message_self);

  text = text.trim();

  save_message_on_storage(msg);
  input.value = "";

  update_chat_on_list(chat_id, text, account_info.name, new Date());
  put_chat_first(chat_id);
  chat_selected_color(chat_id);
  conversation_space.style.scrollBehavior = "smooth";
  conversation_space.scrollTop = conversation_space.scrollHeight;
}

function load_input_chat(chat_id) {
  const area = document.createElement("div");
  const button_emoji = document.createElement("button");
  const emoji_icon = document.createElement("span");
  const input_text = document.createElement("input");
  const button_send = document.createElement("button");
  const send_icon = document.createElement("span");

  area.className = "conversation-input-area";
  button_emoji.className = "emojis-input";
  emoji_icon.className = "material-icons";
  input_text.className = "conversation-input";
  button_send.className = "button-send";
  send_icon.className = "material-icons";

  input_text.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      send_message(input_text.value, chat_id);
    }
  });

  button_send.addEventListener("click", function () {
    send_message(input_text.value, chat_id);
  });

  emoji_icon.textContent = "sentiment_satisfied_alt";
  send_icon.textContent = "send";

  input_text.setAttribute("type", "text");
  input_text.setAttribute("placeholder", "Mensagem");

  button_emoji.appendChild(emoji_icon);
  button_send.appendChild(send_icon);

  area.appendChild(button_emoji);
  area.appendChild(input_text);
  area.appendChild(button_send);

  conversation_body.appendChild(area);
}

function chat_selected_color(id) {
  let chats = document.querySelectorAll(".chat-selected");

  chats.forEach(function (e) {
    e.classList.remove("chat-selected");
  });

  const chat_selected = document.getElementById(id);
  chat_selected.classList.add("chat-selected");
}

function open_chat() {
  const id = this.id;

  chat_selected_color(id);

  load_header_chat(id);

  load_messages_chat(database_messages, id);

  load_input_chat(id);

  chat_selected = id;
}

function put_chat_first(chat_id) {
  const notified_chat = document.getElementById(chat_id);
  if (notified_chat == null) return;
  const notified_chat_copy = notified_chat;
  let array_chats = document.querySelectorAll(".li-chat");

  transform_chat_list = 0;
  notified_chat.style.transform = `translateY(${transform_chat_list}px)`;
  notified_chat.style.zIndex = 0;

  setTimeout(() => {
    notified_chat.remove();
    ul.insertAdjacentElement("afterbegin", notified_chat_copy);
  }, 550);

  transform_chat_list = 71;
  z_index_chat_list = 1;
  array_chats.forEach((e) => {
    if (e != notified_chat) {
      e.style.transform = `translateY(${transform_chat_list}px)`;
      e.style.zIndex = z_index_chat_list;
      transform_chat_list += 71;
      z_index_chat_list++;
    }
  });
}

function update_chat_on_list(chat_id, text, user, time) {
  const chat = document.getElementById(chat_id);
  const last_message = chat.querySelector(".last-message");
  const time_stamp = chat.querySelector(".time-stamp");

  text = `${user}: ${text}`;

  last_message.textContent = text;
  time_stamp.textContent = time;
}

function save_message_on_storage(new_message) {
  // SE NÃO HOUVER MENSAGENS NO BANCO ELE CRIARÁ
  if (database_messages.length == 0) {
    database_messages.push({
      chat_id:
        new_message.fromid == socket_id ? new_message.toid : new_message.fromid,
      mensagens: [new_message],
    });
  }

  // SE HOUVER MENSAGENS
  else {
    let exist = false;
    database_messages.forEach((e, i) => {
      // VERIFICARÁ SE JÁ EXISTE AQUELE CHAT
      if (e.chat_id == new_message.fromid || e.chat_id == new_message.toid) {
        e.mensagens.push(new_message);
        exist = true;
      }
    });

    if (!exist) {
      database_messages.push({
        chat_id:
          new_message.fromid == socket_id
            ? new_message.toid
            : new_message.fromid,
        mensagens: [new_message],
      });
    }
  }
  console.log(database_messages);
}

function id_generator() {
  const id = Math.floor(Date.now() * Math.random()).toString(36);
  return id;
}

function get_url_id() {
  let id = window.location.pathname;

  return id;
}

autentication(token);
