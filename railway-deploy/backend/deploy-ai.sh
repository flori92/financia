#!/bin/bash

# Script de déploiement BMS AI/ML Analytics Service
# Usage: ./deploy-ai.sh [dev|prod|update|stop]

set -e

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions de log
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérification des prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    # Vérifier Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker n'est pas installé. Veuillez installer Docker d'abord."
        exit 1
    fi
    
    # Vérifier Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose n'est pas installé. Veuillez installer Docker Compose d'abord."
        exit 1
    fi
    
    # Vérifier Python (pour développement local)
    if [ "$1" = "dev" ] && ! command -v python3 &> /dev/null; then
        log_error "Python 3 n'est pas installé. Veuillez installer Python 3.9+."
        exit 1
    fi
    
    log_success "Prérequis vérifiés ✓"
}

# Configuration des variables d'environnement
setup_env() {
    log_info "Configuration des variables d'environnement..."
    
    if [ ! -f .env ]; then
        log_warning "Fichier .env non trouvé. Création à partir de .env.example..."
        
        cat > .env << EOF
# Clés APIs (obligatoires pour les fonctionnalités IA)
OPENAI_API_KEY=sk-your-openai-key-here
HUGGINGFACE_API_KEY=hf-your-huggingface-key-here

# Configuration service IA
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_ENV=development

# Base de données
DATABASE_URL=postgresql://postgres:password@localhost:5432/bms_ai
POSTGRES_DB=bms_ai
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Monitoring
GRAFANA_ADMIN_PASSWORD=admin
PROMETHEUS_RETENTION=30d

# Logs
LOG_LEVEL=info
LOG_FILE=logs/ai-service.log
EOF
        
        log_warning "Veuillez éditer le fichier .env et ajouter vos clés APIs OpenAI et HuggingFace"
        log_warning "Puis relancer le script: ./deploy-ai.sh $1"
        exit 1
    fi
    
    # Charger les variables d'environnement
    export $(grep -v '^#' .env | xargs)
    log_success "Variables d'environnement configurées ✓"
}

# Déploiement développement
deploy_dev() {
    log_info "Déploiement en mode développement..."
    
    # Lancer les services de base
    log_info "Démarrage de Redis et PostgreSQL..."
    docker-compose -f docker-compose.ai.yml up -d redis postgres
    
    # Attendre que la base de données soit prête
    log_info "Attente de la base de données..."
    sleep 10
    
    # Lancer le service IA localement
    log_info "Démarrage du service IA en mode développement..."
    cd ai-service
    
    # Créer l'environnement virtuel si nécessaire
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    
    # Activer l'environnement virtuel
    source venv/bin/activate
    
    # Installer les dépendances
    pip install -r requirements.txt
    
    # Lancer le service
    python app.py &
    AI_PID=$!
    
    cd ..
    
    # Lancer Jupyter pour le développement
    log_info "Démarrage de Jupyter Notebook..."
    docker-compose -f docker-compose.ai.yml up -d jupyter-ml
    
    log_success "Déploiement développement terminé ✓"
    log_info "Service IA: http://localhost:8000"
    log_info "Jupyter: http://localhost:8888"
    log_info "Health Check: curl http://localhost:8000/health"
    
    # Sauvegarder le PID pour l'arrêt
    echo $AI_PID > .ai_dev.pid
}

# Déploiement production
deploy_prod() {
    log_info "Déploiement en mode production..."
    
    # Build et lancer tous les services
    log_info "Build des images Docker..."
    docker-compose -f docker-compose.ai.yml build
    
    log_info "Démarrage de tous les services..."
    docker-compose -f docker-compose.ai.yml up -d
    
    # Attendre que les services soient prêts
    log_info "Attente du démarrage des services..."
    sleep 30
    
    # Vérifier le health check
    log_info "Vérification du service IA..."
    if curl -f http://localhost:8000/health &> /dev/null; then
        log_success "Service IA prêt ✓"
    else
        log_error "Le service IA n'est pas prêt. Vérifiez les logs:"
        docker-compose -f docker-compose.ai.yml logs bms-ai-service
        exit 1
    fi
    
    log_success "Déploiement production terminé ✓"
    log_info "Services disponibles:"
    log_info "- Service IA: http://localhost:8000"
    log_info "- Grafana: http://localhost:3000 (admin/admin)"
    log_info "- Prometheus: http://localhost:9090"
    log_info "- Jupyter: http://localhost:8888"
}

# Mise à jour
update() {
    log_info "Mise à jour des services..."
    
    # Pull des dernières images
    docker-compose -f docker-compose.ai.yml pull
    
    # Redéploiement avec zero downtime
    log_info "Redéploiement progressif..."
    docker-compose -f docker-compose.ai.yml up -d --force-recreate
    
    log_success "Mise à jour terminée ✓"
}

# Arrêt des services
stop() {
    log_info "Arrêt des services..."
    
    # Arrêter le service de développement si actif
    if [ -f .ai_dev.pid ]; then
        AI_PID=$(cat .ai_dev.pid)
        if kill -0 $AI_PID 2>/dev/null; then
            kill $AI_PID
            log_info "Service IA développement arrêté"
        fi
        rm .ai_dev.pid
    fi
    
    # Arrêter les services Docker
    docker-compose -f docker-compose.ai.yml down
    
    log_success "Services arrêtés ✓"
}

# Afficher les logs
logs() {
    log_info "Affichage des logs du service IA..."
    docker-compose -f docker-compose.ai.yml logs -f bms-ai-service
}

# Afficher le statut
status() {
    log_info "Statut des services:"
    docker-compose -f docker-compose.ai.yml ps
    
    echo ""
    log_info "Health Check Service IA:"
    if curl -s http://localhost:8000/health | jq . 2>/dev/null; then
        log_success "Service IA: OK ✓"
    else
        log_warning "Service IA: Non disponible ou erreur"
    fi
}

# Nettoyage
cleanup() {
    log_info "Nettoyage des ressources..."
    
    # Arrêter les services
    stop
    
    # Supprimer les volumes (attention: perte de données)
    read -p "Supprimer les volumes de données? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose -f docker-compose.ai.yml down -v
        log_warning "Volumes de données supprimés"
    fi
    
    # Supprimer les images
    docker-compose -f docker-compose.ai.yml down --rmi all
    
    log_success "Nettoyage terminé ✓"
}

# Menu d'aide
show_help() {
    echo "Usage: $0 [COMMANDE]"
    echo ""
    echo "Commandes disponibles:"
    echo "  dev     - Déploie en mode développement (local + Docker)"
    echo "  prod    - Déploie en mode production (Docker Complet)"
    echo "  update  - Met à jour les services"
    echo "  stop    - Arrête tous les services"
    echo "  logs    - Affiche les logs du service IA"
    echo "  status  - Affiche le statut des services"
    echo "  cleanup - Nettoie toutes les ressources"
    echo "  help    - Affiche cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0 dev     # Déploiement développement"
    echo "  $0 prod    # Déploiement production"
    echo "  $0 status  # Vérifier le statut"
}

# Script principal
main() {
    local command=${1:-help}
    
    case $command in
        "dev")
            check_prerequisites dev
            setup_env
            deploy_dev
            ;;
        "prod")
            check_prerequisites prod
            setup_env
            deploy_prod
            ;;
        "update")
            update
            ;;
        "stop")
            stop
            ;;
        "logs")
            logs
            ;;
        "status")
            status
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            log_error "Commande inconnue: $command"
            show_help
            exit 1
            ;;
    esac
}

# Exécuter le script
main "$@"
