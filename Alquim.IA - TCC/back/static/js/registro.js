document.getElementById("formRegistro").addEventListener("submit", async function (e) {
  e.preventDefault();

  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;
  const confirmar = document.getElementById("confirmar").value;

  if (senha !== confirmar) {
    alert("As senhas não coincidem!");
    return;
  }

  try {
    const resposta = await fetch("http://127.0.0.1:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, senha }),
      credentials: 'include'
    });

    const resultado = await resposta.json();

    if (resposta.ok) {
      showToast("Login realizado com sucesso! Bem-vindo(a) " + resultado.usuario + "!", "success");
      // redireciona depois do toast fechar (ex: 900ms)
      setTimeout(() => window.location.href = "lab.html", 900);
    } else {
      showToast(resultado.erro || "Usuário ou senha incorretos!", "error");
    }
  } catch (erro) {
    showToast("Erro de conexão com o servidor!", "error");
    console.error(erro);
  }
});

/* Funções de UI simples para toasts */

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

// instancia Notyf (config básica)
let notyf;
if (window.Notyf) {
  notyf = new Notyf({
    duration: 2300,
    ripple: true,
    position: { x: 'right', y: 'top' }
  });
}

// função utilitária para shake com GSAP
function shakeElement(el) {
  if (window.gsap) {
    gsap.fromTo(el, { x: -8 }, { x: 8, duration: 0.06, repeat: 6, yoyo: true, clearProps: 'x' });
  } else {
    // fallback simples
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

// submit único, limpo
const formEl = document.getElementById("formLogin");
if (formEl) {
  formEl.addEventListener("submit", async function (e) {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    try {
      const resposta = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, senha }),
        credentials: 'include'
      });

      const resultado = await resposta.json();

      if (resposta.ok) {
        pulseElement(formEl);
        if (notyf) notyf.success("Usuário registrado com sucesso! Bem-vindo(a) " + escapeHtml(resultado.usuario) + "!");
        // opção: usar SweetAlert2/Lottie aqui se preferir (não obrigatório)
        setTimeout(() => window.location.href = "lab.html", 1300);
      } else {
        shakeElement(formEl);
        if (notyf) notyf.error(resultado.erro || "Usuário ou senha incorretos!");
      }
    } catch (erro) {
      shakeElement(formEl);
      if (notyf) notyf.error("Erro de conexão com o servidor!");
      console.error(erro);
    }
  });
}

// instancia Notyf (config personalizada com ícones)
notyf = new Notyf({
  duration: 2300,
  ripple: true,
  position: { x: 'right', y: 'top' },
  types: [
    { type: 'success', background: '#374956', icon: { className: 'notyf__icon--success', tagName: 'i' } },
    { type: 'error',   background: '#8a2f2f', icon: { className: 'notyf__icon--error', tagName: 'i' } }
  ]
});