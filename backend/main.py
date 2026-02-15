from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import pickle
import numpy as np
import os
from typing import List

# -------------------------------
# CONFIGURATION
# -------------------------------

MODEL_PATH = "models/final_model.pkl"
THRESHOLD = 0.3
MODEL_VERSION = "1.0.0"

# -------------------------------
# CREATE FASTAPI APP
# -------------------------------

app = FastAPI(
    title="WorkSight – Employee Attrition Risk API",
    description="Production-ready ML API for predicting employee attrition risk",
    version=MODEL_VERSION
)

# -------------------------------
# LOAD MODEL
# -------------------------------

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

EXPECTED_FEATURES = model.n_features_in_

# -------------------------------
# INPUT SCHEMA
# -------------------------------

class EmployeeFeatures(BaseModel):
    features: List[float] = Field(
        ...,
        description="List of encoded and scaled feature values",
        example=[0.0] * EXPECTED_FEATURES
    )

# -------------------------------
# ROOT ENDPOINT
# -------------------------------

@app.get("/")
def home():
    return {
        "message": "WorkSight Attrition Risk API is running",
        "model_version": MODEL_VERSION,
        "expected_feature_count": EXPECTED_FEATURES,
        "decision_threshold": THRESHOLD
    }

# -------------------------------
# HEALTH CHECK
# -------------------------------

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": True,
        "expected_features": EXPECTED_FEATURES
    }

# -------------------------------
# PREDICTION ENDPOINT
# -------------------------------

@app.post("/predict")
def predict(data: EmployeeFeatures):

    if len(data.features) != EXPECTED_FEATURES:
        raise HTTPException(
            status_code=400,
            detail=f"Expected {EXPECTED_FEATURES} features, got {len(data.features)}"
        )

    try:
        features_array = np.array(data.features).reshape(1, -1)
        probability = model.predict_proba(features_array)[0][1]

        if probability >= THRESHOLD:
            risk_category = "High Risk"
        elif probability >= 0.15:
            risk_category = "Medium Risk"
        else:
            risk_category = "Low Risk"

        return {
            "attrition_risk_probability": round(float(probability), 4),
            "risk_category": risk_category,
            "decision_threshold": THRESHOLD,
            "model_version": MODEL_VERSION,
            "feature_count": EXPECTED_FEATURES
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )
