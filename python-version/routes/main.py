"""Main app routes: home, upload/analyze, result, history, dashboard."""
from __future__ import annotations

import os
import uuid
from pathlib import Path

from flask import (
    Blueprint, abort, current_app, flash, redirect, render_template,
    request, url_for,
)
from flask_login import current_user, login_required
from werkzeug.utils import secure_filename

from models.db import (
    get_analysis, list_user_analyses, save_analysis, user_stats,
)
from ml_model.predictor import predict_image, model_status
from utils.image_utils import is_allowed_image

main_bp = Blueprint("main", __name__)


@main_bp.route("/")
def index():
    return render_template("index.html", model_status=model_status())


@main_bp.route("/dashboard")
@login_required
def dashboard():
    stats = user_stats(current_user.id)
    recent = list_user_analyses(current_user.id, limit=5)
    return render_template(
        "dashboard.html", stats=stats, recent=recent, model_status=model_status(),
    )


@main_bp.route("/history")
@login_required
def history():
    rows = list_user_analyses(current_user.id, limit=200)
    return render_template("history.html", rows=rows)


@main_bp.route("/analyze", methods=["POST"])
@login_required
def analyze():
    file = request.files.get("image")
    if not file or not file.filename:
        flash("Please choose an image.", "error")
        return redirect(url_for("main.dashboard"))
    if not is_allowed_image(file.filename):
        flash("Unsupported file type. Use JPG, PNG, or WEBP.", "error")
        return redirect(url_for("main.dashboard"))

    safe_name = secure_filename(file.filename)
    unique = f"{uuid.uuid4().hex}_{safe_name}"
    dest = Path(current_app.config["UPLOAD_FOLDER"]) / unique
    file.save(dest)

    result = predict_image(str(dest))

    # Debug logs (req. #8)
    current_app.logger.info(
        "TruthLens prediction | raw=%s ai=%.4f real=%.4f class=%s demo=%s",
        result["raw"], result["ai_probability"], result["real_probability"],
        result["classification"], result["is_demo"],
    )

    analysis_id = save_analysis(
        user_id=current_user.id,
        filename=unique,
        original_name=safe_name,
        ai_prob=result["ai_probability"],
        real_prob=result["real_probability"],
        classification=result["classification"],
        is_demo=result["is_demo"],
    )
    return redirect(url_for("main.result", analysis_id=analysis_id))


@main_bp.route("/result/<int:analysis_id>")
@login_required
def result(analysis_id: int):
    row = get_analysis(analysis_id, current_user.id)
    if not row:
        abort(404)
    image_url = url_for("static", filename=f"images/uploads/{row['filename']}")
    return render_template("result.html", row=row, image_url=image_url)
