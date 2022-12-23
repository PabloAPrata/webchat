// VARIÁVEIS GLOBAIS
import { ajax } from "./ajax.js";

let cached_messages = [];
let z_index_chat_list = 0;
let transform_chat_list = 0;

let online_user_list = [];
let contacts_list = [];
let chats_list = [];

let socket_id = null;
let chat_selected = null;
let members_chat_opened = [];
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
      }
    },
    erro(erro) {
      const msg = JSON.parse(erro.data).msg;
      alert(msg);
      window.location.pathname = "/";
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

socket.on("online_user_list", (online_user_list_coming, socket_id_coming) => {
  if (socket_id === null) {
    socket_id = socket_id_coming;
  }
  online_user_list = online_user_list_coming;
  // load_chats_list();
  console.log(online_user_list);
});

socket.on("exit", (online_user_list_coming) => {
  console.log(online_user_list_coming);
  online_user_list = online_user_list_coming;
  // load_chats_list();
});

socket.on("send_msg", (data) => {
  console.log(data);
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
  update_chat_on_list(data.chat_id, data.text, data.sender_name, new Date());
  put_chat_first(data.chat_id);
  // save_message_on_storage(data);

  if (data.chat_id == chat_selected) {
    append_new_message(data);
  }
}

function get_members_by_chat_id(chat_id) {
  // chats_list
  let size = chats_list.length;
  let members = [];
  for (let i = 0; i < size; i++) {
    if (chats_list[i]._id === chat_id) {
      members = chats_list[i].members;
      break;
    }
  }

  return members;
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

function remove_my_number(array_members) {
  const result = array_members.filter(
    (element) => element !== account_info.number
  );

  return result;
}

function get_name_user_by_number(number) {
  let size = contacts_list.length;
  let name = null;
  for (let i = 0; i < size; i++) {
    if (contacts_list[i].number === number) {
      name = contacts_list[i].name;
      break;
    }
  }

  if (name === null) return number;
  else return name;
}

function load_chats_list() {
  ul.innerHTML = "";
  z_index_chat_list = 0;
  transform_chat_list = 0;

  chats_list.forEach(function (e) {
    let name = null;
    const other_members = remove_my_number(e.members);

    if (other_members.length === 1) {
      name = get_name_user_by_number(other_members[0]);
    }

    const chat_li = document.createElement("li");
    const div_infos = document.createElement("div");
    const contact_image = document.createElement("div");
    const img = document.createElement("img");
    const contact_info = document.createElement("div");
    const name_user = document.createElement("div");
    const last_message = document.createElement("div");
    const time = document.createElement("div");

    time.className = "time-stamp";

    name_user.className = "name-user";
    name_user.textContent = name;
    contact_info.className = "contact-info";
    img.setAttribute("src", "../image/user-3296.svg");
    contact_image.className = "contact-image";
    chat_li.setAttribute("id", e._id);
    chat_li.onclick = open_chat;
    chat_li.setAttribute("user_name", name);

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

    if (e.lmessage != 0) {
      time.textContent = e.lmessage.time;
      last_message.className = "last-message";
      last_message.textContent = `${e.lmessage.sender_name}: ${e.lmessage.text}`;
    }

    ul.appendChild(chat_li);
  });

  return true;
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

function load_messages_chat(cached_messages, id) {
  // Elementos visuais
  const conversation_space = document.createElement("div");
  conversation_space.className = "conversation-panel-messages";
  conversation_space.setAttribute("id", "conversation-panel-messages");
  // conversation_body.innerHTML = "";
  conversation_body.appendChild(conversation_space);

  // Verifica se existe chat no cache
  const chat_cached = get_chat_cached(id);

  if (!chat_cached) {
    const messages = get_database_messages(token, id);

    messages.forEach((message) => {
      put_message_cache(id, message);
    });
  }

  cached_messages.forEach((e) => {
    if (e.chat_id == id || e.chat_id == socket_id) {
      e.messages.forEach((e) => {
        if (e.sender_number == account_info.number) {
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

function persist_message_db(chat_id, text) {
  ajax({
    url: "/chat/sendMessage",
    metodo: "post",
    headers: [{ header: "Authorization", value: `Bearer ${token}` }],
    body: {
      chat_id: chat_id,
      text: text,
    },
    sucesso(resposta) {
      if (resposta.code === 201) {
      } else {
      }
    },
    erro(erro) {
      const msg = JSON.parse(erro.data).msg;
      alert(msg);
    },
  });
}

function send_message(text, chat_id) {
  if (text == "") return;
  let input = document.getElementsByClassName("conversation-input")[0];

  let members = get_members_by_chat_id(chat_id);

  members = remove_my_number(members);

  const msg = {
    sender_name: account_info.name,
    sender_number: account_info.number,
    members: members,
    chat_id: chat_id,
    text: text,
    time: new Date(),
  };

  put_message_cache(chat_id, msg);
  persist_message_db(chat_id, text);

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

  // save_message_on_storage(msg);
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

  load_messages_chat(cached_messages, id);

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

let get_chatlist_1ft = false;
function get_chat_list(token) {
  ajax({
    url: "/chat/list",
    metodo: "get",
    headers: [{ header: "Authorization", value: `Bearer ${token}` }],
    sucesso(resposta) {
      if (resposta.code === 200) {
        const resposta_data = JSON.parse(resposta.data);
        chats_list = [...resposta_data.chatsList];

        if (!get_chatlist_1ft) {
          load_chats_list();
          get_chatlist_1ft = true;
        }
      } else {
      }
    },
    erro(erro) {
      const msg = JSON.parse(erro.data).msg;
      alert(msg);
    },
  });
}

function get_contacts_list(token) {
  ajax({
    url: "/contacts/list",
    metodo: "get",
    headers: [{ header: "Authorization", value: `Bearer ${token}` }],
    sucesso(resposta) {
      if (resposta.code === 200) {
        const resposta_data = JSON.parse(resposta.data);

        contacts_list = [...resposta_data.contacts];
      } else {
      }
    },
    erro(erro) {
      const msg = JSON.parse(erro.data).msg;
      alert(msg);
    },
  });
}

function get_database_messages(token, chat_id) {
  let messages = null;
  ajax({
    url: "/chat/messages/" + chat_id,
    metodo: "get",
    headers: [{ header: "Authorization", value: `Bearer ${token}` }],
    sucesso(resposta) {
      if (resposta.code === 200) {
        const resposta_data = JSON.parse(resposta.data);
        messages = resposta_data.messages;
      } else {
      }
    },
    erro(erro) {
      const msg = JSON.parse(erro.data).msg;
      alert(msg);
    },
    async: false,
  });
  return messages;
}

function put_message_cache(chat_id, message) {
  const index = find_index_cached_chat(chat_id);

  if (index || index === 0) {
    if (!cached_messages[index]) {
      cached_messages.push({
        chat_id: chat_id,
        messages: [message],
      });
    } else {
      cached_messages[index].messages.push(message);
    }
  } else {
    cached_messages.push({
      chat_id: chat_id,
      messages: [message],
    });
  }
}

function get_chat_cached(chat_id) {
  const size = cached_messages.length;
  let chat = null;
  for (let i = 0; i < size; i++) {
    if (cached_messages[i].chat_id === chat_id) {
      chat = cached_messages[i];
      break;
    }
  }

  return chat;
}

function find_index_cached_chat(chat_id) {
  const size = cached_messages.length;

  let chat = null;
  for (let i = 0; i < size; i++) {
    if (cached_messages[i].chat_id === chat_id) {
      chat = i;
      break;
    }
  }

  return chat;
}

function get_url_id() {
  let id = window.location.pathname;

  return id;
}

autentication(token);
get_chat_list(token);
get_contacts_list(token);
