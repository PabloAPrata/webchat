export function ajax(config) {
  const xhr = new XMLHttpRequest();
  xhr.open(config.metodo, config.url, true);

  if (config.metodo == "post" || config.metodo == "put") {
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(config.body));
  }
  xhr.onload = (e) => {
    if (xhr.status >= 200 && xhr.status < 300) {
      config.sucesso({
        code: xhr.status,
        text: xhr.statusText,
        data: xhr.response,
      });
    } else if (xhr.status >= 400) {
      config.erro({
        code: xhr.status,
        text: xhr.statusText,
        data: xhr.response,
      });
    }
  };

  if (config.metodo == "get" || config.metodo == "delete") xhr.send();
}