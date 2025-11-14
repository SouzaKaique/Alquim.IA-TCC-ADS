from flask import Blueprint, render_template, session, redirect, url_for

frontend_bp = Blueprint("frontend", __name__)

# -------------------------
# ROTAS DO FRONTEND
# -------------------------

@frontend_bp.route("/login")
def login():
    if session.get("logged_in"):
        return redirect(url_for("frontend.lab_page"))
    return render_template("login.html")


@frontend_bp.route("/registro")
def registro_page():
    return render_template("registro.html")


@frontend_bp.route("/lab")
def lab_page():
    if not session.get("logged_in"):
        return redirect(url_for("frontend.login"))
    return render_template("lab.html")


@frontend_bp.route("/reagentes")
def reagentes_page():
    return render_template("reagentes.html")


@frontend_bp.route("/perfil")
def perfil_page():
    if not session.get("logged_in"):
        return "Acesso negado", 403
    return "Perfil em desenvolvimento", 200


@frontend_bp.route("/")
def index():
    return redirect(url_for("frontend.login"))
