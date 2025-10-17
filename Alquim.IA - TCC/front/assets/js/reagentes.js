/**
 * Lógica da Biblioteca de Reagentes (Refatorada em Português e API Integrada)
 * Gerencia a exibição, busca, filtragem e detalhes dos reagentes, buscando dados do Flask API.
 */

// A URL base da sua API Flask
const URL_BASE_API = window.location.origin.includes("127.0.0.1") ? "http://127.0.0.1:5000" : window.location.origin;

// CATEGORIAS MOCK (Mantidas para renderizar os botões de filtro no frontend)
const CATEGORIAS = [
    { valor: "all", rotulo: "Todos" },
    { valor: "cation", rotulo: "Cátions" },
    { valor: "anion", rotulo: "Ânions" },
    { valor: "indicator", rotulo: "Indicadores" },
    { valor: "solvent", rotulo: "Solventes" },
];

/**
 * Função utilitária para substituir alert() e confirm()
 * Deve ser substituída por um modal UI completo em produção.
 */
function mostrarMensagem(mensagem, tipo = 'info') {
    // Loga a mensagem no console, em vez de usar alert()
    console.log(`[Mensagem ${tipo.toUpperCase()}]: ${mensagem}`);
    // Se for erro de autenticação, o redirecionamento é feito em 'verificarAutenticacao'
}

// O objeto 'app' é definido diretamente em window.app para garantir o escopo global.
window.app = (function() { 
    let termoBusca = "";
    let categoriaSelecionada = "all";
    let idReagenteSelecionado = null;
    // O array agora é preenchido pela API
    let dadosReagentes = []; 

    // Elementos DOM
    const elementoListaReagentes = document.getElementById('reagentList');
    const elementoDetalhesReagente = document.getElementById('reagentDetails');
    const elementoBotoesCategoria = document.getElementById('categoryButtons');

    /**
     * Verifica se o usuário está logado usando a rota /perfil.
     * Se não estiver logado, redireciona para a página de login.
     */
    async function verificarAutenticacao() {
        try {
            const resposta = await fetch(`${URL_BASE_API}/perfil`, {
                method: "GET",
                credentials: 'include' // Essencial para enviar o cookie de sessão
            });

            if (!resposta.ok) {
                // Se o backend retornar 401 (Não Autorizado)
                mostrarMensagem("Sua sessão expirou ou não está autenticada. Redirecionando para login.", 'erro');
                window.location.href = "login.html";
                return false;
            }
            return true;
        } catch (erro) {
            console.error("Erro de conexão ao verificar sessão:", erro);
            // Em caso de erro de rede, assume que não pode prosseguir
            mostrarMensagem("Erro de conexão com o servidor. Redirecionando para login.", 'erro');
            window.location.href = "login.html";
            return false;
        }
    }

    /**
     * Busca os reagentes da API, armazena localmente e re-renderiza.
     */
    async function buscarReagentesAPI() {
        if (!elementoListaReagentes) return;

        // Limpa e mostra estado de carregamento
        elementoListaReagentes.innerHTML = `
            <div class="text-center py-5 text-muted-foreground">
                <i data-lucide="loader" class="w-12 h-12 mx-auto mb-3 opacity-50 animate-spin"></i>
                <p class="small">Carregando reagentes...</p>
            </div>
        `;
        lucide.createIcons();
        
        try {
            const resposta = await fetch(`${URL_BASE_API}/reagentes`, {
                method: "GET",
                credentials: 'include'
            });

            const reagentes = await resposta.json();
            
            if (resposta.ok) {
                // Mapeia os dados do backend (nome, formula, id) para a estrutura de renderização do frontend
                // ATENÇÃO: Os dados do backend são incompletos (faltam color, description, etc.). 
                // Usamos valores padrão ou buscamos na lista CATEGORIAS.
                dadosReagentes = reagentes.map(r => ({
                    id: String(r.id),
                    name: r.nome,
                    formula: r.formula,
                    // Valores mock para a UI de detalhes, pois o backend não os forneceu
                    color: 'bg-reagent-default', 
                    description: 'Descrição não disponível via API V1.',
                    properties: ['Dados incompletos.'],
                    reactions: ['Reações não disponíveis.'],
                    safety: 'Informação de segurança pendente.',
                    category: r.categoria || 'solvent', // Assume 'solvent' se não houver categoria
                }));
                
                renderizarListaReagentes();
            } else {
                elementoListaReagentes.innerHTML = `<div class="text-center text-danger mt-4">Erro ao carregar reagentes: ${reagentes.erro || 'Desconhecido'}</div>`;
            }

        } catch (erro) {
            console.error("Erro ao buscar reagentes:", erro);
            elementoListaReagentes.innerHTML = '<div class="text-center text-danger mt-4">Erro de rede ao buscar reagentes. Verifique o servidor Flask.</div>';
        }
    }

    /**
     * Filtra a lista de reagentes com base na busca e categoria.
     */
    function filtrarReagentes() {
        const termo = termoBusca.toLowerCase();
        
        return dadosReagentes.filter(reagente => {
            // Usa reagente.name para ser consistente com o frontend (embora a API use 'nome')
            const nome = reagente.name ? reagente.name.toLowerCase() : '';
            const formula = reagente.formula ? reagente.formula.toLowerCase() : '';
            const description = reagente.description ? reagente.description.toLowerCase() : '';

            const correspondeBusca = 
                nome.includes(termo) ||
                formula.includes(termo) ||
                description.includes(termo);
                
            const correspondeCategoria = categoriaSelecionada === "all" || reagente.category === categoriaSelecionada;
            
            return correspondeBusca && correspondeCategoria;
        });
    }

    /**
     * Renderiza o item de reagente na lista.
     * @param {Object} reagente - O objeto reagente.
     */
    function renderizarItemReagente(reagente) {
        const estaSelecionado = idReagenteSelecionado === reagente.id;
        // Busca o rótulo com base no valor da categoria
        const rotuloCategoria = CATEGORIAS.find(c => c.valor === reagente.category)?.rotulo || reagente.category;

        return `
            <div 
                id="reagent-${reagente.id}"
                onclick="window.app.definirReagenteSelecionado('${reagente.id}')"
                class="card pixel-border bg-panel text-white reagent-card ${estaSelecionado ? 'selected' : ''}"
                data-reagent-id="${reagente.id}"
            >
                <div class="card-body p-3">
                    <div class="d-flex align-items-center gap-3 mb-2">
                        <div class="reagent-color-circle ${reagente.color}" style="width: 2rem; height: 2rem;"></div>
                        <div class="flex-grow-1">
                            <h3 class="font-weight-bold fs-6 mb-0">${reagente.name}</h3>
                            <p class="small text-muted-foreground mb-0">${reagente.formula}</p>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="badge bg-secondary text-white small">${rotuloCategoria}</span>
                        ${estaSelecionado ? `<button onclick="event.stopPropagation(); window.app.removerReagente(${reagente.id})" class="btn btn-sm btn-danger pixel-button-sm">Excluir</button>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Renderiza a lista completa de reagentes.
     */
    function renderizarListaReagentes() {
        const filtrados = filtrarReagentes();
        
        if (elementoListaReagentes) {
            elementoListaReagentes.innerHTML = ''; 
            
            if (filtrados.length === 0 && dadosReagentes.length > 0) {
                 elementoListaReagentes.innerHTML = `
                    <div class="text-center py-5 text-muted-foreground">
                        <i data-lucide="filter" class="w-12 h-12 mx-auto mb-3 opacity-50"></i>
                        <p class="small">Nenhum resultado encontrado para a busca/filtro.</p>
                    </div>
                `;
            } else if (filtrados.length === 0 && dadosReagentes.length === 0) {
                 elementoListaReagentes.innerHTML = `
                    <div class="text-center py-5 text-muted-foreground">
                        <i data-lucide="beaker" class="w-12 h-12 mx-auto mb-3 opacity-50"></i>
                        <p class="small">Nenhum reagente cadastrado. Adicione o primeiro!</p>
                    </div>
                `;
            } else {
                filtrados.forEach(reagente => {
                    elementoListaReagentes.innerHTML += renderizarItemReagente(reagente);
                });
            }
        }
        lucide.createIcons(); // Re-renderiza ícones
    }

    /**
     * Renderiza os botões de categoria. (Permanece mockado no frontend)
     */
    function renderizarBotoesCategoria() {
        if (!elementoBotoesCategoria) return;
        
        elementoBotoesCategoria.innerHTML = CATEGORIAS.map(cat => {
            const estaSelecionado = categoriaSelecionada === cat.valor;
            const classeVariante = estaSelecionado 
                ? "btn-success bg-accent text-dark" 
                : "btn-outline-secondary text-white"; 
                
            return `
                <button
                    onclick="window.app.definirCategoriaSelecionada('${cat.valor}')"
                    class="btn ${classeVariante} pixel-button small px-3 py-1"
                >
                    ${cat.rotulo}
                </button>
            `;
        }).join('');
    }

    /**
     * Renderiza a seção de detalhes de um reagente.
     * @param {Object} reagente - O objeto reagente a ser exibido.
     */
    function renderizarDetalhesReagente(reagente) {
        if (!elementoDetalhesReagente) return;
        
        // Adaptação: Se os dados vierem incompletos da API, mostra uma mensagem simples
        let htmlPropriedades = '<li>Dados detalhados incompletos.</li>';
        let htmlReacoes = '<div class="bg-dark p-3 rounded small font-monospace">Reações não disponíveis na API.</div>';
        let safetyContent = reagente.safety || 'Informação de segurança não disponível.';
        
        if (reagente.properties && reagente.properties.length > 0) {
             htmlPropriedades = reagente.properties.map((prop, indice) => `
                <li key="${indice}" class="small d-flex align-items-start gap-2">
                    <span class="text-accent">•</span>
                    <span>${prop}</span>
                </li>
            `).join('');
        }
        
        if (reagente.reactions && reagente.reactions.length > 0) {
            htmlReacoes = reagente.reactions.map((reacao, indice) => `
                <div key="${indice}" class="bg-dark p-3 rounded small font-monospace">
                    ${reacao}
                </div>
            `).join('');
        }


        elementoDetalhesReagente.innerHTML = `
            <div class="max-w-3xl mx-auto space-y-4">
                <!-- Header -->
                <div class="pixel-border bg-panel p-4">
                    <div class="d-flex align-items-start gap-4">
                        <div
                            class="reagent-color-circle ${reagente.color}"
                            style="width: 4rem; height: 4rem; border-width: 4px;"
                        >
                            <i data-lucide="beaker" class="w-8 h-8"></i>
                        </div>
                        <div class="flex-grow-1">
                            <h2 class="fs-4 font-weight-bold mb-1">${reagente.name}</h2>
                            <p class="fs-5 text-muted-foreground mb-3">${reagente.formula}</p>
                            <p class="small lh-sm">${reagente.description}</p>
                        </div>
                    </div>
                </div>

                <!-- Propriedades -->
                <div class="pixel-border bg-panel p-4">
                    <h3 class="font-weight-bold fs-5 mb-3 d-flex align-items-center gap-2">
                        <i data-lucide="info" class="w-5 h-5"></i>
                        Propriedades
                    </h3>
                    <ul class="list-unstyled space-y-2">
                        ${htmlPropriedades}
                    </ul>
                </div>

                <!-- Reações -->
                <div class="pixel-border bg-panel p-4">
                    <h3 class="font-weight-bold fs-5 mb-3 d-flex align-items-center gap-2">
                        <i data-lucide="beaker" class="w-5 h-5"></i>
                        Reações Características
                    </h3>
                    <div class="space-y-3 d-grid gap-3">
                        ${htmlReacoes}
                    </div>
                </div>

                <!-- Segurança -->
                <div class="safety-box p-4">
                    <h3 class="font-weight-bold fs-5 mb-3 d-flex align-items-center gap-2 text-danger">
                        <i data-lucide="alert-triangle" class="w-5 h-5"></i>
                        Segurança
                    </h3>
                    <p class="small lh-sm text-light">${safetyContent}</p>
                </div>
            </div>
        `;
        lucide.createIcons();
    }
    
    /**
     * Renderiza o estado inicial/vazio da seção de detalhes.
     */
    function renderizarDetalhesVazios() {
         if (!elementoDetalhesReagente) return;
         
         elementoDetalhesReagente.innerHTML = `
            <div class="h-100 d-flex align-items-center justify-content-center text-muted-foreground">
                <div class="text-center">
                    <i data-lucide="beaker" class="w-16 h-16 mx-auto mb-4 opacity-50"></i>
                    <p class="fs-5">Selecione um reagente para ver os detalhes</p>
                </div>
            </div>
         `;
         lucide.createIcons();
    }

    /**
     * Remove um reagente via API.
     * @param {number} reagenteId - ID do reagente a ser excluído.
     */
    async function removerReagente(reagenteId) {
        // ATENÇÃO: Substituímos o confirm() por um log. 
        // O ideal seria um modal UI para pedir confirmação ao usuário.
        mostrarMensagem(`Tentativa de exclusão do reagente ID ${reagenteId}...`, 'alerta');

        try {
            const resposta = await fetch(`${URL_BASE_API}/reagentes/${reagenteId}`, {
                method: "DELETE",
                credentials: 'include'
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                mostrarMensagem(resultado.mensagem || `Reagente ID ${reagenteId} excluído com sucesso!`, 'sucesso');
                idReagenteSelecionado = null; // Limpa o detalhe
                renderizarDetalhesVazios();
                await buscarReagentesAPI(); // Recarrega a lista
            } else {
                mostrarMensagem(resultado.erro || "Erro ao excluir reagente.", 'erro');
            }

        } catch (erro) {
            console.error("Erro ao excluir reagente:", erro);
            mostrarMensagem("Erro de conexão ao excluir reagente.", 'erro');
        }
    }

    // --- Funções de Estado (State Management) ---

    /**
     * Atualiza o termo de busca e re-renderiza.
     * @param {string} novoTermo - Novo termo de busca.
     */
    function definirTermoBusca(novoTermo) {
        termoBusca = novoTermo;
        renderizarListaReagentes();
    }

    /**
     * Atualiza a categoria selecionada e re-renderiza.
     * @param {string} novaCategoria - Nova categoria.
     */
    function definirCategoriaSelecionada(novaCategoria) {
        categoriaSelecionada = novaCategoria;
        renderizarBotoesCategoria();
        renderizarListaReagentes();
    }

    /**
     * Seleciona um reagente para exibir os detalhes.
     * @param {string} idReagente - ID do reagente.
     */
    function definirReagenteSelecionado(idReagente) {
        idReagenteSelecionado = idReagente;
        
        // 1. Encontra o reagente
        const reagente = dadosReagentes.find(r => String(r.id) === idReagente);

        // 2. Renderiza os detalhes
        if (reagente) {
            renderizarDetalhesReagente(reagente);
        } else {
            renderizarDetalhesVazios();
        }
        
        // 3. Re-renderiza a lista para destacar o item selecionado e mostrar o botão 'Excluir'
        renderizarListaReagentes(); 
    }

    /**
     * Função de inicialização
     */
    async function iniciar() {
        if (!await verificarAutenticacao()) return; // Verifica auth e interrompe se falhar

        // Carrega dados da API e renderiza a interface
        await buscarReagentesAPI();
        renderizarBotoesCategoria();
        renderizarDetalhesVazios();
    }

    return {
        iniciar,
        definirTermoBusca,
        definirCategoriaSelecionada,
        definirReagenteSelecionado,
        removerReagente // Novo método público para exclusão
    };
})();
