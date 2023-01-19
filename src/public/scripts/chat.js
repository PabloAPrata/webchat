// VARIÁVEIS GLOBAIS
import { ajax } from "./ajax.js";
import "https://cdn.jsdelivr.net/npm/emoji-picker-element@^1/index.js";
import insertText from "https://cdn.jsdelivr.net/npm/insert-text-at-cursor@0.3.0/index.js";

let cached_messages = [];
let z_index_chat_list = 0;
let transform_chat_list = 0;

let online_user_list = [];
let contacts_list = [];
let chats_list = [];
let contact_list_copy = [];

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

// SONS

// Som de notificação
// Obter uma referência ao elemento audio
const sound_new_message = document.getElementById("sound_new_message");

// ----------------------------------------------------------------
// ELEMENTOS DA DOM

const ul_chat = document.getElementById("container-list");
const chat_container = document.getElementById("chat-container");
const conversation_body = document.getElementById("conversation");
const username_div = document.getElementById("your-name-header");
const new_chat = document.getElementById("new-chat");
const section_contacts = document.getElementById("section-contacts");
const side_arrow_back = document.getElementById("side_arrow_back");
const side_search_icon = document.getElementById("side-search-icon");
const side_more_vert = document.getElementById("more_vert");
const menu_option = document.getElementById("menu_option");
const overlay_menu_option = document.getElementById("overlay_menu_option");
const filter_list = document.getElementById("filter_list");
const side_contacts = document.getElementById("side-contacts");
const input_search_chat = document.getElementById("input_search_chat");
const input_search_contacts = document.getElementById("input_search_contacts");
const container_search_chat = document.getElementById("container_search_chat");
const clear_search_chat_button = document.getElementById("clear_search_chat");
const new_contact = document.getElementById("new-contact");
const new_contact_div = document.getElementById("new-contact-div");
const new_contact_side_back = document.getElementById("new_contact_side_back");
const search_button = document.getElementById("search_button");
const input_new_contact = document.getElementById("input_new_contact");
const disconnect_button = document.getElementById("disconnect-button");
const section_new_group = document.getElementById("section-new-group");
const new_group = document.getElementById("new_group");
const new_chat_arrow_back = document.getElementById("new_chat_arrow_back");
const ul_new_group = document.getElementById("ul_new_group");
const input_search_newG = document.getElementById("input_search_newG");
const new_group_selected = document.getElementById("new_group_selected");
const container_button_users_selected = document.getElementById(
  "container_button_users_selected"
);
const button_users_selected = document.getElementById("button_users_selected");
const new_group_button = document.getElementById("new-group-button");
const group_name_input = document.getElementById("group_name_input");
const name_group_caractere_counter = document.getElementById(
  "name-group-caractere-counter"
);
const group_name_arrow_back = document.getElementById("group_name_arrow_back");
const section_new_group_name = document.getElementById(
  "section-new-group-name"
);
const container_button_name_group = document.getElementById(
  "container_button_name_group"
);
const button_create_group = document.getElementById("button_create_group");
// ----------------------------------------------------------------
// FUNÇÕES DO SOCKET

const socket = io.connect();

socket.on("connect", () => {
  const mySocketID = socket.id;
});

socket.on("online_user_list", (online_user_list_coming, socket_id_coming) => {
  if (socket_id === null) {
    socket_id = socket_id_coming;
  }
  online_user_list = online_user_list_coming;

  put_status_contacts(online_user_list);
});

socket.on("unread messages", (event) => {
  setTimeout(() => {
    // alert(event.text);
  }, 1000);
});

socket.on("exit", (online_user_list_coming) => {
  online_user_list = online_user_list_coming;
  put_status_contacts(online_user_list);
});

socket.on("send_msg", (data) => {
  receive_message(data);
  if (hiddenPage) {
    notification_navigador(data);
  }
});

socket.on("typing", (event) => {
  // Verifica se o evento é para o chat qu está aberto
  if (event.chat_id === chat_selected) {
    // Executa a função no chat aberto
    const header = document.getElementById("informations-header");
    if (header) {
      const typing = document.createElement("p");
      typing.textContent = `${event.user.name} está digitando...`;
      typing.classList.add("typing_ntf");
      typing.setAttribute("id", "typing_ntf");

      header.appendChild(typing);

      setTimeout(() => {
        document.getElementById("typing_ntf").remove();
      }, 3000);
    }
  }
  // Executa a função na lista de chats
});

//----------------------------------------------------------------
//----------------------------------------------------------------

// BOTÕES DA INTERFACE - INTERAÇÕES

new_chat.addEventListener("click", (event) => {
  setTimeout(() => {
    section_contacts.style.transform = "translateX(0px)";
  }, 100);
  section_contacts.style.display = "block";
});
function close_side_contacts() {
  section_contacts.style.transform = null;

  setTimeout(() => {
    section_contacts.style.display = "none";
  }, 200);
}
side_arrow_back.addEventListener("click", close_side_contacts);

overlay_menu_option.addEventListener("click", (event) => {
  if (event.target === overlay_menu_option)
    overlay_menu_option.style.display = "none";
});

side_more_vert.addEventListener("click", () => {
  if (menu_option.style.display == "block") {
    overlay_menu_option.style.display = "none";
  } else {
    overlay_menu_option.style.display = "block";
  }
});

filter_list.addEventListener("click", (event) => {
  if (filter_list.style.background == "rgb(73, 127, 251)") {
    filter_list.style.background = null;
    filter_list.style.color = null;
  } else {
    filter_list.style.background = "rgb(73, 127, 251)";
    filter_list.style.color = "white";
  }
});

input_search_chat.addEventListener("keyup", function () {
  search_for_chat();
});

input_search_chat.addEventListener("focus", function () {
  container_search_chat.style.display = "block";
  clear_search_chat_button.style.display = "block";
  filter_list.style.display = "none";
  search_for_chat();
});

input_search_contacts.addEventListener("keyup", function (e) {
  search_for_contacts();
});

clear_search_chat_button.addEventListener("click", function () {
  clear_search_chat();
});

new_contact.addEventListener("click", function () {
  new_contact_div.style.transform = "translateX(0px)";
});

new_contact_side_back.addEventListener("click", function () {
  new_contact_div.style.transform = null;
});

new_chat_arrow_back.addEventListener("click", function () {
  section_new_group.style.transform = null;
});

disconnect_button.addEventListener("click", function () {
  disconnect();
});

search_button.addEventListener("click", function () {
  add_contact_api();
});

input_new_contact.addEventListener("keydown", function (e) {
  if (e.keyCode !== 13) return;

  add_contact_api();
});

new_group.addEventListener("click", function () {
  section_new_group.style.transform = "translateX(0px)";
  input_search_newG.value = "";
  inner_contacts_new_group();
});

new_group_button.addEventListener("click", function () {
  section_new_group.style.transform = "translateX(0px)";
  input_search_newG.value = "";
  inner_contacts_new_group();
});

input_search_newG.addEventListener("keyup", function () {
  search_contact_new_group();
});

var create_chat_options = {
  name: "",
  members: [],
};

button_users_selected.addEventListener("click", function () {
  // ? --------------------------------

  section_new_group_name.style.transform = "translateX(0)";

  // ? --------------------------------
});

group_name_input.addEventListener("keyup", () => {
  const characterCount = group_name_input.value.length;

  name_group_caractere_counter.textContent = 25 - characterCount;

  if (characterCount > 0) {
    container_button_name_group.style.display = "flex";
  } else {
    container_button_name_group.style.display = "none";
  }
});

button_create_group.addEventListener("click", function () {
  const name = group_name_input.value;

  if (name.length > 25) {
    alert("Por favor, insira um número com no máximo 25 caracteres.");
    return;
  }

  // Pega os membros selecionados
  let array_members = [];
  let members = new_group_selected.childNodes;
  members.forEach(function (element) {
    const number = element.getAttribute("user_number");
    array_members.push(number);
  });

  // Coloca o meu número
  array_members.push(account_info.number);

  createChatAPI(array_members, name).then((resultado) => {
    // Guarda o id do chat criado:
    const newID = JSON.parse(resultado.data).id;

    // Atualiza a lista de chats no cache:
    get_chat_list(token).then((resposta) => {
      const resposta_data = JSON.parse(resposta.data);

      chats_list = [...resposta_data.chatsList];

      load_chats_list();

      load_header_chat(newID);

      load_messages_chat(cached_messages, newID);

      load_input_chat(newID);

      chat_selected_color(newID);

      close_side_contacts();

      chat_selected = newID;

      put_status_contacts(online_user_list);

      new_group_selected.innerHTML = "";

      section_new_group.style.transform = null;
    });
  });
});

// Verifica se o navegador suporta o evento visibilitychange
if (typeof document.hidden !== "undefined") {
  // Adiciona um ouvinte de eventos para o evento visibilitychange
  document.addEventListener("visibilitychange", function () {
    // Verifica se a página está aberta
    if (!document.hidden) {
      // A página está aberta
      hiddenPage = false;
    } else {
      // A página está fechada
      hiddenPage = true;
    }
  });
}

group_name_arrow_back.addEventListener("click", function () {
  section_new_group_name.style.transform = null;
});

input_new_contact.onkeyup = () => applyPhoneMask(event);

//================================================================

let canSendTyping = true;
function send_typing() {
  if (canSendTyping) {
    // Estrutura do dado que será enviado
    const data = {
      user: account_info,
      chat_id: chat_selected,
    };

    socket.emit("typing", data);

    canSendTyping = false;

    setTimeout(function () {
      canSendTyping = true;
    }, 3000);
  }
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

function add_contact_api() {
  const number = input_new_contact.value;

  if (!number) {
    alert("Por favor, insira um número");
  }

  ajax({
    url: "/contacts/add",
    metodo: "post",
    headers: [{ header: "Authorization", value: `Bearer ${token}` }],
    body: {
      number: number,
    },
    sucesso(resposta) {
      if (resposta.code === 201 || resposta.code === 200) {
        const msg = JSON.parse(resposta.data).msg;

        get_contacts_list(token).then((resposta) => {
          if (resposta.code === 200) {
            const resposta_data = JSON.parse(resposta.data);

            contacts_list = [];
            contacts_list = [...resposta_data.contacts];

            load_contacts_list();
            put_status_contacts(online_user_list);
          } else {
            alert(resposta);
            console.log(resposta);
          }

          get_chat_list(token).then((resposta) => {
            // Se não possuit chat
            if (resposta.code === 204) return;

            const resposta_data = JSON.parse(resposta.data);
            chats_list = [...resposta_data.chatsList];

            load_chats_list();

            put_status_contacts(online_user_list);
          });
        });

        input_new_contact.value = "";
        new_contact_div.style.transform = null;

        alert(msg);
      }
    },
    erro(resposta) {
      let msg = JSON.parse(resposta.data).msg;
      alert(msg);
      input_new_contact.value = "";
    },
  });
}

function clear_search_chat() {
  container_search_chat.style.display = "none";
  clear_search_chat_button.style.display = "none";
  filter_list.style.display = "block";
  input_search_chat.value = "";
  container_search_chat.innerHTML = "";
}

function put_status_contacts(users_on) {
  const status_contacts = document.querySelectorAll(".status-contact");

  if (!users_on) users_on = online_user_list;

  users_on.forEach((e) => {
    const user_number = e.user.number;

    status_contacts.forEach((status_contact) => {
      const contact = status_contact.getAttribute("number");

      if (contact == user_number) {
        status_contact.classList.add("online");
      }
    });
  });
}

function autentication(token) {
  const id = get_url_id();

  ajax({
    url: "/user/" + id,
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
      console.log(erro);
    },
  });
}

async function createChatAPI(arrayMembers, name) {
  arrayMembers.sort();

  return new Promise((resolve, reject) => {
    ajax({
      url: "/chat/create",
      metodo: "post",
      headers: [{ header: "Authorization", value: `Bearer ${token}` }],
      body: {
        name,
        members: arrayMembers,
      },
      sucesso: resolve,
      erro: reject,
    });
  });
}
function put_chat_on_cache(data) {
  chats_list.push({
    group: false,
    lmessage: {
      sender_name: data.sender_name,
      sender_number: data.sender_number,
      text: data.text,
      time: data.time,
    },
    members: data.members,
    _id: data.chat_id,
    name: get_name_user_by_number(data.sender_number),
  });
}

function receive_message(data) {
  put_message_cache(data.chat_id, data);
  // Se não houver chat
  const chat = document.getElementById(data.chat_id);
  if (!chat) {
    put_chat_on_cache(data);
    load_chats_list();
    put_status_contacts(online_user_list);
  }

  const time = formatted_time(data.time);
  update_chat_on_list(data.chat_id, data.text, data.sender_name, "agora");
  put_chat_first(data.chat_id);

  if (data.chat_id == chat_selected) {
    append_new_message(data);
  }

  if (chat.classList) {
    const isOpen = chat.classList.contains("chat-selected");
    if (!isOpen) {
      notification_bubble(data.chat_id);
      sound_new_message.play();
    }
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
  const text_message = document.createElement("div");
  const time_message = document.createElement("div");

  const conversation_space = document.getElementById(
    "conversation-panel-messages"
  );

  container_message_other.className = "they-message-container";
  other_message.className = "they-message message-baloon";
  text_message.className = "text-message";
  time_message.className = "time-message";

  text_message.textContent = data.text;
  time_message.textContent = get_current_time();

  other_message.appendChild(text_message);
  other_message.appendChild(time_message);
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
  ul_chat.innerHTML = "";
  z_index_chat_list = 0;
  transform_chat_list = 0;

  chats_list.forEach(function (e) {
    let name = null;
    const other_members = remove_my_number(e.members);

    const size_other_members = other_members.length;

    // Se não for um grupo, o nome que aparecerá será o nome do outro usuário
    if (!e.name) {
      if (size_other_members === 1) {
        name = get_name_user_by_number(other_members[0]);
        e.name = name;
      }

      if (size_other_members > 1) {
        other_members.forEach((e, i) => {
          name = name === null ? "" : name;
          name = name + get_name_user_by_number(e) + ", ";
        });
        e.name = name;
      }
    } else {
      name = e.name;
    }

    const chat_li = document.createElement("li");
    const div_infos = document.createElement("div");
    const contact_image = document.createElement("div");
    const img = document.createElement("img");
    const contact_info = document.createElement("div");
    const name_user = document.createElement("div");
    const last_message = document.createElement("div");
    const time = document.createElement("div");
    const status = document.createElement("div");
    const container_time_notification = document.createElement("div");
    const circle_notification = document.createElement("div");

    container_time_notification.className = "container_time_notification";
    circle_notification.className = "circle_notification";
    circle_notification.setAttribute("id", "ntf_" + e._id);
    time.className = "time-stamp";
    time.setAttribute("id", "time_" + e._id);
    name_user.className = "name-user";
    name_user.textContent = name;
    contact_info.className = "contact-info";
    img.setAttribute("src", "../image/user-3296.svg");
    contact_image.className = "contact-image";
    status.className = "status-contact";
    status.setAttribute("number", other_members[0]);
    chat_li.setAttribute("id", e._id);
    chat_li.onclick = open_chat;
    chat_li.setAttribute("user_name", name);
    last_message.className = "last-message";

    contact_info.appendChild(name_user);
    contact_info.appendChild(last_message);
    contact_image.appendChild(img);
    contact_image.appendChild(status);
    div_infos.appendChild(contact_image);
    div_infos.appendChild(contact_info);
    container_time_notification.appendChild(time);
    container_time_notification.appendChild(circle_notification);
    chat_li.appendChild(div_infos);
    chat_li.appendChild(container_time_notification);
    chat_li.classList.add("li-chat");

    chat_li.style.zIndex = z_index_chat_list;
    chat_li.style.transform = `translateY(${transform_chat_list}px)`;

    z_index_chat_list++;
    transform_chat_list = transform_chat_list + 71;

    if (e.lmessage != 0) {
      time.textContent = formatted_time(e.lmessage.time);

      last_message.textContent = `${e.lmessage.sender_name}: ${e.lmessage.text}`;
    }

    ul_chat.appendChild(chat_li);
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
  img.setAttribute("src", "../image/user-3296.svg");
  information.className = "informations-header";
  information.setAttribute("id", "informations-header");
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
  conversation_body.appendChild(conversation_space);

  // Verifica se existe chat no cache
  const chat_cached = get_chat_by_id(id);

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
          const text_message = document.createElement("div");
          const time_message = document.createElement("div");

          container_message_self.className = "self-message-container";
          self_message.className = "self-message message-baloon";
          text_message.className = "text-message";
          time_message.className = "time-message";

          text_message.textContent = e.text;
          time_message.textContent = get_horas(e.time);

          self_message.appendChild(text_message);
          self_message.appendChild(time_message);
          container_message_self.appendChild(self_message);

          conversation_space.appendChild(container_message_self);
        } else {
          const container_message_other = document.createElement("div");
          const other_message = document.createElement("div");
          const text_message = document.createElement("div");
          const time_message = document.createElement("div");

          container_message_other.className = "they-message-container";
          other_message.className = "they-message message-baloon";
          text_message.className = "text-message";
          time_message.className = "time-message";

          text_message.textContent = e.text;
          time_message.textContent = get_horas(e.time);

          other_message.appendChild(text_message);
          other_message.appendChild(time_message);
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

  clear_search_chat();

  let input = document.getElementsByClassName("conversation-input")[0];

  let members = get_members_by_chat_id(chat_id);

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
  const text_message = document.createElement("div");
  const time_message = document.createElement("div");

  container_message_self.className = "self-message-container";
  self_message.className = "self-message message-baloon";
  text_message.className = "text-message";
  time_message.className = "time-message";

  text_message.textContent = text;
  time_message.textContent = get_current_time();

  self_message.appendChild(text_message);
  self_message.appendChild(time_message);
  container_message_self.appendChild(self_message);

  conversation_space.appendChild(container_message_self);

  text = text.trim();

  // save_message_on_storage(msg);
  input.value = "";

  const time = formatted_time(new Date());
  update_chat_on_list(chat_id, text, account_info.name, time);
  put_chat_first(chat_id);
  chat_selected_color(chat_id);
  conversation_space.style.scrollBehavior = "smooth";
  conversation_space.scrollTop = conversation_space.scrollHeight;
}

// EMOJIS

function create_emoji_picker() {
  const element_body = document.querySelector("body");

  // Cria o emoji_overlay
  const emoji_overlay = document.createElement("div");
  emoji_overlay.setAttribute("id", "emoji-overlay");
  emoji_overlay.style.position = "fixed";
  emoji_overlay.style.height = "100vh";
  emoji_overlay.style.width = "100vw";
  emoji_overlay.style.backgroundColor = "transparent";
  emoji_overlay.style.bottom = "60px";
  emoji_overlay.style.zIndex = "999";
  emoji_overlay.addEventListener("click", button_emoji_picker);

  // Cria o emoji_picker
  const emoji_picker = document.createElement("emoji-picker");
  // emoji_picker.classList.add("dark");
  emoji_picker.style.position = "absolute";
  emoji_picker.style.bottom = "0";
  emoji_picker.style.left = "30%";

  // Insere o emoji_picker dentro do overlay
  emoji_overlay.appendChild(emoji_picker);

  element_body.insertAdjacentElement("beforeend", emoji_overlay);

  document
    .querySelector("emoji-picker")
    .addEventListener("emoji-click", (e) => {
      insertText(
        document.getElementById("input_text_message"),
        e.detail.unicode
      );
    });
}

function hide_emoji_picker() {
  const emoji_overlay = document.getElementById("emoji-overlay");

  emoji_overlay.style.display = "none";
}

function show_emoji_picker() {
  const emoji_overlay = document.getElementById("emoji-overlay");

  emoji_overlay.style.display = "block";
}

function button_emoji_picker(e) {
  const emoji_overlay = document.getElementById("emoji-overlay");
  const emoji_picker = document.getElementsByTagName("emoji-picker");

  if (emoji_picker[0] === e.target) return;
  if (emoji_overlay) {
    // Verifica se existe
    // Se existir
    // Se tiver escondido aparecerá
    if (emoji_overlay.style.display === "none") {
      show_emoji_picker();
    } else {
      hide_emoji_picker();
    }
    return;
  }

  create_emoji_picker();
}

function load_input_chat(chat_id) {
  const area = document.createElement("div");
  const button_emoji = document.createElement("button");
  const emoji_icon = document.createElement("span");
  const input_text = document.createElement("input");
  const button_send = document.createElement("button");
  const send_icon = document.createElement("span");

  input_text.setAttribute("id", "input_text_message");

  area.className = "conversation-input-area";
  button_emoji.className = "emojis-input";
  emoji_icon.className = "material-icons";
  input_text.className = "conversation-input";
  button_send.className = "button-send";
  send_icon.className = "material-icons";

  button_emoji.addEventListener("click", button_emoji_picker);

  input_text.addEventListener("keydown", function (e) {
    // Função que envia notificação dizendo que alguém está digitando
    send_typing();

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

  remove_bubble(id);
}

function open_chat_by_contact() {
  let id = this.id;
  const div_contact = document.getElementById(id);

  //Remove o nome contact
  id = id.split("contact")[1];

  let chatExists = get_chat_by_id(id);

  // Se existir um chat com aquele ID, abre o chat e termina a função.
  if (chatExists) {
    id = chatExists._id;

    load_header_chat(id);

    load_messages_chat(cached_messages, id);

    load_input_chat(id);

    chat_selected_color(id);

    close_side_contacts();

    return;
  }

  // Se não existe com ID, verifica se há pelo membro
  let arrayMembers = [account_info.number];
  let numberContact = div_contact.getAttribute("user_number");
  arrayMembers.push(numberContact);
  arrayMembers.sort();

  chatExists = get_chat_by_members(arrayMembers);

  if (chatExists) {
    id = chatExists._id;

    load_header_chat(id);

    load_messages_chat(cached_messages, id);

    load_input_chat(id);

    chat_selected_color(id);

    close_side_contacts();

    return;
  }

  // Cria um chat
  createChatAPI(arrayMembers).then((resultado) => {
    // Guarda o id do chat criado:
    const newID = JSON.parse(resultado.data).id;

    // Atualiza a lista de chats no cache:
    get_chat_list(token).then((resposta) => {
      const resposta_data = JSON.parse(resposta.data);

      chats_list = [...resposta_data.chatsList];

      load_chats_list();

      load_header_chat(newID);

      load_messages_chat(cached_messages, newID);

      load_input_chat(newID);

      chat_selected_color(newID);

      close_side_contacts();

      chat_selected = newID;

      put_status_contacts(online_user_list);
    });
  });
}

function get_chat_by_members(arrayMembers) {
  let chat = false;
  chats_list.forEach((e) => {
    if (JSON.stringify(e.members) == JSON.stringify(arrayMembers)) {
      chat = e;
    }
  });

  return chat;
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
    ul_chat.insertAdjacentElement("afterbegin", notified_chat_copy);
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

async function get_chat_list(token) {
  return new Promise((resolve, reject) => {
    ajax({
      url: "/chat/list",
      metodo: "get",
      headers: [{ header: "Authorization", value: `Bearer ${token}` }],
      sucesso: resolve,
      erro: reject,
    });
  });
}

// async function createChatAPI(arrayMembers, name) {
//   arrayMembers.sort();

//   return new Promise((resolve, reject) => {
//     ajax({
//       url: "/chat/create",
//       metodo: "post",
//       headers: [{ header: "Authorization", value: `Bearer ${token}` }],
//       body: {
//         name,
//         members: arrayMembers,
//       },
//       sucesso: resolve,
//       erro: reject,
//     });
//   });
// }

async function get_contacts_list(token) {
  return new Promise((resolve, reject) => {
    ajax({
      url: "/contacts/list",
      metodo: "get",
      headers: [{ header: "Authorization", value: `Bearer ${token}` }],
      sucesso: resolve,
      erro: reject,
    });
  });

  // ajax({
  //   url: "/contacts/list",
  //   metodo: "get",
  //   headers: [{ header: "Authorization", value: `Bearer ${token}` }],
  //   sucesso(resposta) {
  //     if (resposta.code === 200) {
  //       const resposta_data = JSON.parse(resposta.data);

  //       contacts_list = [];
  //       contacts_list = [...resposta_data.contacts];

  //       load_contacts_list();

  //       load_chats_list();
  //       put_status_contacts(online_user_list);
  //     } else {
  //       alert("Please select a contact");
  //     }
  //   },
  //   erro(erro) {
  //     const msg = JSON.parse(erro.data).msg;
  //     alert(msg);
  //   },
  // });
}

function load_contacts_list() {
  // Limpa a lista.
  side_contacts.innerHTML = "";

  contacts_list.forEach((e) => {
    const contacts_li = document.createElement("li");
    const div_infos = document.createElement("div");
    const contact_image = document.createElement("div");
    const img = document.createElement("img");
    const contact_info = document.createElement("div");
    const name_user = document.createElement("div");
    const status = document.createElement("div");

    name_user.className = "name-user";
    name_user.textContent = e.name;
    contact_info.className = "contact-info";
    img.setAttribute("src", "../image/user-3296.svg");
    contact_image.className = "contact-image";
    contacts_li.setAttribute("id", "contact" + e._id);
    contacts_li.onclick = open_chat_by_contact;
    contacts_li.setAttribute("user_name", e.name);
    contacts_li.setAttribute("user_number", e.number);
    status.className = "status-contact";
    status.setAttribute("number", e.number);

    contact_info.appendChild(name_user);
    contact_image.appendChild(img);
    contact_image.appendChild(status);
    div_infos.appendChild(contact_image);
    div_infos.appendChild(contact_info);
    contacts_li.appendChild(div_infos);
    contacts_li.classList.add("li-contacts");

    side_contacts.appendChild(contacts_li);
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

  console.log(cached_messages);
}

function get_chat_by_id(chat_id) {
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

  return id.split("home/")[1];
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

function search_for_chat() {
  container_search_chat.innerHTML = "";
  const string = input_search_chat.value.toLowerCase();

  // Filtra os chats de acordo com os caracteres digitados no input
  const chats_filtered = chats_list.filter((element) => {
    return element.name.toLowerCase().includes(string);
  });

  // Trata os chats encontrados para mostrar na tela
  const displayChats = (contacts) => {
    const elementosHTML = contacts.map((e) => {
      let name = null;
      const other_members = remove_my_number(e.members);

      const size_other_members = other_members.length;

      // Se não for um grupo, o nome que aparecerá será o nome do outro usuário
      if (!e.name) {
        if (size_other_members === 1) {
          name = get_name_user_by_number(other_members[0]);
          e.name = name;
        }

        if (size_other_members > 1) {
          other_members.forEach((e, i) => {
            name = name === null ? "" : name;
            name = name + get_name_user_by_number(e) + ", ";
          });
          e.name = name;
        }
      } else {
        name = e.name;
      }

      const chat_li = document.createElement("li");
      const div_infos = document.createElement("div");
      const contact_image = document.createElement("div");
      const img = document.createElement("img");
      const contact_info = document.createElement("div");
      const name_user = document.createElement("div");
      const last_message = document.createElement("div");
      const time = document.createElement("div");
      const status = document.createElement("div");
      const container_time_notification = document.createElement("div");
      const circle_notification = document.createElement("div");

      container_time_notification.className = "container_time_notification";
      circle_notification.className = "circle_notification";
      circle_notification.setAttribute("id", "ntf_" + e._id);
      time.className = "time-stamp";
      time.setAttribute("id", "time_" + e._id);
      name_user.className = "name-user";
      name_user.textContent = name;
      contact_info.className = "contact-info";
      img.setAttribute("src", "../image/user-3296.svg");
      contact_image.className = "contact-image";
      status.className = "status-contact";
      status.setAttribute("number", other_members[0]);
      chat_li.setAttribute("id", e._id);
      chat_li.onclick = open_chat;
      chat_li.setAttribute("user_name", name);
      last_message.className = "last-message";

      contact_info.appendChild(name_user);
      contact_info.appendChild(last_message);
      contact_image.appendChild(img);
      contact_image.appendChild(status);
      div_infos.appendChild(contact_image);
      div_infos.appendChild(contact_info);
      container_time_notification.appendChild(time);
      container_time_notification.appendChild(circle_notification);
      chat_li.appendChild(div_infos);
      chat_li.appendChild(container_time_notification);
      chat_li.classList.add("li-chat");

      if (e.lmessage != 0) {
        time.textContent = formatted_time(e.lmessage.time);

        last_message.textContent = `${e.lmessage.sender_name}: ${e.lmessage.text}`;
      }

      return chat_li;
    });

    elementosHTML.forEach((element) =>
      container_search_chat.appendChild(element)
    );
  };

  displayChats(chats_filtered);
}

function search_for_contacts() {
  side_contacts.innerHTML = "";
  const string = input_search_contacts.value.toLowerCase();

  // Filtra os contatos de acordo com os caracteres digitados no input
  const contacts_filtered = contacts_list.filter((element) => {
    return element.name.toLowerCase().includes(string);
  });

  // Trata os chats encontrados para mostrar na tela
  const displayChats = (contacts) => {
    const elementosHTML = contacts.map((e) => {
      const contacts_li = document.createElement("li");
      const div_infos = document.createElement("div");
      const contact_image = document.createElement("div");
      const img = document.createElement("img");
      const contact_info = document.createElement("div");
      const name_user = document.createElement("div");

      name_user.className = "name-user";
      name_user.textContent = e.name;
      contact_info.className = "contact-info";
      img.setAttribute("src", "../image/user-3296.svg");
      contact_image.className = "contact-image";
      contacts_li.setAttribute("id", "newgroup__" + e._id);
      contacts_li.onclick = open_chat_by_contact;
      contacts_li.setAttribute("user_name", e.name);
      contacts_li.setAttribute("user_number", e.number);

      contact_info.appendChild(name_user);
      contact_image.appendChild(img);
      div_infos.appendChild(contact_image);
      div_infos.appendChild(contact_info);
      contacts_li.appendChild(div_infos);
      contacts_li.classList.add("li-contacts");

      side_contacts.appendChild(contacts_li);

      return contacts_li;
    });

    elementosHTML.forEach((element) => side_contacts.appendChild(element));
  };

  displayChats(contacts_filtered);
}

function notification_bubble(id) {
  const bubble = document.getElementById(`ntf_${id}`);
  const time = document.getElementById(`time_${id}`);

  time.style.color = "#5765f2";
  bubble.style.display = "block";

  if (bubble.textContent) {
    const text = bubble.textContent;
    let number = parseInt(text);
    number++;
    bubble.textContent = `${number}`;

    return;
  }

  bubble.textContent = "1";
}

let hiddenPage = false;
function notification_navigador(data) {
  if ("Notification" in window) {
    Notification.requestPermission().then(function (result) {
      if (result === "granted") {
        let title = null;
        let message = null;

        if (data.sender_name) {
          title = data.sender_name;
        } else {
          title = data.sender_number;
        }

        if (data.text) {
          message = data.text;
        }

        let notification = new Notification(title, {
          body: message,
        });
      }
    });
  }
}

function remove_bubble(id) {
  const bubble = document.getElementById(`ntf_${id}`);
  const time = document.getElementById(`time_${id}`);

  time.style.color = "#818181";

  bubble.style.display = "none";
  bubble.innerHTML = "";
}

function disconnect() {
  localStorage.removeItem("token");
  token = null;
  window.location.href = "/";
}

function inner_contacts_new_group() {
  // Limpa a lista.
  ul_new_group.innerHTML = "";

  contacts_list.forEach((e) => {
    const contacts_li = document.createElement("li");
    const div_infos = document.createElement("div");
    const contact_image = document.createElement("div");
    const img = document.createElement("img");
    const contact_info = document.createElement("div");
    const name_user = document.createElement("div");

    name_user.className = "name-user";
    name_user.textContent = e.name;
    contact_info.className = "contact-info";
    img.setAttribute("src", "../image/user-3296.svg");
    contact_image.className = "contact-image";
    contacts_li.setAttribute("id", "newgroup__" + e._id);
    contacts_li.onclick = add_contact_new_group;
    contacts_li.setAttribute("user_name", e.name);
    contacts_li.setAttribute("user_number", e.number);

    contact_info.appendChild(name_user);
    contact_image.appendChild(img);
    div_infos.appendChild(contact_image);
    div_infos.appendChild(contact_info);
    contacts_li.appendChild(div_infos);
    contacts_li.classList.add("li-contacts");

    ul_new_group.appendChild(contacts_li);
  });
}

function search_contact_new_group() {
  ul_new_group.innerHTML = "";
  const string = input_search_newG.value.toLowerCase();

  contact_list_copy = [...contacts_list];
  // Filtra os chats de acordo com os caracteres digitados no input
  const contacts_filtered = contact_list_copy.filter((element) => {
    return element.name.toLowerCase().includes(string);
  });

  // Trata os chats encontrados para mostrar na tela
  const displayChats = (contacts) => {
    const elementosHTML = contacts.map((e) => {
      const contacts_li = document.createElement("li");
      const div_infos = document.createElement("div");
      const contact_image = document.createElement("div");
      const img = document.createElement("img");
      const contact_info = document.createElement("div");
      const name_user = document.createElement("div");

      name_user.className = "name-user";
      name_user.textContent = e.name;
      contact_info.className = "contact-info";
      img.setAttribute("src", "../image/user-3296.svg");
      contact_image.className = "contact-image";
      contacts_li.setAttribute("id", "newgroup__" + e._id);
      contacts_li.onclick = add_contact_new_group;
      contacts_li.setAttribute("user_name", e.name);
      contacts_li.setAttribute("user_number", e.number);

      contact_info.appendChild(name_user);
      contact_image.appendChild(img);
      div_infos.appendChild(contact_image);
      div_infos.appendChild(contact_info);
      contacts_li.appendChild(div_infos);
      contacts_li.classList.add("li-contacts");

      side_contacts.appendChild(contacts_li);

      return contacts_li;
    });

    elementosHTML.forEach((element) => ul_new_group.appendChild(element));
  };

  displayChats(contacts_filtered);
}

function add_contact_new_group() {
  const id = this.id;

  const div_contact = document.getElementById(id);

  // Informações de contato
  const name = div_contact.getAttribute("user_name");
  const number = div_contact.getAttribute("user_number");

  // Formar a div
  const li = document.createElement("li");
  const img = document.createElement("img");
  const div = document.createElement("div");
  const span = document.createElement("span");

  li.setAttribute("user_name", name);
  li.setAttribute("user_number", number);
  li.setAttribute("id", id);
  img.setAttribute("src", "../image/user-3296.svg");
  div.className = "name_choosed_contact";
  span.className = "material-icons";
  span.textContent = "close";
  span.onclick = remove_contact_new_group;
  div.textContent = name;

  li.appendChild(img);
  li.appendChild(div);
  li.appendChild(span);

  new_group_selected.appendChild(li);

  div_contact.remove();

  input_search_newG.value = "";

  remove_contact_from_contacts_li_copy(number);

  if (new_group_selected.children.length > 0) {
    container_button_users_selected.style.display = "flex";
  } else {
    container_button_users_selected.style.display = "none";
  }
}

function remove_contact_new_group() {
  const div = this.parentNode;

  const name = div.getAttribute("user_name");
  const number = div.getAttribute("user_number");
  const id = div.getAttribute("id");

  const contacts_li = document.createElement("li");
  const div_infos = document.createElement("div");
  const contact_image = document.createElement("div");
  const img = document.createElement("img");
  const contact_info = document.createElement("div");
  const name_user = document.createElement("div");

  name_user.className = "name-user";
  name_user.textContent = name;
  contact_info.className = "contact-info";
  img.setAttribute("src", "../image/user-3296.svg");
  contact_image.className = "contact-image";
  contacts_li.setAttribute("id", id);
  contacts_li.onclick = add_contact_new_group;
  contacts_li.setAttribute("user_name", name);
  contacts_li.setAttribute("user_number", number);

  contact_info.appendChild(name_user);
  contact_image.appendChild(img);
  div_infos.appendChild(contact_image);
  div_infos.appendChild(contact_info);
  contacts_li.appendChild(div_infos);
  contacts_li.classList.add("li-contacts");

  side_contacts.appendChild(contacts_li);

  ul_new_group.appendChild(contacts_li);

  div.remove();

  if (new_group_selected.children.length > 0) {
    container_button_users_selected.style.display = "flex";
  } else {
    container_button_users_selected.style.display = "none";
  }

  add_contact_from_contacts_li(name, number, id);
}

function remove_contact_from_contacts_li_copy(number) {
  contact_list_copy.forEach((contact, i) => {
    if (contact.number === number) {
      contact_list_copy.splice(i, 1);
    }
  });
}

function add_contact_from_contacts_li(name, number, id) {
  contact_list_copy.push({
    name: name,
    number: number,
    _id: id,
  });
}

// ?=================================================================
// Inicialização do programa
autentication(token);

get_contacts_list(token).then((resposta) => {
  if (resposta.code === 200) {
    const resposta_data = JSON.parse(resposta.data);

    contacts_list = [];
    contacts_list = [...resposta_data.contacts];

    load_contacts_list();
    put_status_contacts(online_user_list);
  } else {
    alert(resposta);
    console.log(resposta);
  }

  get_chat_list(token).then((resposta) => {
    // Se não possuit chat
    if (resposta.code === 204) return;

    const resposta_data = JSON.parse(resposta.data);
    chats_list = [...resposta_data.chatsList];

    load_chats_list();

    put_status_contacts(online_user_list);
  });
});
