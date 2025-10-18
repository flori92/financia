"""
Service d'assistant virtuel pour le support comptable
"""
from typing import Dict, Any, List, Optional
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import numpy as np
from sentence_transformers import SentenceTransformer
import json
import re

class VirtualAssistant:
    def __init__(self, model_path: str, knowledge_base_path: str):
        """
        Initialise l'assistant virtuel
        """
        self.tokenizer = AutoTokenizer.from_pretrained("mistralai/Mistral-7B-v0.1")
        self.model = AutoModelForCausalLM.from_pretrained("mistralai/Mistral-7B-v0.1")
        self.embedder = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2')
        self.knowledge_base = self._load_knowledge_base(knowledge_base_path)
        self.conversation_history = []
        
    def get_response(self, user_input: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Génère une réponse à la question de l'utilisateur
        """
        try:
            # Préparation du contexte
            relevant_info = self._get_relevant_information(user_input, context)
            
            # Construction du prompt
            prompt = self._build_prompt(user_input, relevant_info, context)
            
            # Génération de la réponse
            response = self._generate_response(prompt)
            
            # Validation de la réponse
            validated_response = self._validate_response(response, context)
            
            # Mise à jour de l'historique
            self._update_conversation_history(user_input, validated_response)
            
            return {
                'response': validated_response,
                'confidence_score': self._calculate_confidence(response, user_input),
                'sources': self._get_response_sources(response, relevant_info)
            }
        except Exception as e:
            print(f"Erreur lors de la génération de la réponse: {str(e)}")
            return {
                'response': "Désolé, je ne peux pas répondre à cette question pour le moment.",
                'confidence_score': 0.0,
                'sources': []
            }
    
    def _load_knowledge_base(self, path: str) -> Dict[str, Any]:
        """
        Charge la base de connaissances
        """
        try:
            with open(path, 'r', encoding='utf-8') as f:
                knowledge_base = json.load(f)
            
            # Calcul des embeddings pour la recherche
            for item in knowledge_base['items']:
                item['embedding'] = self.embedder.encode(item['content'])
            
            return knowledge_base
        except Exception as e:
            print(f"Erreur lors du chargement de la base de connaissances: {str(e)}")
            return {'items': []}
    
    def _get_relevant_information(self, query: str, context: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Récupère les informations pertinentes de la base de connaissances
        """
        try:
            # Calcul de l'embedding de la requête
            query_embedding = self.embedder.encode(query)
            
            # Recherche des documents similaires
            similarities = []
            for item in self.knowledge_base['items']:
                similarity = np.dot(query_embedding, item['embedding'])
                similarities.append((similarity, item))
            
            # Tri par pertinence
            similarities.sort(key=lambda x: x[0], reverse=True)
            
            # Sélection des plus pertinents
            return [item for _, item in similarities[:5]]
        except Exception as e:
            print(f"Erreur lors de la recherche d'informations: {str(e)}")
            return []
    
    def _build_prompt(self, user_input: str, relevant_info: List[Dict[str, Any]], 
                     context: Optional[Dict[str, Any]] = None) -> str:
        """
        Construit le prompt pour le modèle
        """
        # Construction du contexte
        context_str = ""
        if context:
            context_str += f"Contexte actuel: {json.dumps(context, ensure_ascii=False)}\n\n"
        
        # Ajout des informations pertinentes
        info_str = "\n".join([item['content'] for item in relevant_info])
        
        # Construction du prompt final
        prompt = f"""En tant qu'assistant comptable, utilise ces informations pour répondre :

Contexte:
{context_str}

Informations pertinentes:
{info_str}

Question: {user_input}

Réponse:"""
        
        return prompt
    
    def _generate_response(self, prompt: str) -> str:
        """
        Génère une réponse avec le modèle de langage
        """
        try:
            # Tokenization
            inputs = self.tokenizer(prompt, return_tensors="pt")
            
            # Génération
            outputs = self.model.generate(
                inputs["input_ids"],
                max_length=500,
                num_beams=5,
                no_repeat_ngram_size=2,
                early_stopping=True
            )
            
            # Décodage
            response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Extraction de la réponse
            return self._extract_response(response, prompt)
        except Exception as e:
            print(f"Erreur lors de la génération de la réponse: {str(e)}")
            return ""
    
    def _validate_response(self, response: str, context: Optional[Dict[str, Any]] = None) -> str:
        """
        Valide et nettoie la réponse générée
        """
        # Vérification de la cohérence
        if not response.strip():
            return "Je ne peux pas générer une réponse appropriée pour le moment."
        
        # Nettoyage du texte
        response = re.sub(r'\s+', ' ', response).strip()
        
        # Validation du contenu technique
        if context and 'validation_rules' in context:
            for rule in context['validation_rules']:
                if not self._check_validation_rule(response, rule):
                    return self._generate_fallback_response(rule)
        
        return response
    
    def _check_validation_rule(self, response: str, rule: Dict[str, Any]) -> bool:
        """
        Vérifie une règle de validation
        """
        # TODO: Implémenter la validation des règles
        return True
    
    def _generate_fallback_response(self, rule: Dict[str, Any]) -> str:
        """
        Génère une réponse de repli en cas d'échec de validation
        """
        # TODO: Implémenter la génération de réponses de repli
        return "Je ne peux pas fournir une réponse précise pour le moment."
    
    def _update_conversation_history(self, user_input: str, response: str):
        """
        Met à jour l'historique de la conversation
        """
        self.conversation_history.append({
            'user_input': user_input,
            'response': response,
            'timestamp': datetime.now().isoformat()
        })
        
        # Limite la taille de l'historique
        if len(self.conversation_history) > 10:
            self.conversation_history.pop(0)
    
    def _calculate_confidence(self, response: str, user_input: str) -> float:
        """
        Calcule un score de confiance pour la réponse
        """
        # TODO: Implémenter le calcul du score de confiance
        return 0.8
    
    def _get_response_sources(self, response: str, relevant_info: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Récupère les sources utilisées pour la réponse
        """
        sources = []
        for info in relevant_info:
            if 'source' in info and any(word in response.lower() for word in info['content'].lower().split()):
                sources.append({
                    'title': info.get('title', ''),
                    'source': info['source'],
                    'relevance': self._calculate_relevance(response, info['content'])
                })
        return sources
    
    def _calculate_relevance(self, response: str, source: str) -> float:
        """
        Calcule la pertinence d'une source pour la réponse
        """
        # TODO: Implémenter le calcul de pertinence
        return 0.5
    
    def _extract_response(self, generated_text: str, prompt: str) -> str:
        """
        Extrait la réponse pertinente du texte généré
        """
        # Supprime le prompt initial
        response = generated_text.replace(prompt, '').strip()
        
        # Nettoie la réponse
        response = re.sub(r'\n{3,}', '\n\n', response)
        
        return response