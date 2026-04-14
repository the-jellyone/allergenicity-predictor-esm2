"""
app.py — FastAPI backend for Protein Allergen Analysis
"""

import asyncio
from concurrent.futures import ThreadPoolExecutor

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware # 1. Import CORSMiddleware
from pydantic import BaseModel

from model import load_model
from predictor import predict
from saliency import get_saliency_map, get_top_residues
from structure import get_structure

# ── init app ─────────────────────────────────────────────
app = FastAPI(title="Protein Allergen Analyzer")

# 2. Add CORS Middleware to allow React to talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    # Allow Vite's default local servers
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], 
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (POST, GET, etc.)
    allow_headers=["*"], # Allows all headers
)

# thread pool for blocking calls (model inference, ESMFold API)
_executor = ThreadPoolExecutor(max_workers=4)

# ── load model once at startup ───────────────────────────
model, tokenizer, device = load_model("models/esm2_150m_finetuned.pt")


# ── request schema ───────────────────────────────────────
class ProteinInput(BaseModel):
    sequence: str


# ── health check ─────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "ok", "message": "Protein Allergen Analyzer API running"}


# ── full analysis endpoint ───────────────────────────────
@app.post("/analyze")
async def analyze(data: ProteinInput):
    seq = data.sequence.strip().upper()

    if not seq:
        raise HTTPException(status_code=400, detail="Sequence cannot be empty.")

    # basic sanity check — only valid amino acid characters
    valid_aa = set("ACDEFGHIKLMNPQRSTVWY")
    invalid = set(seq) - valid_aa
    if invalid:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid characters in sequence: {invalid}"
        )

    loop = asyncio.get_event_loop()

    # run prediction + saliency in one thread, ESMFold in another — concurrently
    def run_model():
        pred = predict(seq, model, tokenizer, device)
        saliency = get_saliency_map(model, seq, tokenizer, device)
        top_res = get_top_residues(seq, saliency)
        return pred, saliency.tolist(), top_res

    def run_structure():
        return get_structure(seq)

    try:
        (pred, saliency, top_res), structure = await asyncio.gather(
            loop.run_in_executor(_executor, run_model),
            loop.run_in_executor(_executor, run_structure),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    return {
        "prediction": pred,
        "saliency": saliency,
        "top_residues": top_res,
        "structure": structure,   # PDB string or None if ESMFold was unreachable
    }