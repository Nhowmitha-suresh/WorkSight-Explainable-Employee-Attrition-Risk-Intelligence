import os
import pickle
import numpy as np

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List
from dotenv import load_dotenv

# load env
load_dotenv()

# create app
app = FastAPI(title="WorkSight – Employee Attrition Risk API", description="Production-ready ML API for predicting employee attrition risk", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print('noshap app created')
