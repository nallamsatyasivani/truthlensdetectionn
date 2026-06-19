"""SQLite helpers + User model for Flask-Login."""
from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Optional

from flask import current_app, g
from flask_login import UserMixin
from werkzeug.security import check_password_hash, generate_password_hash


# ---------- connection ----------

def get_db() -> sqlite3.Connection:
    if "db" not in g:
        g.db = sqlite3.connect(current_app.config["DATABASE"])
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


def close_db(_exc=None) -> None:
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db(db_path: str, schema_path: Path) -> None:
    conn = sqlite3.connect(db_path)
    with open(schema_path, "r", encoding="utf-8") as fh:
        conn.executescript(fh.read())
    conn.commit()
    conn.close()


# ---------- user ----------

class User(UserMixin):
    def __init__(self, row: sqlite3.Row):
        self.id = row["id"]
        self.email = row["email"]
        self.username = row["username"]
        self.password_hash = row["password_hash"]

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)


def get_user_by_id(user_id: int) -> Optional[User]:
    row = get_db().execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    return User(row) if row else None


def get_user_by_email(email: str) -> Optional[User]:
    row = get_db().execute("SELECT * FROM users WHERE email = ?", (email.lower(),)).fetchone()
    return User(row) if row else None


def create_user(email: str, username: str, password: str) -> User:
    pw_hash = generate_password_hash(password)
    db = get_db()
    cur = db.execute(
        "INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)",
        (email.lower(), username, pw_hash),
    )
    db.commit()
    row = db.execute("SELECT * FROM users WHERE id = ?", (cur.lastrowid,)).fetchone()
    return User(row)


# ---------- analyses ----------

def save_analysis(
    user_id: int,
    filename: str,
    original_name: str,
    ai_prob: float,
    real_prob: float,
    classification: str,
    is_demo: bool,
) -> int:
    db = get_db()
    cur = db.execute(
        """INSERT INTO analyses
           (user_id, filename, original_name, ai_probability, real_probability,
            classification, is_demo)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (user_id, filename, original_name, ai_prob, real_prob, classification, int(is_demo)),
    )
    db.commit()
    return cur.lastrowid


def get_analysis(analysis_id: int, user_id: int):
    return get_db().execute(
        "SELECT * FROM analyses WHERE id = ? AND user_id = ?",
        (analysis_id, user_id),
    ).fetchone()


def list_user_analyses(user_id: int, limit: int = 100):
    return get_db().execute(
        "SELECT * FROM analyses WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
        (user_id, limit),
    ).fetchall()


def user_stats(user_id: int) -> dict:
    db = get_db()
    total = db.execute("SELECT COUNT(*) AS c FROM analyses WHERE user_id = ?", (user_id,)).fetchone()["c"]
    ai = db.execute(
        "SELECT COUNT(*) AS c FROM analyses WHERE user_id = ? AND classification = 'ai'",
        (user_id,),
    ).fetchone()["c"]
    real = db.execute(
        "SELECT COUNT(*) AS c FROM analyses WHERE user_id = ? AND classification = 'real'",
        (user_id,),
    ).fetchone()["c"]
    uncertain = total - ai - real
    return {"total": total, "ai": ai, "real": real, "uncertain": uncertain}
