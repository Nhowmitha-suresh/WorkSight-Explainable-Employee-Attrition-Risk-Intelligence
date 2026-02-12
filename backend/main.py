from fastapi import FastAPI
import pickle
import numpy as np

app = FastAPI()

# Load model
with open("final_model.pkl", "rb") as f:
    model = pickle.load(f)

@app.get("/")
def home():
    return {"message": "WorkSight Attrition Risk API Running"}

@app.post("/predict")
def predict(features: list):
    data = np.array(features).reshape(1, -1)
    probability = model.predict_proba(data)[0][1]
    return {"attrition_risk_probability": float(probability)}
