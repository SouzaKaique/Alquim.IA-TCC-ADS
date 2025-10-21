// Ajuste: usar a rota do Flask que retorna o JSON
const DATA_URL = "/api/reagentes";

const listaContainer = document.getElementById("reagentes-lista");
const detalheContainer = document.getElementById("reagente-detalhe");
const buscaInput = document.getElementById("busca-reagente") || document.getElementById("busca");
const categoriaButtons = document.querySelectorAll(".categoria, .filtro");

let reagentesGlobais = [];
let categoriaSelecionada = "all";

// mostrar mensagem enquanto carrega
if (listaContainer) listaContainer.innerHTML = "<p class='text-center py-4'>Carregando reagentes…</p>";

fetch(DATA_URL)
  .then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    return response.json();
  })
  .then(data => {
    // Se a API devolver um objeto por usuário (quando você usa auth), 
    // tente extrair a lista principal (caso seja um objeto)
    if (Array.isArray(data)) {
      reagentesGlobais = data;
    } else if (typeof data === "object" && data !== null) {
      // se a rota devolver { "usuario": [...]} ou algo semelhante, tentar achar a lista
      // primeiro procurar por chave 'reagentes' ou pela primeira chave que seja array
      if (Array.isArray(data.reagentes)) reagentesGlobais = data.reagentes;
      else {
        // pega a primeira propriedade que seja array
        const firstArray = Object.values(data).find(v => Array.isArray(v));
        reagentesGlobais = firstArray || [];
      }
    } else {
      reagentesGlobais = [];
    }

    renderLista(reagentesGlobais);
    // se já existir um buscaInput, ligar o evento
    if (buscaInput) buscaInput.addEventListener("input", () => filtrarERenderizar());
    // categorias
    categoriaButtons.forEach(btn => {
      btn.addEventListener("click", (e) => {
        categoriaButtons.forEach(b => b.classList.remove("ativo"));
        btn.classList.add("ativo");
        categoriaSelecionada = btn.dataset.categoria || btn.getAttribute("data-categoria") || "all";
        filtrarERenderizar();
      });
    });
  })
  .catch(err => {
    console.error("Erro ao carregar reagentes:", err);
    if (listaContainer) listaContainer.innerHTML = `<p class='text-danger p-3'>Erro ao carregar reagentes: ${err.message}</p>`;
    if (detalheContainer) detalheContainer.innerHTML = `<p class='text-muted p-3'>Não foi possível carregar detalhes.</p>`;
  });

function renderLista(reagentes) {
  if (!listaContainer) return;
  listaContainer.innerHTML = "";

  if (!reagentes || reagentes.length === 0) {
    listaContainer.innerHTML = "<p class='text-center py-4'>Nenhum reagente encontrado</p>";
    return;
  }

  reagentes.forEach(r => {
    const item = document.createElement("div");
    item.className = "reagente-item list-group-item d-flex align-items-center";
    item.dataset.id = String(r.id || r.nome || Math.random());
    // categoria para filtro visual
    item.dataset.categoria = (r.categoria || r.category || "Cátions").toString().toLowerCase();

    item.innerHTML = `
      <span class="reagente-cor ${r.corClass || r.cor || 'am-blue'} me-3"></span>
      <div class="flex-grow-1">
        <strong>${r.nome || r.title || "Sem nome"}</strong><br>
        <small class="text-muted">${r.formula || ""}</small>
      </div>
      <span class="badge bg-secondary ms-3">${r.categoria || r.category || ""}</span>
    `;
    listaContainer.appendChild(item);
  });
}

// event delegation: escuta cliques no container e identifica item clicado
if (listaContainer) {
  listaContainer.addEventListener("click", event => {
    const item = event.target.closest(".reagente-item");
    if (!item) return;
    const id = item.dataset.id;
    const reagente = reagentesGlobais.find(r => String(r.id) === id || r.nome === id);
    if (reagente) renderDetalhe(reagente);
  });
}

function renderDetalhe(r) {
  if (!detalheContainer) return;
  detalheContainer.innerHTML = `
    <div class="detalhe-box">
      <div class="d-flex align-items-start gap-3 mb-3">
        <div class="reagente-cor ${r.corClass || r.cor || 'am-blue'}" style="width:48px;height:48px;border-radius:8px;border:3px solid #333"></div>
        <div>
          <h2 class="mb-1">${r.nome || "—"}</h2>
          <div class="text-muted mb-2">${r.formula || ""}</div>
          <p class="small">${r.descricao || r.description || ""}</p>
        </div>
      </div>

      <div class="secao mb-3">
        <h5>Propriedades</h5>
        <ul>
          ${(r.propriedades || r.properties || []).map(p => `<li>${p}</li>`).join("")}
        </ul>
      </div>

      <div class="secao mb-3">
        <h5>Reações Características</h5>
        <div>
          ${(r.reacoes || r.reactions || []).map(rx => `<div class="p-2 mb-2 bg-light rounded"><code>${rx}</code></div>`).join("")}
        </div>
      </div>

      ${r.seguranca || r.safety ? `
        <div class="seguranca p-3 rounded">
          <h5 class="mb-2">⚠️ Segurança</h5>
          <p class="mb-0">${r.seguranca || r.safety}</p>
        </div>` : ""
      }
    </div>
  `;
}

function filtrarERenderizar() {
  const texto = buscaInput ? buscaInput.value.trim().toLowerCase() : "";
  const cat = (categoriaSelecionada || "all").toLowerCase();

  const filtrados = reagentesGlobais.filter(r => {
    const nome = (r.nome || r.title || "").toString().toLowerCase();
    const formula = (r.formula || "").toString().toLowerCase();
    const categoria = (r.categoria || r.category || "").toString().toLowerCase();

    const matchesSearch = texto === "" || nome.includes(texto) || formula.includes(texto);
    const matchesCategory = cat === "all" || cat === "todos" || categoria.includes(cat);

    return matchesSearch && matchesCategory;
  });

  renderLista(filtrados);
  // opcional: limpar painel de detalhe quando nada selecionado
  if (filtrados.length === 0 && detalheContainer) {
    detalheContainer.innerHTML = "<p class='text-center text-muted py-4'>Nenhum reagente corresponde aos filtros.</p>";
  }
}
