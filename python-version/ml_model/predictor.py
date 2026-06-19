"""Prediction pipeline.

If a trained scikit-learn model exists at ml_model/model.joblib, use it.
Otherwise return a clearly-labelled "Demo Analysis" — never claim the
image is AI-generated when no real model is connected.
"""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import joblib
import numpy as np

from .feature_extract import extract_features

log = logging.getLogger(__name__)

MODEL_PATH = Path(__file__).resolve().parent / "model.joblib"
# Decision threshold: only flag as AI when AI prob exceeds this. Tuned high
# to reduce false positives (req. #4). Tunable per deployment.
AI_THRESHOLD = 0.65
REAL_THRESHOLD = 0.65

_model: Any | None = None
_model_load_attempted = False


def _load_model() -> Any | None:
    global _model, _model_load_attempted
    if _model_load_attempted:
        return _model
    _model_load_attempted = True
    if MODEL_PATH.exists():
        try:
            _model = joblib.load(MODEL_PATH)
            log.info("TruthLens: loaded model from %s", MODEL_PATH)
        except Exception as exc:  # pragma: no cover
            log.exception("TruthLens: failed to load model: %s", exc)
            _model = None
    else:
        log.info("TruthLens: no model at %s — running in Demo Analysis mode", MODEL_PATH)
    return _model


def model_status() -> dict:
    model = _load_model()
    return {
        "loaded": model is not None,
        "label": "Trained model active" if model else "Demo Analysis (no trained model)",
    }


def _classify(ai_prob: float, real_prob: float) -> str:
    if ai_prob >= AI_THRESHOLD:
        return "ai"
    if real_prob >= REAL_THRESHOLD:
        return "real"
    return "uncertain"


def predict_image(image_path: str) -> dict:
    """Run prediction. Returns dict with raw output, probabilities,
    classification, and is_demo flag."""
    features = extract_features(image_path)
    model = _load_model()

    if model is None:
        # Demo mode: do NOT fabricate AI probability. Report neutral output
        # and mark as demo so the UI can label it clearly.
        result = {
            "raw": None,
            "ai_probability": 0.0,
            "real_probability": 0.0,
            "classification": "uncertain",
            "is_demo": True,
        }
        log.info("[TruthLens][demo] features=%s result=%s",
                 features.tolist(), result)
        return result

    # Real model path
    try:
        proba = model.predict_proba(features.reshape(1, -1))[0]
    except Exception:
        # Fall back to decision_function if predict_proba unavailable
        score = float(model.decision_function(features.reshape(1, -1))[0])
        ai_p = 1.0 / (1.0 + np.exp(-score))
        proba = np.array([1.0 - ai_p, ai_p])

    # Convention: classes_ = [real(0), ai(1)] OR we infer from order
    classes = list(getattr(model, "classes_", [0, 1]))
    if 1 in classes:
        ai_idx = classes.index(1)
    elif "ai" in classes:
        ai_idx = classes.index("ai")
    else:
        ai_idx = 1
    real_idx = 1 - ai_idx

    ai_prob = float(proba[ai_idx])
    real_prob = float(proba[real_idx])
    classification = _classify(ai_prob, real_prob)

    result = {
        "raw": proba.tolist(),
        "ai_probability": ai_prob,
        "real_probability": real_prob,
        "classification": classification,
        "is_demo": False,
    }
    log.info(
        "[TruthLens] raw=%s ai=%.4f real=%.4f class=%s",
        proba.tolist(), ai_prob, real_prob, classification,
    )
    return result
