// ===========================
// lab.js atualizado com PIXI.js + ANIMAÇÕES
// ===========================

// ---------------------------
// CONFIGURAÇÕES DE API
// ---------------------------
const API_BASE_URL = 'http://127.0.0.1:5000';
const LOGIN_ROUTE = '/';
const REGISTRO_ROUTE = '/registro';

// ---------------------------
// MENU LATERAL
// ---------------------------
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

// ---------------------------
// VERIFICAÇÃO DE SESSÃO
// ---------------------------
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const resposta = await fetch(`${API_BASE_URL}/api/perfil`, {
      method: "GET",
      credentials: 'include'
    });

    if (!resposta.ok) {
      window.location.href = LOGIN_ROUTE;
      return;
    }
  } catch (erro) {
    console.error("Erro ao verificar sessão:", erro);
    window.location.href = LOGIN_ROUTE;
    return;
  }

  iniciarPixiLaboratorio();
});

// ---------------------------
// LOGOUT
// ---------------------------
async function handleLogout(e) {
  if (e && e.preventDefault) e.preventDefault();

  try {
    await fetch(`${API_BASE_URL}/api/logout`, {
      method: "POST",
      credentials: 'include'
    });
    logoutAnimation({ redirect: LOGIN_ROUTE });
  } catch (erro) {
    logoutAnimation({ redirect: LOGIN_ROUTE });
  }
}

const btnLogoutMenu = document.getElementById("btnLogoutMenuAcao");
if (btnLogoutMenu) btnLogoutMenu.addEventListener("click", handleLogout);

function logoutAnimation({ redirect }) {
  if (window.notyf) {
    window.notyf.success('Saindo do sistema...');
  }
  setTimeout(() => window.location.href = redirect, 1000);
}

// ---------------------------
// NOTIFICAÇÕES
// ---------------------------
notyf = new Notyf({
  duration: 2300,
  ripple: true,
  position: { x: 'right', y: 'top' },
  types: [
    { type: 'success', background: '#374956' },
    { type: 'error',   background: '#8a2f2f' }
  ]
});

// =============================================================
//  INICIALIZAÇÃO DO PIXI.JS COM ANIMAÇÕES
// =============================================================
function iniciarPixiLaboratorio() {

  if (typeof PIXI === "undefined") {
    console.error("PIXI não carregado!");
    return;
  }

  // Criar aplicação PIXI
  const app = new PIXI.Application({
    width: 900,
    height: 600,
    transparent: true,
    antialias: true
  });

  const container = document.getElementById("labCanvas");
  if (!container) {
    console.error("ERRO: #labCanvas não encontrado.");
    return;
  }
  container.appendChild(app.view);

  // Paths corretos
  const assets = {
    tubo: '/static/IMG/Tubo.png',
    bicoOn: '/static/IMG/BicoBunsen.png',
    bicoOff: '/static/IMG/bico-off.png'
  };

  Promise.all([
    PIXI.Assets.load(assets.tubo),
    PIXI.Assets.load(assets.bicoOn),
    PIXI.Assets.load(assets.bicoOff)
  ]).then(([tuboImg, bicoOnImg, bicoOffImg]) => {


    // -----------------------------------------------------------
    // TUBO DE ENSAIO + Animação de líquido
    // -----------------------------------------------------------
    const tubo = new PIXI.Sprite(tuboImg);
    tubo.anchor.set(0.5);
    tubo.scale.set(0.55);
    tubo.x = 300;
    tubo.y = 330;

    // líquido animado
    const liquido = new PIXI.Graphics();
    liquido.beginFill(0x5dade2, 0.8);
    liquido.drawRoundedRect(-38, 120, 75, 0, 20); // começa vazio
    liquido.endFill();
    liquido.heightAtual = 0;

    const tuboContainer = new PIXI.Container();
    tuboContainer.addChild(liquido, tubo);
    app.stage.addChild(tuboContainer);

    tubo.interactive = true;
    tubo.cursor = 'pointer';

    let tuboCheio = false;

    tubo.on('pointerdown', () => {
      tuboCheio = !tuboCheio;

      if (tuboCheio) {
        notyf.success("Reagente adicionado!");

        // ANIMAÇÃO: líquido enchendo
        app.ticker.add(function encherLiquido(delta) {
          liquido.heightAtual += 2 * delta;
          liquido.clear();
          liquido.beginFill(liquido.corAtual ?? 0x5dade2, 0.85);
          liquido.drawRoundedRect(-38, 120 - liquido.heightAtual, 75, liquido.heightAtual, 20);
          liquido.endFill();

          if (liquido.heightAtual >= 110) {
            app.ticker.remove(encherLiquido);
          }
        });

      } else {
        notyf.success("Tubo limpo!");

        // ANIMAÇÃO: esvaziar
        app.ticker.add(function esvaziar(delta) {
          liquido.heightAtual -= 3 * delta;
          if (liquido.heightAtual < 0) liquido.heightAtual = 0;

          liquido.clear();
          liquido.beginFill(liquido.corAtual ?? 0x5dade2, 0.85);
          liquido.drawRoundedRect(-38, 120, 75, liquido.heightAtual, 20);
          liquido.endFill();

          if (liquido.heightAtual <= 0) {
            app.ticker.remove(esvaziar);
          }
        });
      }
    });


    // -----------------------------------------------------------
    // BICO DE BUNSEN + Animação de fogo tremulando
    // -----------------------------------------------------------
    const bico = new PIXI.Sprite(bicoOffImg);
    bico.anchor.set(0.5);
    bico.x = 580;
    bico.y = 430;
    bico.scale.set(0.55);

    let fogoAtivo = false;

    // fogo "flicker"
    const fogoAnimation = () => {
      if (!fogoAtivo) return;
      bico.scale.set(0.55 + Math.random() * 0.05);
      bico.y = 430 + (Math.random() * 2 - 1);
    };

    app.ticker.add(fogoAnimation);

    bico.interactive = true;
    bico.cursor = "pointer";

    bico.on("pointerdown", () => {
      fogoAtivo = !fogoAtivo;

      bico.texture = fogoAtivo ? bicoOnImg : bicoOffImg;

      if (!fogoAtivo) bico.scale.set(0.55);

      notyf.success(fogoAtivo ? "Bico ligado!" : "Bico desligado!");
    });

    app.stage.addChild(bico);


    // -----------------------------------------------------------
    // PAINEL DE REAGENTES (integração futura)
    // -----------------------------------------------------------
    window.aplicarReagente = function (corHex) {
      liquido.corAtual = corHex;

      notyf.success("Reagente aplicado!");

      // animação suave mudando a cor
      app.ticker.add(function anim(delta) {
        liquido.alpha += 0.02 * delta;
        if (liquido.alpha >= 0.85) {
          liquido.alpha = 0.85;
          app.ticker.remove(anim);
        }

        liquido.clear();
        liquido.beginFill(liquido.corAtual, liquido.alpha);
        liquido.drawRoundedRect(-38, 120 - liquido.heightAtual, 75, liquido.heightAtual, 20);
        liquido.endFill();
      });
    };

  });
}
