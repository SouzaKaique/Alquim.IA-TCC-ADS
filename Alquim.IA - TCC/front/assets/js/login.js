// Define a URL Base para as chamadas de API (boa prática)
const BASE_URL = 'http://127.0.0.1:5000'; 
// Rota de login, deve ser a rota que processa o formulário no Flask
const LOGIN_ENDPOINT = `${BASE_URL}/login`;

/* --------------------------------------
 * Funções Utilitárias de UI e Segurança
 * -------------------------------------- */

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"'`=\/]/g, function (s) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    })[s];
  });
}

// função utilitária para shake com GSAP
function shakeElement(el) {
  if (window.gsap) {
    gsap.fromTo(el, { x: -8 }, { x: 8, duration: 0.06, repeat: 6, yoyo: true, clearProps: 'x' });
  } else {
    // fallback simples (requer CSS .shake)
    el.classList.add('shake');
    setTimeout(() => el.classList.remove('shake'), 450);
  }
}

// função utilitária para pulse/feedback com GSAP
function pulseElement(el) {
  if (window.gsap) {
    gsap.fromTo(el, { scale: 1 }, { scale: 1.04, duration: 0.12, yoyo: true, repeat: 1, ease: 'power1.inOut', clearProps: 'scale' });
  }
}

/* --------------------------------------
 * Inicialização do Notyf (Notificações)
 * -------------------------------------- */

let notyf;
// instancia Notyf (config personalizada com ícones)
if (window.Notyf) {
    notyf = new Notyf({
        duration: 2300,
        ripple: true,
        position: { x: 'right', y: 'top' },
        types: [
            { type: 'success', background: '#374956', icon: { className: 'notyf__icon--success', tagName: 'i' } },
            { type: 'error',   background: '#8a2f2f', icon: { className: 'notyf__icon--error', tagName: 'i' } }
        ]
    });
}


/* --------------------------------------
 * Lógica Principal do Login
 * -------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    // Busca o formulário pelo ID "formLogin"
    const loginForm = document.getElementById("formLogin");

    if (loginForm) {
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            // 1. Coleta os dados
            const usuario = document.getElementById("usuario").value;
            const senha = document.getElementById("senha").value;

            try {
                // 2. Envia a requisição
                const resposta = await fetch(LOGIN_ENDPOINT, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ usuario, senha }),
                    // CRÍTICO: Garante que o cookie de sessão seja enviado e recebido
                    credentials: 'include' 
                });

                const resultado = await resposta.json();

                if (resposta.ok) {
                    // SUCESSO
                    pulseElement(loginForm);
                    
                    if (notyf) {
                        notyf.success("Login realizado com sucesso! Bem-vindo(a) " + escapeHtml(resultado.usuario) + "!");
                    }

                    // --- CORREÇÃO CRÍTICA DO REDIRECIONAMENTO ---
                    // IGNORA o valor do Flask e força o redirecionamento para a rota limpa /lab
                    console.log("Login bem-sucedido. Redirecionando para /lab."); 
                    
                    // Redireciona após o tempo da notificação (1300ms)
                    setTimeout(() => {
                        window.location.href = '/lab'; // FORÇA A ROTA CORRETA
                    }, 1300);
                    // ---------------------------------------------
                    
                } else {
                    // FALHA NA AUTENTICAÇÃO (401)
                    shakeElement(loginForm);
                    if (notyf) {
                        notyf.error(resultado.erro || "Usuário ou senha incorretos!");
                    }
                }
            } catch (erro) {
                // ERRO DE REDE/SERVIDOR
                shakeElement(loginForm);
                if (notyf) {
                    notyf.error("Erro de conexão com o servidor!");
                }
                console.error("Erro no fetch de login:", erro);
            }
        });
    } else {
        console.error('Login: Elemento "formLogin" não encontrado. Verifique seu HTML.');
    }
});
