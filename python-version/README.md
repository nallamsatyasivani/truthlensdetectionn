# TruthLens — Flask Edition

A Python/Flask rebuild of the TruthLens Detection app. Provides user auth,
image upload, AI-vs-Real image analysis, history, and a dashboard.

> ⚠️ This folder does **not** run inside the Lovable preview (Lovable hosts
> React apps only). Download it and run it locally.

## Features

- User registration & login (Flask-Login + SQLite, hashed passwords)
- Upload an image (jpg/png/webp) and get an AI-vs-Real probability
- "Demo Analysis" mode when no trained ML model is connected (honest output —
  no fake confidence)
- Optional real model: drop a scikit-learn `.joblib` classifier at
  `ml_model/model.joblib` and it will be used automatically
- Per-user analysis history + dashboard stats
- Responsive HTML/CSS, vanilla JS interactions, dark theme

## Folder structure

```
TruthLens/
├── app.py                  # Flask app factory + entry point
├── database.db             # Created on first run
├── requirements.txt
├── schema.sql              # SQL schema (also auto-applied on startup)
├── static/
│   ├── css/styles.css
│   ├── js/main.js
│   └── images/             # uploaded files land here
├── templates/
│   ├── base.html
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── history.html
│   └── result.html
├── models/
│   └── db.py               # SQLite helpers + User model
├── routes/
│   ├── auth.py
│   └── main.py
├── utils/
│   └── image_utils.py
└── ml_model/
    ├── predictor.py        # loads model.joblib if present, else demo mode
    └── feature_extract.py  # image -> feature vector
```

## Install & run

```bash
cd python-version
python -m venv .venv
source .venv/bin/activate           # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Then open http://127.0.0.1:5000

## Plugging in a real model

Train any scikit-learn classifier whose `predict_proba` returns
`[p_real, p_ai]` over the 16-dim feature vector produced by
`ml_model/feature_extract.py`, then save it:

```python
import joblib
joblib.dump(clf, "ml_model/model.joblib")
```

Restart the app — it will switch from **Demo Analysis** to real predictions
automatically. The decision threshold is `0.65` (tunable in
`ml_model/predictor.py`) to reduce false positives.

## Notes

- Default `SECRET_KEY` is dev-only — set `TRUTHLENS_SECRET_KEY` in production.
- No fake/hardcoded percentages anywhere; demo mode is clearly labeled.
