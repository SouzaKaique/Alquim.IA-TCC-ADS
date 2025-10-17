from flask import Flask, request, jsonify, session # Importei 'session'
from flask_cors import CORS 
from flask_bcrypt import Bcrypt
import json
import os
# --- IMPORTAÇÃO DO UTILS ---
from utils import carregar_dados_reagentes, salvar_dados_reagentes, gerar_novo_id 
# ---------------------------

app = Flask(__name__)

# --- CONFIGURAÇÕES DE SEGURANÇA E SESSÃO ---
app.config['SECRET_KEY'] = 'uma_chave_secreta_muito_forte_para_o_tcc' 
CORS(app, supports_credentials=True) 
bcrypt = Bcrypt(app)
# --- FIM DAS CONFIGURAÇÕES ---

USERS_FILE = os.path.join(os.path.dirname(__file__), "users.json")

def carregar_usuarios():
    # ... (Sua função carregar_usuarios, sem mudanças)
    if not os.path.exists(USERS_FILE):
        return []
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return [] 

def salvar_usuarios(usuarios):
    # ... (Sua função salvar_usuarios, sem mudanças)
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(usuarios, f, indent=4, ensure_ascii=False)

# ROTA DE REGISTRO
@app.route("/registrar", methods=["POST"])
def registrar():
    # ... (Sua função registrar, sem mudanças)
    try:
        dados = request.get_json(force=True)
        usuario = dados.get("usuario")
        senha = dados.get("senha")

        if not usuario or not senha:
            return jsonify({"erro": "Usuário e senha são obrigatórios!"}), 400

        usuarios = carregar_usuarios()

        if any(u["usuario"] == usuario for u in usuarios):
            return jsonify({"erro": "Usuário já existe!"}), 400
        
        senha_hash = bcrypt.generate_password_hash(senha).decode('utf-8')

        usuarios.append({"usuario": usuario, "senha": senha_hash})
        salvar_usuarios(usuarios)

        return jsonify({"mensagem": "Usuário registrado com sucesso!"}), 201

    except Exception as e:
        print(f"Erro ao registrar: {e}")
        return jsonify({"erro": "Ocorreu um erro interno ao registrar o usuário."}), 500

# ROTA DE LOGIN
@app.route("/login", methods=["POST"])
def login():
    # ... (Sua função login, sem mudanças)
    try:
        dados = request.get_json(force=True)
        usuario = dados.get("usuario")
        senha = dados.get("senha")

        if not usuario or not senha:
            return jsonify({"erro": "Usuário e senha são obrigatórios!"}), 400

        usuarios = carregar_usuarios()
        usuario_encontrado = next((u for u in usuarios if u["usuario"] == usuario), None)
        
        if usuario_encontrado:
            if bcrypt.check_password_hash(usuario_encontrado["senha"], senha):
                
                session['logged_in'] = True
                session['usuario'] = usuario_encontrado['usuario'] 
                
                return jsonify({"mensagem": "Login bem-sucedido!", "usuario": usuario_encontrado['usuario']}), 200
            
            return jsonify({"erro": "Usuário ou senha incorretos!"}), 401

        return jsonify({"erro": "Usuário ou senha incorretos!"}), 401

    except Exception as e:
        print(f"Erro no login: {e}")
        return jsonify({"erro": "Ocorreu um erro interno no servidor."}), 500

# ROTA DE LOGOUT
@app.route("/logout", methods=["POST"])
def logout():
    # ... (Sua função logout, sem mudanças)
    try:
        session.pop('logged_in', None)
        session.pop('usuario', None)
        return jsonify({"mensagem": "Logout bem-sucedido!"}), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

# ROTA /PERFIL (USADA PARA VERIFICAÇÃO DE LOGIN PELO FRONTEND)
@app.route("/perfil", methods=["GET"])
def perfil():
    # ... (Sua função perfil, sem mudanças)
    if 'logged_in' not in session or not session['logged_in']:
        return jsonify({"erro": "Acesso negado. Faça o login."}), 401

    return jsonify({
        "mensagem": f"Bem-vindo à área protegida, {session['usuario']}!",
        "status": "logado",
        "usuario": session['usuario']
    }), 200

# ----------------------------------------------------------------------
# --- NOVAS ROTAS PARA A FUNÇÃO CENTRAL (REAGENTES) ---
# ----------------------------------------------------------------------

# ROTA 1: LISTAR REAGENTES (READ)
@app.route("/reagentes", methods=["GET"])
def listar_reagentes():
    # 1. PROTEÇÃO: Verifica se o usuário está logado
    if 'logged_in' not in session or not session['logged_in']:
        return jsonify({"erro": "Acesso negado. Faça o login."}), 401
    
    usuario_logado = session['usuario']
    
    try:
        dados_globais = carregar_dados_reagentes()
        
        # 2. Obtém a lista de reagentes do usuário logado
        # Se o usuário não tiver uma chave no JSON, retorna uma lista vazia
        reagentes_do_usuario = dados_globais.get(usuario_logado, [])
        
        return jsonify(reagentes_do_usuario), 200
        
    except Exception as e:
        print(f"Erro ao listar reagentes: {e}")
        return jsonify({"erro": "Ocorreu um erro ao buscar os reagentes."}), 500

# ROTA 2: ADICIONAR NOVO REAGENTE (CREATE)
@app.route("/reagentes", methods=["POST"])
def adicionar_reagente():
    # 1. PROTEÇÃO: Verifica se o usuário está logado
    if 'logged_in' not in session or not session['logged_in']:
        return jsonify({"erro": "Acesso negado. Faça o login."}), 401
    
    usuario_logado = session['usuario']
    
    try:
        dados = request.get_json(force=True)
        
        # Validação básica dos campos
        nome = dados.get("nome")
        formula = dados.get("formula")
        
        if not nome or not formula:
            return jsonify({"erro": "Nome e fórmula do reagente são obrigatórios."}), 400

        dados_globais = carregar_dados_reagentes()
        
        # Garante que a chave do usuário exista
        if usuario_logado not in dados_globais:
            dados_globais[usuario_logado] = []
            
        # Gera um ID único e cria o novo reagente
        novo_reagente = {
            "id": gerar_novo_id(dados_globais[usuario_logado]),
            "nome": nome,
            "formula": formula,
            # Adicione outros campos que você precisar (ex: quantidade, validade)
        }
        
        dados_globais[usuario_logado].append(novo_reagente)
        salvar_dados_reagentes(dados_globais)
        
        return jsonify({"mensagem": "Reagente adicionado com sucesso!", "reagente": novo_reagente}), 201
        
    except Exception as e:
        print(f"Erro ao adicionar reagente: {e}")
        return jsonify({"erro": "Ocorreu um erro interno ao adicionar o reagente."}), 500

# ROTA 3: EXCLUIR REAGENTE (DELETE)
# Recebe o ID do reagente na URL (ex: /reagentes/5)
@app.route("/reagentes/<int:reagente_id>", methods=["DELETE"])
def excluir_reagente(reagente_id):
    # 1. PROTEÇÃO: Verifica se o usuário está logado
    if 'logged_in' not in session or not session['logged_in']:
        return jsonify({"erro": "Acesso negado. Faça o login."}), 401
    
    usuario_logado = session['usuario']
    
    try:
        dados_globais = carregar_dados_reagentes()
        
        # 2. Verifica se o usuário tem dados e a lista
        if usuario_logado not in dados_globais:
            return jsonify({"erro": "Nenhum reagente encontrado para este usuário."}), 404
            
        lista_reagentes = dados_globais[usuario_logado]
        
        # 3. Encontra o índice do reagente pelo ID
        reagente_indice = next((i for i, r in enumerate(lista_reagentes) if r["id"] == reagente_id), -1)
        
        if reagente_indice != -1:
            # 4. Exclui o reagente da lista
            reagente_excluido = lista_reagentes.pop(reagente_indice)
            
            # 5. Salva a alteração
            salvar_dados_reagentes(dados_globais)
            
            return jsonify({"mensagem": f"Reagente '{reagente_excluido['nome']}' excluído com sucesso!"}), 200
        else:
            # Reagente não encontrado para este usuário
            return jsonify({"erro": f"Reagente com ID {reagente_id} não encontrado."}), 404
            
    except Exception as e:
        print(f"Erro ao excluir reagente: {e}")
        return jsonify({"erro": "Ocorreu um erro interno ao excluir o reagente."}), 500

@app.route("/")
def home():
    return jsonify({"mensagem": "API do Alquim.IA está rodando!"})

if __name__ == "__main__":
    # Importante: rodar o Flask com o arquivo principal em debug
    app.run(debug=True)