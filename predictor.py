"""
predictor.py — Sequence → probability + risk category
"""

from __future__ import annotations
import torch
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from model import ESM2Classifier
    from transformers import PreTrainedTokenizer


# ── risk thresholds ─────────────────────────────────────────────────────────
_RISK_THRESHOLDS = {
    "Low Risk":    (0.0,  0.3,  "green"),
    "Medium Risk": (0.3,  0.7,  "orange"),
    "High Risk":   (0.7,  1.01, "red"),
}


def predict(
    sequence: str,
    model: "ESM2Classifier",
    tokenizer: "PreTrainedTokenizer",
    device: torch.device,
    max_length: int = 512,
) -> dict:
    """
    Classify a single protein sequence.
    """

    if not sequence or not isinstance(sequence, str):
        raise ValueError("Invalid protein sequence")

    model = model.to(device)
    model.eval()

    inputs = tokenizer(
        [sequence],
        return_tensors="pt",
        padding=True,
        truncation=True,
        max_length=max_length,
    )
    inputs = {k: v.to(device) for k, v in inputs.items()}

    with torch.no_grad():
        prob = model(inputs["input_ids"], inputs["attention_mask"]).item()

    risk_cat, risk_color = get_risk_category(prob)

    return {
        "probability": round(prob, 4),
        "prediction": int(prob >= 0.5),
        "risk_category": risk_cat,
        "risk_color": risk_color,
    }


def predict_batch(
    sequences: list[str],
    model: "ESM2Classifier",
    tokenizer: "PreTrainedTokenizer",
    device: torch.device,
    batch_size: int = 16,
    max_length: int = 512,
) -> list[dict]:
    """
    Batch inference for multiple sequences.
    """
    from torch.utils.data import DataLoader, Dataset

    class _SeqDataset(Dataset):
        def __init__(self, seqs):
            self.seqs = seqs

        def __len__(self):
            return len(self.seqs)

        def __getitem__(self, idx):
            return self.seqs[idx]

    def _collate(batch):
        return tokenizer(
            batch,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=max_length,
        )

    loader = DataLoader(
        _SeqDataset(sequences),
        batch_size=batch_size,
        collate_fn=_collate
    )

    model = model.to(device)
    model.eval()

    all_probs = []

    with torch.no_grad():
        for batch in loader:
            batch = {k: v.to(device) for k, v in batch.items()}
            probs = model(batch["input_ids"], batch["attention_mask"])
            probs = probs.view(-1)  # safe reshape
            all_probs.extend(probs.cpu().tolist())

    results = []
    for prob in all_probs:
        risk_cat, risk_color = get_risk_category(prob)
        results.append({
            "probability": round(prob, 4),
            "prediction": int(prob >= 0.5),
            "risk_category": risk_cat,
            "risk_color": risk_color,
        })

    return results


def get_risk_category(probability: float) -> tuple[str, str]:
    """
    Map probability → risk category.
    """
    for label, (lo, hi, color) in _RISK_THRESHOLDS.items():
        if lo <= probability < hi:
            return label, color

    return "High Risk", "red"