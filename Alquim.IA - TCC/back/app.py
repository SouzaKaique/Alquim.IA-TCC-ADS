import os
from flask import Flask
from flask_cors import CORS
from flask_bcrypt import Bcrypt

# --- Caminhos ---
APP_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(APP_DIR)

TEMPLATE_FOLDER = os.path.join(APP_DIR, "templates")
app = Flask(
    __name__,
    template_folder=TEMPLATE_FOLDER,
    static_folder="static"
)

app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = False 
app.config["SESSION_COOKIE_HTTPONLY"] = True

app.config["SECRET_KEY"] = "TCCADS2025AlquimIA"
CORS(app, supports_credentials=True)

bcrypt = Bcrypt(app)

# --- Importações após criar o app ---
from api.routes import api_bp
from frontend.routes import frontend_bp

app.register_blueprint(api_bp, url_prefix="/api")
app.register_blueprint(frontend_bp)

# --- Execução ---
if __name__ == "__main__":
    print(f"Templates em: {TEMPLATE_FOLDER}")
    print(f"Assets em: {os.path.join(APP_DIR, 'static')}")
    app.run(debug=True)
