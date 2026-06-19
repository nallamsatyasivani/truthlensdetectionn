"""TruthLens Flask app entry point."""
from __future__ import annotations

import os
from pathlib import Path

from flask import Flask
from flask_login import LoginManager

from models.db import init_db, get_user_by_id
from routes.auth import auth_bp
from routes.main import main_bp

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "static" / "images" / "uploads"


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.update(
        SECRET_KEY=os.environ.get("TRUTHLENS_SECRET_KEY", "dev-secret-change-me"),
        DATABASE=str(BASE_DIR / "database.db"),
        UPLOAD_FOLDER=str(UPLOAD_DIR),
        MAX_CONTENT_LENGTH=10 * 1024 * 1024,  # 10 MB
    )
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    # DB
    with app.app_context():
        init_db(app.config["DATABASE"], BASE_DIR / "schema.sql")

    # Auth
    login_manager = LoginManager()
    login_manager.login_view = "auth.login"
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id: str):
        return get_user_by_id(int(user_id))

    # Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(main_bp)

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
