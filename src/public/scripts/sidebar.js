const sidebar_btn = document.getElementById("side_menu_btn");
const sidebar = document.getElementById("sidebar");

sidebar_btn.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});
