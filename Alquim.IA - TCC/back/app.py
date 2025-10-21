import os
from flask import Flask, request, jsonify, session, render_template, redirect, url_for
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import json
import os
import sys # Importado para debug
# --- IMPORTAÇÃO DO UTILS ---
# Presume que 'utils.py' está no mesmo diretório ('back')
try:
    from utils import carregar_dados_reagentes, salvar_dados_reagentes, gerar_novo_id
except ImportError:
    print("----------------------------------------------------------------------")
    print("AVISO CRÍTICO: Não foi possível importar 'utils.py'. Verifique se o arquivo existe em 'back/'.")
    print("----------------------------------------------------------------------")
    # Define funções mock para evitar crash se 'utils.py' estiver faltando/com erro
    def carregar_dados_reagentes(): return {}
    def salvar_dados_reagentes(data): pass
    def gerar_novo_id(lista): return 1
# ---------------------------

# Define o diretório do arquivo atual 'app.py' (Exemplo: C:\...\Alquim.IA - TCC\back)
APP_DIR = os.path.dirname(os.path.abspath(__file__))

# Define o caminho para a raiz do projeto (Exemplo: C:\...\Alquim.IA - TCC)
PROJECT_ROOT = os.path.dirname(APP_DIR)


# CORREÇÃO: Templates estão em 'back/templates'
TEMPLATE_FOLDER = os.path.join(APP_DIR, 'templates')

# Assets estão em: [Raiz]/front/assets
STATIC_FOLDER = os.path.join(PROJECT_ROOT, 'front', 'assets')

# Define a URL base para arquivos estáticos como /static, o padrão do Flask.
# O arquivo CSS deve ser referenciado no HTML como: {{ url_for('static', filename='css/reagentes.css') }}
STATIC_URL_PATH = '/static'

# --- VERIFICAÇÃO DE EXISTÊNCIA DE PASTAS (Para debug) ---
if not os.path.isdir(TEMPLATE_FOLDER):
    print("----------------------------------------------------------------------")
    print(f"ERRO CRÍTICO: Pasta de templates NÃO ENCONTRADA em: {TEMPLATE_FOLDER}")
    print("----------------------------------------------------------------------")

if not os.path.isdir(STATIC_FOLDER):
    print("----------------------------------------------------------------------")
    print(f"AVISO CRÍTICO: Pasta estática (Assets) NÃO ENCONTRADA em: {STATIC_FOLDER}")
    print("----------------------------------------------------------------------")
# ----------------------------------------------------


try:
    app = Flask(
        __name__,
        template_folder=TEMPLATE_FOLDER,
        static_folder=STATIC_FOLDER,
        static_url_path=STATIC_URL_PATH
    )
except Exception as e:
    print("----------------------------------------------------------------------")
    print(f"FALHA CRÍTICA NA INICIALIZAÇÃO DO FLASK: {e}")
    print("----------------------------------------------------------------------")
    sys.exit(1) # Força a saída se a inicialização do Flask falhar


# --- CONFIGURAÇÕES DE SEGURANÇA E SESSÃO ---
app.config['SECRET_KEY'] = 'uma_chave_secreta_muito_forte_para_o_tcc'
CORS(app, supports_credentials=True) 
bcrypt = Bcrypt(app)
# --- FIM DAS CONFIGURAÇÕES ---

USERS_FILE = os.path.join(APP_DIR, "users.json")

def carregar_usuarios():
    # Carrega usuários do users.json
    if not os.path.exists(USERS_FILE):
        return []
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def salvar_usuarios(usuarios):
    # Salva usuários no users.json
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(usuarios, f, indent=4, ensure_ascii=False)

# ----------------------------------------------------------------------
# --- ROTAS DE AUTENTICAÇÃO ---
# ----------------------------------------------------------------------

# Rota para o registro de usuário
@app.route("/registrar_usuario", methods=["POST"])
def registrar_usuario():
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
        
        # NOVO: Loga o usuário imediatamente após o registro
        session['logged_in'] = True
        session['usuario'] = usuario

        # NOVO: Retorna a URL de redirecionamento para o laboratório
        return jsonify({
            "mensagem": "Usuário registrado e logado com sucesso! Redirecionando...", 
            "usuario": usuario, 
            "redirect_url": url_for('lab')
        }), 200

    except Exception as e:
        print(f"Erro ao registrar: {e}")
        return jsonify({"erro": "Ocorreu um erro interno ao registrar o usuário."}), 500

@app.route("/login", methods=["POST"])
def login_post(): # Renomeada para evitar conflito com a rota '/login' de GET
    try:
        dados = request.get_json(force=True)
        usuario = dados.get("usuario")
        senha = dados.get("senha")

        if not usuario or not senha:
            return jsonify({"erro": "Usuário e senha são obrigatórios!"}), 400

        usuarios = carregar_usuarios()
        usuario_encontrado = next((u for u in usuarios if u["usuario"] == usuario), None)
        
        if usuario_encontrado and bcrypt.check_password_hash(usuario_encontrado["senha"], senha):
            session['logged_in'] = True
            session['usuario'] = usuario_encontrado['usuario']
            
            # Retorna a URL de redirecionamento para o nome da função 'lab'
            return jsonify({"mensagem": "Login bem-sucedido!", "usuario": usuario_encontrado['usuario'], "redirect_url": url_for('lab')}), 200

        return jsonify({"erro": "Usuário ou senha incorretos!"}), 401

    except Exception as e:
        print(f"Erro no login: {e}")
        return jsonify({"erro": "Ocorreu um erro interno no servidor."}), 500

@app.route("/logout", methods=["POST"])
def logout():
    try:
        session.pop('logged_in', None)
        session.pop('usuario', None)
        # Redireciona para login
        return jsonify({"mensagem": "Logout bem-sucedido!", "redirect_url": url_for('login')}), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@app.route("/perfil", methods=["GET"])
def perfil():
    if 'logged_in' not in session or not session['logged_in']:
        # Se não estiver logado, redireciona para a página de login
        return redirect(url_for('login'))

    return jsonify({
        "mensagem": f"Bem-vindo à área protegida, {session['usuario']}!",
        "status": "logado",
        "usuario": session['usuario']
    }), 200

# ----------------------------------------------------------------------
# --- ROTAS DE API PARA DADOS (Com prefixo /api/) ---
# ----------------------------------------------------------------------

@app.route("/api/reagentes_all") 
def reagentes_all():
    # Retorna todos os dados para debug ou inicialização, se necessário
    try:
        dados_globais = carregar_dados_reagentes()
        return jsonify(dados_globais), 200
    except Exception as e:
        print(f"Erro ao ler reagentes_all: {e}")
        return jsonify({"erro": "Erro ao carregar dados."}), 500


@app.route("/api/reagentes", methods=["GET"])
def listar_reagentes_api(): # Renomeada para deixar claro que é API
    if 'logged_in' not in session or not session['logged_in']:
        return jsonify({"erro": "Acesso negado. Faça o login."}), 401

    usuario_logado = session['usuario']
    
    try:
        dados_globais = carregar_dados_reagentes()
        reagentes_do_usuario = dados_globais.get(usuario_logado, [])
        return jsonify(reagentes_do_usuario), 200
    except Exception as e:
        print(f"Erro ao listar reagentes: {e}")
        return jsonify({"erro": "Ocorreu um erro ao buscar os reagentes."}), 500

@app.route("/api/reagentes", methods=["POST"])
def adicionar_reagente_api(): # Renomeada para deixar claro que é API
    if 'logged_in' not in session or not session['logged_in']:
        return jsonify({"erro": "Acesso negado. Faça o login."}), 401

    usuario_logado = session['usuario']

    try:
        dados = request.get_json(force=True)
        nome = dados.get("nome")
        formula = dados.get("formula")
        
        if not nome or not formula:
            return jsonify({"erro": "Nome e fórmula do reagente são obrigatórios."}), 400

        dados_globais = carregar_dados_reagentes()
        
        if usuario_logado not in dados_globais:
            dados_globais[usuario_logado] = []
            
        novo_reagente = {
            "id": gerar_novo_id(dados_globais[usuario_logado]),
            "nome": nome,
            "formula": formula,
        }
        
        dados_globais[usuario_logado].append(novo_reagente)
        salvar_dados_reagentes(dados_globais)
        
        return jsonify({"mensagem": "Reagente adicionado com sucesso!", "reagente": novo_reagente}), 201
        
    except Exception as e:
        print(f"Erro ao adicionar reagente: {e}")
        return jsonify({"erro": "Ocorreu um erro interno ao adicionar o reagente."}), 500

@app.route("/api/reagentes/<int:reagente_id>", methods=["DELETE"])
def excluir_reagente_api(reagente_id): # Renomeada para deixar claro que é API
    if 'logged_in' not in session or not session['logged_in']:
        return jsonify({"erro": "Acesso negado. Faça o login."}), 401

    usuario_logado = session['usuario']

    try:
        dados_globais = carregar_dados_reagentes()
        if usuario_logado not in dados_globais:
            return jsonify({"erro": "Nenhum reagente encontrado para este usuário."}), 404

        lista_reagentes = dados_globais[usuario_logado]
        reagente_indice = next((i for i, r in enumerate(lista_reagentes) if r["id"] == reagente_id), -1)
        
        if reagente_indice != -1:
            reagente_excluido = lista_reagentes.pop(reagente_indice)
            salvar_dados_reagentes(dados_globais)
            return jsonify({"mensagem": f"Reagente '{reagente_excluido['nome']}' excluído com sucesso!"}), 200
        else:
            return jsonify({"erro": f"Reagente com ID {reagente_id} não encontrado."}), 404

    except Exception as e:
        print(f"Erro ao excluir reagente: {e}")
        return jsonify({"erro": "Ocorreu um erro interno ao excluir o reagente."}), 500

# ----------------------------------------------------------------------
# --- ROTAS PARA FRONTEND (Visualização de Páginas) ---
# ----------------------------------------------------------------------

@app.route("/")
@app.route("/login")
def login():
    # Rota de entrada: Redireciona para o login.html
    # Se o usuário já estiver logado, redireciona para o lab
    if 'logged_in' in session and session['logged_in']:
        return redirect(url_for('lab'))
        
    return render_template("login.html")

@app.route("/registro")
def registro():
    # Rota para a página de registro
    return render_template("registro.html")

@app.route("/lab")
def lab():
    # Rota para a página principal do laboratório. Deve ser referenciada no HTML como url_for('lab').
    if 'logged_in' not in session or not session['logged_in']:
        # Redireciona para login
        return redirect(url_for('login'))
        
    return render_template("lab.html") # Ou o nome correto do seu template principal

@app.route("/reagentes")
def reagentes():
    # Rota para a página de reagentes (funciona perfeitamente)
    # Esta rota agora não conflita com nenhuma API de dados /reagentes
    if 'logged_in' not in session or not session['logged_in']:
        # Redireciona para login
        return redirect(url_for('login'))
        
    return render_template("reagentes.html")
# ----------------------------------------------------------------------

if __name__ == "__main__":
    print(f"Flask APP inicializado. Templates em: {TEMPLATE_FOLDER}")
    print(f"Assets/Static em: {STATIC_FOLDER}")
    
    if 'app' in locals():
        app.run(debug=True)
