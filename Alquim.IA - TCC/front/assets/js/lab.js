const API_BASE_URL = 'http://127.0.0.1:5000';
// Rota de login no Flask (que é a rota inicial "/")
const LOGIN_ROUTE = '/'; 
// Rota da página de registro
const REGISTRO_ROUTE = '/registro'; 

// --- Interatividade do menu lateral ---

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

// --- Verificação de sessão ao carregar a página (CORRIGIDO) ---

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const resposta = await fetch(`${API_BASE_URL}/perfil`, {
            method: "GET",
            credentials: 'include'
        });

        if (!resposta.ok) {
            // Usa a rota base do Flask (que redireciona para o login)
            console.warn("Sessão expirada ou não autenticada. Redirecionando.");
            window.location.href = LOGIN_ROUTE;
        }

    } catch (erro) {
        console.error("Erro ao verificar sessão:", erro);
        // Em caso de erro de rede, redireciona para a rota base
        window.location.href = LOGIN_ROUTE;
    }
});

// --- FUNÇÃO DE LOGOUT (CORRIGIDO) ---

async function handleLogout(e) {
    if (e && e.preventDefault) e.preventDefault();
    
    try {
        // 1. Chama o endpoint de logout
        await fetch(`${API_BASE_URL}/logout`, {
            method: "POST",
            credentials: 'include'
        });
        // 2. Dispara a animação e o redirecionamento
        logoutAnimation({ redirect: LOGIN_ROUTE });
    } catch (erro) {
        console.error("Erro ao fazer logout, mas redirecionando:", erro);
        // Em caso de erro, ainda tenta redirecionar para o login
        logoutAnimation({ redirect: LOGIN_ROUTE }); 
    }
}

// 1. Conecta o botão de Sair no MENU LATERAL
const btnLogoutMenu = document.getElementById("btnLogoutMenuAcao");
if (btnLogoutMenu) {
    btnLogoutMenu.addEventListener("click", handleLogout);
}


function logoutAnimation({ redirect = LOGIN_ROUTE, disableSelector = '[data-logout]' } = {}) {
  // desativa botões/links de logout durante a mensagem
  document.querySelectorAll(disableSelector).forEach(el => el.disabled = true);

  // prepara Notyf se disponível
  if (window.Notyf && !window.notyf) {
     window.notyf = new Notyf({ duration: 3000, position: { x: 'right', y: 'top' } });
  }

  // mostra a notificação simples; fallback para console se Notyf não existir
  if (window.notyf) {
     window.notyf.success('Saindo do sistema... \nAté mais!');
  } else {
     console.log('Saindo do sistema... \nAté mais!');
  }

  // redireciona após curto intervalo para permitir ver a mensagem
  setTimeout(() => {
     window.location.href = redirect;
  }, 1200);
}

// delegação: dispara em qualquer elemento com data-logout
document.addEventListener('click', function (e) {
  const btn = e.target.closest('[data-logout]');
  if (!btn) return;
  e.preventDefault();
  // CORRIGIDO: Sempre redireciona para a rota base se o redirect não for definido
  const redirect = btn.getAttribute('href') || btn.dataset.redirect || LOGIN_ROUTE; 
  logoutAnimation({ redirect });
});

// A função handleLogout foi movida para o topo e está correta agora.

notyf = new Notyf({
  duration: 2300,
  ripple: true,
  position: { x: 'right', y: 'top' },
  types: [
    { type: 'success', background: '#374956', icon: { className: 'notyf__icon--success', tagName: 'i' } },
    { type: 'error',   background: '#8a2f2f', icon: { className: 'notyf__icon--error', tagName: 'i' } }
  ]
});
