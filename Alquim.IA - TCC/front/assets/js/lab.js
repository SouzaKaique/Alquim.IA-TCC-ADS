// Controle do menu lateral
const menu = document.getElementById("menuLateral");
const userIcon = document.querySelector(".lab-user-icon");

userIcon.addEventListener("click", () => {
  menu.classList.toggle("ativo");
});

// Fechar o menu clicando fora
document.addEventListener("click", (e) => {
  if (!menu.contains(e.target) && !userIcon.contains(e.target)) {
    menu.classList.remove("ativo");
  }
});
