"""
structure.py — 3D structure prediction via ESMFold API
"""

from __future__ import annotations
import requests

ESMFOLD_URL = "https://api.esmatlas.com/foldSequence/v1/pdb/"
MAX_RESIDUES = 400


def get_structure(
    sequence: str,
    timeout: int = 120,
) -> dict:
    """
    Fetch predicted 3D structure (PDB) from ESMFold API.

    Returns
    -------
    dict:
        success : bool
        pdb     : str | None
        error   : str | None
        truncated : bool
        original_length : int
    """

    if not sequence or not isinstance(sequence, str):
        raise ValueError("Invalid protein sequence")

    original_length = len(sequence)
    truncated = False

    if original_length > MAX_RESIDUES:
        sequence = sequence[:MAX_RESIDUES]
        truncated = True

    try:
        response = requests.post(
            ESMFOLD_URL,
            data=sequence,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=timeout,
        )
        response.raise_for_status()

        return {
            "success": True,
            "pdb": response.text,
            "error": None,
            "truncated": truncated,
            "original_length": original_length,
        }

    except requests.RequestException as e:
        return {
            "success": False,
            "pdb": None,
            "error": str(e),
            "truncated": truncated,
            "original_length": original_length,
        }