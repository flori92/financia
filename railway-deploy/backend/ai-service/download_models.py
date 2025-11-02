#!/usr/bin/env python3
"""
Script de pré-chargement des modèles LLM pour Docker
Exécuté pendant le build pour accélérer le démarrage
"""

import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import os

print(' Pré-chargement des modèles LLM...')

# Download lightweight models for faster startup
models_to_download = [
    'microsoft/DialoGPT-medium',
    'distilbert-base-uncased', 
    'sentence-transformers/all-MiniLM-L6-v2'
]

for model_name in models_to_download:
    try:
        print(f'Téléchargement de {model_name}...')
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForCausalLM.from_pretrained(model_name)
        print(f' {model_name} téléchargé')
    except Exception as e:
        print(f' Erreur {model_name}: {e}')

print(' Pré-chargement terminé')
