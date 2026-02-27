content = r"""
import os
import pickle
import numpy as np
import shap

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List
from dotenv import load_dotenv

# -----------------------------------
# Load environment variables
# -----------------------------------
load_dotenv()

THRESHOLD = float(os.getenv("THRESHOLD", 0.3))
MODEL_VERSION = "1.0.0"
MODEL_PATH = os.path.join("models", "final_model.pkl")

# -----------------------------------
# Create FastAPI App
# -----------------------------------
app = FastAPI(
    title="WorkSight – Employee Attrition Risk API",
    description="Production-ready ML API for predicting employee attrition risk",
    version=MODEL_VERSION,
)

# -----------------------------------
# Enable CORS
# -----------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------
# Load Model
# -----------------------------------
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

EXPECTED_FEATURES = model.n_features_in_

# Prepare SHAP explainer once (efficient)
explainer = shap.TreeExplainer(model)

# -----------------------------------
# Request Schema
# -----------------------------------
class EmployeeFeatures(BaseModel):
    features: List[float] = Field(
        ...,
        description="List of encoded and scaled feature values",
        example=[0.0] * EXPECTED_FEATURES,
    )

# -----------------------------------
# Root Endpoint
# -----------------------------------
@app.get("/")
def home():
    return {
        "message": "WorkSight Attrition Risk API is running",
        "model_version": MODEL_VERSION,
        "expected_feature_count": EXPECTED_FEATURES,
        "decision_threshold": THRESHOLD,
    }

# -----------------------------------
# Health Check
# -----------------------------------
@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": True,
        "expected_features": EXPECTED_FEATURES,
    }

# -----------------------------------
# Model Metadata
# -----------------------------------
@app.get("/model-info")
def model_info():
    return {
        "model_version": MODEL_VERSION,
        "model_type": "Random Forest Classifier",
        "feature_count": EXPECTED_FEATURES,
        "decision_threshold": THRESHOLD,
        "class_labels": ["No Attrition", "Attrition"],
    }

# -----------------------------------
# Prediction Endpoint
# -----------------------------------
@app.post("/predict")
def predict(data: EmployeeFeatures):

    if len(data.features) != EXPECTED_FEATURES:
        raise HTTPException(
            status_code=400,
            detail=f"Expected {EXPECTED_FEATURES} features, got {len(data.features)}",
        )

    try:
        features_array = np.array(data.features).reshape(1, -1)

        # Predict probability
        probability = model.predict_proba(features_array)[0][1]

        # Business logic layer
        if probability >= THRESHOLD:
            risk_category = "High Risk"
        elif probability >= 0.15:
            risk_category = "Medium Risk"
        else:
            risk_category = "Low Risk"

        # SHAP Explainability
        shap_values = explainer.shap_values(features_array)

        # Binary classification handling
        if isinstance(shap_values, list):
            feature_impacts = shap_values[1][0]
        else:
            feature_impacts = shap_values[0]

        # Get top 5 impactful features
        top_indices = np.argsort(np.abs(feature_impacts))[-5:][::-1]

        top_features = [
            {
                "feature_index": int(idx),
                "impact": float(feature_impacts[idx]),
            }
            for idx in top_indices
        ]

        return {
            "attrition_risk_probability": round(float(probability), 4),
            "risk_category": risk_category,
            "decision_threshold": THRESHOLD,
            "model_version": MODEL_VERSION,
            "top_feature_impacts": top_features,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}",
        )

# -----------------------------------
# Production Run
# -----------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
"""
with open('main.py','w',encoding='utf-8') as f:
    f.write(content)
print('main.py rewritten')
