# Allergenicity Predictor using ESM2-150M

A deep learning based allergenicity prediction system built on a fine-tuned 
ESM2-150M protein language model. The system predicts whether a given protein 
sequence is allergenic or non-allergenic, assigns a risk score (Low / Medium / High), 
performs attention-based motif analysis, and visualizes the protein's 3D structure locally.

## What it does
- Binary allergenicity classification from raw protein sequences
- Probability-based risk categorization
- Attention-based motif analysis to identify key allergenic residues
- Local 3D protein structure visualization

## Built with
- ESM2-150M (facebook/esm2_t30_150M_UR50D) via Hugging Face Transformers
- PyTorch
- Biopython
- Scikit-learn
- py3Dmol
- Matplotlib / Seaborn

## Dataset
AlgPred 2.0 — 20,150 protein sequences (50/50 balanced, allergenic vs non-allergenic)
https://webs.iiitd.edu.in/raghava/algpred2/stand.html

## Results
| Model | Accuracy | F1 | AUC-ROC |
|---|---|---|---|
| ESM2 150M Fine-tuned | **0.863** | **0.845** | **0.961** |
