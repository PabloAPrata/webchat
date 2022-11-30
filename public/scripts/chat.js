const myUser = {
  name: "Pablo Prata",
  number: "9992480831",
  password: "password",
  text: "Eh nois",
};
let global_list_chats;
let global_list_messages;

let z_index_chat_list = 0;
let transform_chat_list = 0;

const ul = document.getElementById("container-list");
const chat_container = document.getElementById("chat-container");
const conversation_body = document.getElementById("conversation");

// ---------------------------------------
// Ajax configs
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
// ---------------------------------------

//----------------------------------------------------------------
// É OQ FARÁ COM A MENSAGEM RECEBIDA
const socket = io();
socket.on("connect", () => {
  socket.emit("msg", "I am connected " + socket.id);
});
socket.on("msg", (msg) => {
  update_opened_chat(msg.chat_id, msg);
});
//----------------------------------------------------------------
 // Check if has

function update_opened_chat(id, msg) {
  if (id === undefined) return;

  global_list_messages.forEach((e) => {
    if (e.chat_id == msg.chat_id) {
      e.mensagens.push(msg);
    }
  });

  update_chat_on_list(id, msg.text, msg.user, msg.time);

  chat_selected_color(id);

  put_chat_first(id);

  load_header_chat(id);

  load_messages_chat(global_list_messages, id);

  load_input_chat(id);
}

function get_notification() {
  ajax({
    url: "get-update",
    metodo: "post",
    body: {
      number: myUser.number,
    },
    sucesso(resposta) {
      if (resposta == 0) return;
      console.log(resposta);
    },
  });
}

function get_chat_list() {
  ajax({
    url: "chats",
    metodo: "get",
    sucesso(resposta) {
      global_list_chats = JSON.parse(resposta);
      load_lista_chat();
    },
  });
}

function get_messages() {
  ajax({
    url: "conversations",
    metodo: "get",
    sucesso(resposta) {
      global_list_messages = JSON.parse(resposta);
    },
  });
}

function load_lista_chat() {
  global_list_chats.forEach(function (e) {
    const chat_li = document.createElement("li");
    const div_infos = document.createElement("div");
    const contact_image = document.createElement("div");
    const img = document.createElement("img");
    const contact_info = document.createElement("div");
    const name_user = document.createElement("div");
    const last_message = document.createElement("div");
    const time = document.createElement("div");

    time.className = "time-stamp";
    time.textContent = e.last_message.time;
    last_message.className = "last-message";
    last_message.textContent = `${e.last_message.user}: ${e.last_message.text}`;
    name_user.className = "name-user";
    name_user.textContent = e.name;
    contact_info.className = "contact-info";
    img.setAttribute("src", "../image/user-3296.svg");
    contact_image.className = "contact-image";
    chat_li.setAttribute("id", e.chat_id);
    chat_li.onclick = open_chat;
    chat_li.setAttribute("user_name", e.name);

    contact_info.appendChild(name_user);
    contact_info.appendChild(last_message);
    contact_image.appendChild(img);
    div_infos.appendChild(contact_image);
    div_infos.appendChild(contact_info);
    chat_li.appendChild(div_infos);
    chat_li.appendChild(time);

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

function load_messages_chat(data_messages, id) {
  const conversation_space = document.createElement("div");
  conversation_space.className = "conversation-panel-messages";
  conversation_body.appendChild(conversation_space);

  // console.log(data_messages);

  data_messages.forEach((e) => {
    if (e.chat_id == id) {
      e.mensagens.forEach((e) => {
        if (e.number == myUser.number) {
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
    user: myUser.name,
    number: myUser.number,
    chat_id: chat_id,
    text: text,
    time: new Date(),
  };

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

  ajax({
    url: "/send-message",
    metodo: "put",
    body: {
      user: myUser.name,
      number: myUser.number,
      chat_id: chat_id,
      text: text,
      time: new Date(),
    },
    sucesso(resposta) {},
    erro(resposta) {
      console.log(resposta);
    },
  });

  global_list_messages.forEach((e) => {
    if (e.chat_id == chat_id) {
      e.mensagens.push(msg);
    }
  });
  input.value = "";

  update_chat_on_list(chat_id, text, myUser.name, new Date());
  put_chat_first(chat_id);
  chat_selected_color(chat_id);
  conversation_space.style.scrollBehavior = "smooth";
  conversation_space.scrollTop = conversation_space.scrollHeight;

  // ENVIANDO A MENSAGEM PARA TODOS, EXCETO QUEM ESTÁ ENVIANDO
  socket.emit("msg", msg);
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

  load_messages_chat(global_list_messages, id);

  load_input_chat(id);
}

function put_chat_first(chat_id) {
  const notified_chat = document.getElementById(chat_id);
  if (notified_chat == null) return;
  const notified_chat_copy = notified_chat;
  let array_chats = document.querySelectorAll("li");

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

get_messages();
get_chat_list();
