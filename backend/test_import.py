import os
import pickle
import numpy as np
import shap

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List
from dotenv import load_dotenv

load_dotenv()

THRESHOLD = float(os.getenv("THRESHOLD", 0.3))
MODEL_VERSION = "1.0.0"
MODEL_PATH = os.path.join("models", "final_model.pkl")

app = FastAPI(title="test", description="desc", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
print('setup complete')
