from fastapi import FastAPI
from pydantic import BaseModel
import pickle
import numpy as np

app = FastAPI()

# Load model
with open("final_model.pkl", "rb") as f:
    model = pickle.load(f)

# Define input schema
class EmployeeFeatures(BaseModel):
    features: list[float]

@app.get("/")
def home():
    return {"message": "WorkSight Attrition Risk API Running"}

@app.post("/predict")
def predict(data: EmployeeFeatures):
    features_array = np.array(data.features).reshape(1, -1)
    probability = model.predict_proba(features_array)[0][1]
    return {"attrition_risk_probability": float(probability)}
