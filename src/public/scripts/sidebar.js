const sidebar_btn = document.getElementById("side_menu_btn");
const sidebar = document.getElementById("sidebar");
const aside_buttons = document.getElementById("aside_buttons");

sidebar_btn.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

const buttons_sidebar = aside_buttons.querySelectorAll("button");
buttons_sidebar.forEach((element) => {
  element.addEventListener("click", () => {
    buttons_sidebar.forEach((e) => {
      e.classList.remove("active");
    });
    element.classList.add("active");
  });
});
