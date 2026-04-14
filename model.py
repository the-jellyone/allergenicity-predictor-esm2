"""
ESM2-based Protein Allergen Classifier
model.py — Model definition + loading
"""

import torch
import torch.nn as nn
from transformers import AutoTokenizer, AutoModel

MODEL_NAME = "facebook/esm2_t30_150M_UR50D"


class ESM2Classifier(nn.Module):
    """
    ESM2-150M backbone with a lightweight classification head.
    """

    def __init__(self, esm2_model):
        super().__init__()
        self.esm2 = esm2_model
        self.classifier = nn.Sequential(
            nn.Linear(640, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, 64),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(64, 1),
            nn.Sigmoid(),
        )

    def forward(self, input_ids, attention_mask):
        outputs = self.esm2(input_ids=input_ids, attention_mask=attention_mask)
        embeddings = outputs.last_hidden_state.mean(dim=1)
        return self.classifier(embeddings).squeeze(-1)  # safe squeeze


def get_device():
    """
    Select best available device (MPS > CUDA > CPU)
    """
    if torch.backends.mps.is_available():
        return torch.device("mps")
    elif torch.cuda.is_available():
        return torch.device("cuda")
    else:
        return torch.device("cpu")


def load_model(weights_path: str, device: torch.device | None = None):
    """
    Load the fine-tuned ESM2Classifier.
    """

    if device is None:
        device = get_device()

    print(f"[load_model] using device: {device}")
    print("[load_model] loading ESM2 backbone...")

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    esm2 = AutoModel.from_pretrained(MODEL_NAME)

    model = ESM2Classifier(esm2)

    print(f"[load_model] loading weights from: {weights_path}")
    # ALWAYS load on CPU first (fixes MPS bug)
    state = torch.load(weights_path, map_location="cpu")

    model.load_state_dict(state, strict=True)

    # THEN move to device
    model.to(device)

    print("[load_model] model ready")

    return model, tokenizer, device