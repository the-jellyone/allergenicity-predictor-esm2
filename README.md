<img width="1874" height="4360" alt="localhost_5173_ (4)" src="https://github.com/user-attachments/assets/22ce827b-64a4-4bb6-b055-5a52b6f26613" /># Allergenicity Predictor using ESM2-150M

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


DEPLOYMENT PHOTOS:
<img width="1290" height="718" alt="Screenshot 2026-04-14 at 4 43 33 PM" src="https://github.com/user-attachments/assets/74e2bf5c-6446-4400-8225-1ce6b49872ec" />
<img width="2538" height="1370" alt="image" src="https://github.com/user-attachments/assets/07beddb7-cf1c-40b6-a9f3-d14a8bf56522" />

<img width="1218" height="666" alt="Screenshot 2026-04-14 at 4 44 17 PM" src="https://github.com/user-attachments/assets/25549588-4502-473c-b064-4a92a006df8f" />

## DEPLOYED LOCALLY 
