from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import pickle
import numpy as np
import os
from typing import List

# --------------------------------------------------
# Configuration
# --------------------------------------------------

MODEL_PATH = "final_model.pkl"
THRESHOLD = 0.3  # tuned threshold for higher recall

# --------------------------------------------------
# Initialize FastAPI App
# --------------------------------------------------

app = FastAPI(
    title="WorkSight – Employee Attrition Risk API",
    description="Production-ready ML API for predicting employee attrition risk",
    version="1.0.0"
)

# --------------------------------------------------
# Load Model at Startup
# --------------------------------------------------

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model file '{MODEL_PATH}' not found!")

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

# Get expected feature count from model
EXPECTED_FEATURES = model.n_features_in_

# --------------------------------------------------
# Input Schema
# --------------------------------------------------

class EmployeeFeatures(BaseModel):
    features: List[float] = Field(
        ...,
        description="List of encoded and scaled feature values",
        example=[0.1] * EXPECTED_FEATURES
    )

# --------------------------------------------------
# Health Check Endpoint
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "WorkSight Attrition Risk API is running",
        "expected_feature_count": EXPECTED_FEATURES,
        "decision_threshold": THRESHOLD
    }

# --------------------------------------------------
# Prediction Endpoint
# --------------------------------------------------

@app.post("/predict")
def predict(data: EmployeeFeatures):

    # Validate feature length
    if len(data.features) != EXPECTED_FEATURES:
        raise HTTPException(
            status_code=400,
            detail=f"Expected {EXPECTED_FEATURES} features, but received {len(data.features)}"
        )

    try:
        # Convert to numpy array
        features_array = np.array(data.features).reshape(1, -1)

        # Predict probability
        probability = model.predict_proba(features_array)[0][1]

        # Apply business threshold logic
        if probability >= THRESHOLD:
            risk_category = "High Risk"
        elif probability >= 0.15:
            risk_category = "Medium Risk"
        else:
            risk_category = "Low Risk"

        return {
            "attrition_risk_probability": round(float(probability), 4),
            "risk_category": risk_category,
            "decision_threshold": THRESHOLD
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )
