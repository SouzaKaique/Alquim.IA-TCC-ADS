from flask import Flask, render_template, request, jsonify, redirect, url_for
import json
import os

app = Flask(
    __name__,
    template_folder="../templates",
    static_folder="../assets"
)

ARQUIVO_USUARIOS = os.path.join(os.path.dirname(__file__), "users.json")

# ---------- Funções auxiliares ----------

def carregar_usuarios():
    """Carrega os usuários do arquivo JSON"""
    if not os.path.exists(ARQUIVO_USUARIOS):
        with open(ARQUIVO_USUARIOS, "w") as f:
            json.dump([], f)
    with open(ARQUIVO_USUARIOS, "r") as f:
        return json.load(f)

def salvar_usuarios(usuarios):
    """Salva os usuários no arquivo JSON"""
    with open(ARQUIVO_USUARIOS, "w") as f:
        json.dump(usuarios, f, indent=4)

# ---------- Rotas de Páginas ----------

@app.route("/")
def pagina_login():
    return render_template("login.html")

@app.route("/registro")
def pagina_registro():
    return render_template("registro.html")

@app.route("/lab")
def pagina_laboratorio():
    return render_template("lab.html")

@app.route("/reagentes")
def pagina_reagentes():
    return render_template("reagentes.html")

# ---------- API de Autenticação ----------

@app.route("/api/registrar", methods=["POST"])
def registrar_usuario():
    dados = request.get_json()
    usuario = dados.get("usuario")
    senha = dados.get("senha")

    if not usuario or not senha:
        return jsonify({"sucesso": False, "mensagem": "Preencha todos os campos."}), 400

    usuarios = carregar_usuarios()
    if any(u["usuario"] == usuario for u in usuarios):
        return jsonify({"sucesso": False, "mensagem": "Usuário já existe."}), 400

    usuarios.append({"usuario": usuario, "senha": senha})
    salvar_usuarios(usuarios)

    return jsonify({"sucesso": True, "mensagem": "Usuário registrado com sucesso!"})

@app.route("/api/login", methods=["POST"])
def fazer_login():
    dados = request.get_json()
    usuario = dados.get("usuario")
    senha = dados.get("senha")

    usuarios = carregar_usuarios()
    for u in usuarios:
        if u["usuario"] == usuario and u["senha"] == senha:
            return jsonify({"sucesso": True, "mensagem": "Login realizado com sucesso!"})

    return jsonify({"sucesso": False, "mensagem": "Usuário ou senha incorretos."}), 401

# ---------- Execução ----------

if __name__ == "__main__":
    app.run(debug=True)
