"""
saliency.py — Gradient-based saliency map (motif analysis)
"""

from __future__ import annotations
import numpy as np
import torch
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from model import ESM2Classifier
    from transformers import PreTrainedTokenizer


def get_saliency_map(
    model: "ESM2Classifier",
    sequence: str,
    tokenizer: "PreTrainedTokenizer",
    device: torch.device,
    max_length: int = 512,
    normalize: bool = True,
) -> np.ndarray:
    """
    Compute per-residue importance using gradient saliency.
    """

    if not sequence or not isinstance(sequence, str):
        raise ValueError("Invalid protein sequence")

    model = model.to(device)
    model.eval()
    model.zero_grad()

    inputs = tokenizer(
        [sequence],
        return_tensors="pt",
        padding=True,
        truncation=True,
        max_length=max_length,
    )
    inputs = {k: v.to(device) for k, v in inputs.items()}

    # get raw embeddings from the layer
    embedding_layer = model.esm2.get_input_embeddings()
    with torch.no_grad():
        raw_embeddings = embedding_layer(inputs["input_ids"])

    # detach into a true leaf tensor, then enable grad + retain it
    # (non-leaf tensors never accumulate .grad without retain_grad())
    embeddings = raw_embeddings.detach().requires_grad_(True)
    embeddings.retain_grad()

    attention_mask = inputs["attention_mask"].float()

    # build extended attention mask
    extended_mask = attention_mask[:, None, None, :]
    extended_mask = (1.0 - extended_mask) * -1e9

    # forward through encoder
    encoder_outputs = model.esm2.encoder(
        embeddings,
        attention_mask=extended_mask,
    )
    hidden_states = encoder_outputs[0]
    pooled = hidden_states.mean(dim=1)

    # classifier forward
    output = model.classifier(pooled).squeeze()

    # ensure scalar for backward
    if output.dim() > 0:
        output = output.mean()

    output.backward()

    # .grad is now guaranteed non-None on our leaf tensor
    if embeddings.grad is None:
        raise RuntimeError("Gradient is None after backward — check model graph.")

    saliency = embeddings.grad.abs().sum(dim=-1).squeeze()

    # strip [CLS] at index 0 and [EOS] at the end
    seq_len = min(len(sequence), saliency.shape[0] - 2)
    saliency = saliency[1 : seq_len + 1].detach().cpu().numpy()

    if normalize and saliency.max() > saliency.min():
        saliency = (saliency - saliency.min()) / (saliency.max() - saliency.min())

    return saliency


def get_top_residues(
    sequence: str,
    saliency: np.ndarray,
    top_k: int = 10,
) -> list[dict]:
    """
    Return top-k most important residues.
    """

    top_k = min(top_k, len(saliency))
    top_positions = np.argsort(saliency)[-top_k:][::-1]

    return [
        {
            "position": int(pos),
            "amino_acid": sequence[pos],
            "score": round(float(saliency[pos]), 4),
        }
        for pos in top_positions
    ]