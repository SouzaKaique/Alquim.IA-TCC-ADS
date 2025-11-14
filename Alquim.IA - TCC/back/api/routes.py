from flask import Blueprint, request, jsonify, session
from flask_bcrypt import Bcrypt
import json, os
from utils import carregar_dados_reagentes, salvar_dados_reagentes, gerar_novo_id

# --- Blueprint ---
api_bp = Blueprint("api", __name__)

# --- Inicializa o bcrypt local ---
bcrypt = Bcrypt()

USERS_FILE = os.path.join(os.path.dirname(__file__), "..", "users.json")

# -------------------- Funções auxiliares --------------------
def carregar_usuarios():
    try:
        with open(USERS_FILE, "r", encoding="utf-8") as f:
            return json.load(f) or []
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def salvar_usuarios(usuarios):
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(usuarios, f, indent=4, ensure_ascii=False)

# -------------------- Autenticação --------------------
@api_bp.route("/registrar_usuario", methods=["POST"])
def registrar_usuario():
    dados = request.get_json(force=True)
    usuario = dados.get("usuario")
    senha = dados.get("senha")

    if not usuario or not senha:
        return jsonify({"erro": "Usuário e senha são obrigatórios!"}), 400

    usuarios = carregar_usuarios()
    if any(u["usuario"] == usuario for u in usuarios):
        return jsonify({"erro": "Usuário já existe!"}), 400

    senha_hash = bcrypt.generate_password_hash(senha).decode("utf-8")
    usuarios.append({"usuario": usuario, "senha": senha_hash})
    salvar_usuarios(usuarios)

    session["logged_in"] = True
    session["usuario"] = usuario
    return jsonify({"mensagem": "Usuário registrado e logado!", "redirect": "/lab"}), 200


@api_bp.route("/login", methods=["POST"])
def login():
    dados = request.get_json(force=True)
    usuario = dados.get("usuario")
    senha = dados.get("senha")

    usuarios = carregar_usuarios()
    user = next((u for u in usuarios if u["usuario"] == usuario), None)

    if user and bcrypt.check_password_hash(user["senha"], senha):
        session["logged_in"] = True
        session["usuario"] = user["usuario"]
        return jsonify({"mensagem": "Login bem-sucedido!", "redirect": "/lab"}), 200

    return jsonify({"erro": "Usuário ou senha incorretos!"}), 401


@api_bp.route("/logout", methods=["POST"])
def logout():
    session.pop("logged_in", None)
    session.pop("usuario", None)
    return jsonify({"mensagem": "Logout realizado!", "redirect": "/login"}), 200


# -------------------- Reagentes --------------------
@api_bp.route("/reagentes", methods=["GET"])
def listar_reagentes():
    if not session.get("logged_in"):
        return jsonify({"erro": "Acesso negado."}), 401

    dados = carregar_dados_reagentes()

    # Se for uma lista direta, retorne direto
    if isinstance(dados, list):
        return jsonify(dados), 200

    # Se for um dict no formato {"reagentes": [...]}
    if "reagentes" in dados and isinstance(dados["reagentes"], list):
        return jsonify(dados["reagentes"]), 200

    # Se for dict por usuário {"usuario": [...]}
    usuario = session["usuario"]
    if usuario in dados:
        return jsonify(dados[usuario]), 200

    return jsonify([]), 200

@api_bp.route("/reagentes", methods=["POST"])
def adicionar_reagente():
    if not session.get("logged_in"):
        return jsonify({"erro": "Acesso negado."}), 401

    dados = request.get_json(force=True)
    nome, formula = dados.get("nome"), dados.get("formula")

    usuario = session["usuario"]
    dados_globais = carregar_dados_reagentes()

    if usuario not in dados_globais:
        dados_globais[usuario] = []

    novo_reagente = {
        "id": gerar_novo_id(dados_globais[usuario]),
        "nome": nome,
        "formula": formula,
    }
    dados_globais[usuario].append(novo_reagente)
    salvar_dados_reagentes(dados_globais)

    return jsonify({"mensagem": "Reagente adicionado!", "reagente": novo_reagente}), 201


@api_bp.route("/reagentes/<int:reagente_id>", methods=["DELETE"])
def excluir_reagente(reagente_id):
    if not session.get("logged_in"):
        return jsonify({"erro": "Acesso negado."}), 401

    usuario = session["usuario"]
    dados_globais = carregar_dados_reagentes()
    lista = dados_globais.get(usuario, [])

    for r in lista:
        if r["id"] == reagente_id:
            lista.remove(r)
            salvar_dados_reagentes(dados_globais)
            return jsonify({"mensagem": f"Reagente '{r['nome']}' removido!"}), 200

    return jsonify({"erro": "Reagente não encontrado."}), 404

@api_bp.route("/perfil", methods=["GET"])
def perfil():
    if not session.get("logged_in"):
        return jsonify({"erro": "Não autenticado"}), 401

    return jsonify({
        "usuario": session.get("usuario"),
        "status": "logado"
    }), 200

@api_bp.route("/teste_sessao")
def teste_sessao():
    return {
        "logged_in": session.get("logged_in"),
        "username": session.get("username")
    }
