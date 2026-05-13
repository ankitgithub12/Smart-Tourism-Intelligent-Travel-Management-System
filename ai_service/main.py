import os
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Smart Tourism AI Service")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for dev, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "AI Service"}

# Hugging Face Configuration
HF_API_TOKEN = os.getenv("HF_API_TOKEN")

# Model IDs
CHAT_MODEL = "google/flan-t5-base"
RECOMMEND_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
CROWD_MODEL = "facebook/bart-large-mnli"
SENTIMENT_MODEL = "distilbert-base-uncased-finetuned-sst-2-english"

headers = {
    "Authorization": f"Bearer {HF_API_TOKEN}"
}

class ChatMessage(BaseModel):
    message: str

class RecommendRequest(BaseModel):
    preferences: str

class CrowdRequest(BaseModel):
    location_data: str

class SentimentRequest(BaseModel):
    text: str

def call_hf_api(model_id, payload):
    if not HF_API_TOKEN:
        raise HTTPException(status_code=500, detail="Hugging Face API Token not configured")
    
    url = f"https://api-inference.huggingface.co/models/{model_id}"
    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error calling Hugging Face ({model_id}): {e}")
        raise HTTPException(status_code=500, detail=f"Error communicating with AI model {model_id}")

@app.get("/")
async def root():
    return {"message": "Smart Tourism AI Service is running"}

@app.post("/chat")
async def chat(request: ChatMessage):
    payload = {
        "inputs": request.message,
        "parameters": {"max_length": 150, "temperature": 0.7}
    }
    result = call_hf_api(CHAT_MODEL, payload)
    if isinstance(result, list) and len(result) > 0:
        return {"reply": result[0].get("generated_text", "I'm sorry, I couldn't process that.")}
    return {"reply": "Unexpected response format."}

@app.post("/recommend")
async def recommend(request: RecommendRequest):
    payload = {"inputs": request.preferences}
    result = call_hf_api(RECOMMEND_MODEL, payload)
    # MiniLM returns embeddings, but for a simple recommendation we might just return the result
    return {"recommendation": result}

@app.post("/crowd-predict")
async def crowd_predict(request: CrowdRequest):
    # BART Zero-Shot Classification
    payload = {
        "inputs": request.location_data,
        "parameters": {"candidate_labels": ["low", "medium", "high", "overcrowded"]}
    }
    result = call_hf_api(CROWD_MODEL, payload)
    return {"prediction": result}

@app.post("/sentiment")
async def sentiment(request: SentimentRequest):
    payload = {"inputs": request.text}
    result = call_hf_api(SENTIMENT_MODEL, payload)
    return {"sentiment": result}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
