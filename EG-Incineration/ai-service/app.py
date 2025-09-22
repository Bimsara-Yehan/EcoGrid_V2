import os
import json
from typing import Dict, Optional

import joblib
import pandas as pd
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator


APP_VERSION = "0.1.0"


class WasteInputs(BaseModel):
    paper_pct: float = Field(..., ge=0.0, le=100.0)
    plastic_pct: float = Field(..., ge=0.0, le=100.0)
    organic_pct: float = Field(..., ge=0.0, le=100.0)
    moisture_pct: float = Field(..., ge=0.0, le=100.0)

    # Optional known operational settings (if you want fixed values)
    airflow: Optional[float] = None
    grate_speed: Optional[float] = None
    feed_rate: Optional[float] = None
    o2_target: Optional[float] = None
    burner_temp: Optional[float] = None

    @validator("paper_pct", "plastic_pct", "organic_pct", "moisture_pct")
    def validate_percentage(cls, v):
        if v is None:
            raise ValueError("percentage is required")
        return float(v)


class Constraints(BaseModel):
    airflow_min: float = 0.0
    airflow_max: float = 1000.0
    grate_speed_min: float = 0.1
    grate_speed_max: float = 5.0
    feed_rate_min: float = 0.1
    feed_rate_max: float = 20.0
    o2_target_min: float = 2.0
    o2_target_max: float = 12.0
    burner_temp_min: float = 600.0
    burner_temp_max: float = 1100.0
    emissions_cap: float = 999999.0


class RecommendRequest(BaseModel):
    waste: WasteInputs
    constraints: Constraints = Constraints()
    lambda_penalty: float = 0.5
    n_samples: int = 400


app = FastAPI(title="Incineration AI Service", version=APP_VERSION)


# CORS (restrict origins in production)
allowed_origins = os.getenv("AI_ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


AI_API_KEY = os.getenv("AI_API_KEY", "changeme")
MODELS_DIR = os.getenv("AI_MODELS_DIR", os.path.join(os.path.dirname(__file__), "models"))
ENERGY_MODEL_PATH = os.path.join(MODELS_DIR, os.getenv("AI_ENERGY_MODEL", "energy_v1_advanced.joblib"))
EMISS_MODEL_PATH = os.path.join(MODELS_DIR, os.getenv("AI_EMISS_MODEL", "emissions_v1_advanced.joblib"))


def _safe_load_model(path: str, fallback_path: str = None):
    try:
        if os.path.exists(path):
            return joblib.load(path)
        elif fallback_path and os.path.exists(fallback_path):
            print(f"Using fallback model: {fallback_path}")
            return joblib.load(fallback_path)
        return None
    except Exception as e:
        print(f"Error loading model {path}: {e}")
        if fallback_path and os.path.exists(fallback_path):
            try:
                print(f"Trying fallback model: {fallback_path}")
                return joblib.load(fallback_path)
            except Exception as e2:
                print(f"Fallback model also failed: {e2}")
        return None


# Try advanced models first, fallback to working models
energy_fallback = os.path.join(MODELS_DIR, "energy_v1_working.joblib")
emiss_fallback = os.path.join(MODELS_DIR, "emissions_v1_working.joblib")

energy_model = _safe_load_model(ENERGY_MODEL_PATH, energy_fallback)
emiss_model = _safe_load_model(EMISS_MODEL_PATH, emiss_fallback)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "app_version": APP_VERSION,
        "energy_model_loaded": energy_model is not None,
        "emissions_model_loaded": emiss_model is not None,
        "models_dir": MODELS_DIR,
        "energy_model_path": ENERGY_MODEL_PATH,
        "emissions_model_path": EMISS_MODEL_PATH,
    }


@app.post("/predict")
def predict(payload: Dict, x_api_key: Optional[str] = Header(None)):
    if x_api_key != AI_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")

    if energy_model is None or emiss_model is None:
        raise HTTPException(status_code=503, detail="Models not loaded. Train first.")

    # Ensure all required features are present with default values
    required_features = ["paper_pct", "plastic_pct", "organic_pct", "moisture_pct", 
                        "airflow", "grate_speed", "feed_rate", "o2_target", "burner_temp"]
    
    # Fill missing features with default values
    for feature in required_features:
        if feature not in payload:
            if feature in ["airflow", "grate_speed", "feed_rate", "o2_target", "burner_temp"]:
                # Use reasonable defaults for operational parameters
                defaults = {"airflow": 400.0, "grate_speed": 1.5, "feed_rate": 6.0, 
                           "o2_target": 6.0, "burner_temp": 850.0}
                payload[feature] = defaults[feature]
            else:
                payload[feature] = 0.0

    df = pd.DataFrame([payload])
    df = _align_features(df, energy_model)  # Use the same alignment function as recommend
    
    try:
        energy = float(energy_model.predict(df)[0])
        emiss = float(emiss_model.predict(df)[0])
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction failed: {e}")

    return {"pred_energy": energy, "pred_emissions": emiss}


def _sample_settings_space(constraints: Constraints, n_samples: int) -> pd.DataFrame:
    import numpy as np

    rng = np.random.default_rng(seed=42)
    samples = pd.DataFrame({
        "airflow": rng.uniform(constraints.airflow_min, constraints.airflow_max, n_samples),
        "grate_speed": rng.uniform(constraints.grate_speed_min, constraints.grate_speed_max, n_samples),
        "feed_rate": rng.uniform(constraints.feed_rate_min, constraints.feed_rate_max, n_samples),
        "o2_target": rng.uniform(constraints.o2_target_min, constraints.o2_target_max, n_samples),
        "burner_temp": rng.uniform(constraints.burner_temp_min, constraints.burner_temp_max, n_samples)
    })
    return samples

def _align_features(df: pd.DataFrame, model) -> pd.DataFrame:
    # Ensure numeric types
    for col in df.columns:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    df = df.fillna(0.0)
    # Use the expected feature order from metadata
    expected_features = ["paper_pct", "plastic_pct", "organic_pct", "moisture_pct", "airflow", "grate_speed", "feed_rate", "o2_target", "burner_temp"]
    # Add missing columns with 0 and order columns as expected
    for name in expected_features:
        if name not in df.columns:
            df[name] = 0.0
    return df.reindex(columns=expected_features).fillna(0.0)

@app.post("/recommend")
def recommend(req: RecommendRequest, x_api_key: Optional[str] = Header(None)):
    if x_api_key != AI_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")

    if energy_model is None or emiss_model is None:
        raise HTTPException(status_code=503, detail="Models not loaded. Train first.")

    # Merge waste inputs with candidate settings and score
    base = req.waste.dict()
    constraints = req.constraints

    # If any operational fields provided, treat them as fixed and override sampling
    fixed = {k: v for k, v in base.items() if k in {"airflow", "grate_speed", "feed_rate", "o2_target", "burner_temp"} and v is not None}

    candidates = _sample_settings_space(constraints, req.n_samples)
    if fixed:
        for k, v in fixed.items():
            candidates[k] = v

    # Build dataframe for prediction - combine waste composition with operational settings
    waste_composition = pd.DataFrame([{
        'paper_pct': base['paper_pct'],
        'plastic_pct': base['plastic_pct'], 
        'organic_pct': base['organic_pct'],
        'moisture_pct': base['moisture_pct']
    }] * len(candidates)).reset_index(drop=True)
    X = pd.concat([waste_composition, candidates], axis=1)

    try:
        # Ensure correct column order and types
        X_clean = X[['paper_pct', 'plastic_pct', 'organic_pct', 'moisture_pct', 'airflow', 'grate_speed', 'feed_rate', 'o2_target', 'burner_temp']].copy()
        X_clean = X_clean.astype(float)
        
        # Debug logging
        print(f"DEBUG: X_clean shape: {X_clean.shape}")
        print(f"DEBUG: X_clean columns: {list(X_clean.columns)}")
        print(f"DEBUG: X_clean sample: {X_clean.iloc[0].to_dict()}")
        
        energy_pred = energy_model.predict(X_clean)
        emiss_pred = emiss_model.predict(X_clean)
        
        print(f"DEBUG: energy_pred sample: {energy_pred[:3]}")
        print(f"DEBUG: emiss_pred sample: {emiss_pred[:3]}")
        
    except Exception as e:
        print(f"DEBUG: Prediction error: {e}")
        raise HTTPException(status_code=400, detail=f"Recommendation failed: {e}")

    import numpy as np
    penalty = np.where(emiss_pred > constraints.emissions_cap, (emiss_pred - constraints.emissions_cap) * 1000.0, 0.0)
    score = energy_pred - req.lambda_penalty * (emiss_pred + penalty)

    idx = int(np.argmax(score))
    best_settings = candidates.iloc[idx].to_dict()
    return {
        "settings": best_settings,
        "pred_energy": float(energy_pred[idx]),
        "pred_emissions": float(emiss_pred[idx]),
        "score": float(score[idx]),
        "fixed": fixed,
        "constraints": json.loads(req.constraints.json())
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("AI_PORT", "8010"))
    print(f"Starting AI service on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)



