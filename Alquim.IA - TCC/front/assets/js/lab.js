// Interatividade do menu lateral

const menu = document.getElementById("menuLateral");
const userIcon = document.querySelector(".lab-user-icon");

userIcon.addEventListener("click", () => {
  menu.classList.toggle("ativo");
});

document.addEventListener("click", (e) => {
  if (!menu.contains(e.target) && !userIcon.contains(e.target)) {
    menu.classList.remove("ativo");
  }
});

// Verificação de sessão ao carregar a página

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const resposta = await fetch("http://127.0.0.1:5000/perfil", {
            method: "GET",
            credentials: 'include'
        });

        if (!resposta.ok) {
            alert("Sessão expirada ou não autenticada. Faça o login novamente.");
            window.location.href = "login.html";
        }

    } catch (erro) {
        console.error("Erro ao verificar sessão:", erro);
        alert("Erro de conexão. Redirecionando para login.");
        window.location.href = "login.html";
    }
});

// --- FUNÇÃO DE LOGOUT ---

async function handleLogout() {
    try {
        await fetch(`${API_BASE_URL}/logout`, {
            method: "POST",
            credentials: 'include'
        });
        window.location.href = "login.html"; 
    } catch (erro) {
        console.error("Erro ao fazer logout:", erro);
        window.location.href = "login.html"; 
    }
}

// 1. Conecta o botão de Sair no FOOTER
const btnLogoutFooter = document.getElementById("btnLogout");
if (btnLogoutFooter) {
    btnLogoutFooter.addEventListener("click", handleLogout);
}

// 2. Conecta o item de Sair no MENU LATERAL
const btnLogoutMenu = document.getElementById("btnLogoutMenuAcao");
if (btnLogoutMenu) {
    btnLogoutMenu.addEventListener("click", handleLogout);
}