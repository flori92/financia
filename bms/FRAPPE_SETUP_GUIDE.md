# 🔧 Guide de Configuration Frappe/ERPNext

## 📋 Prérequis

- Python 3.10+
- Node.js 18+
- MariaDB 10.6+ ou PostgreSQL
- Redis
- wkhtmltopdf (pour PDF)

---

## 🚀 Installation Rapide (Docker - Recommandé)

### 1. Utiliser Frappe Docker

```bash
cd /Users/floriace/MERP/financia

# Créer docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: "3"

services:
  frappe:
    image: frappe/erpnext:latest
    ports:
      - "8000:8000"
    environment:
      - FRAPPE_SITE_NAME_HEADER=erpnext.localhost
    volumes:
      - frappe-data:/home/frappe/frappe-bench/sites
    depends_on:
      - mariadb
      - redis

  mariadb:
    image: mariadb:10.6
    environment:
      - MYSQL_ROOT_PASSWORD=admin
    volumes:
      - mariadb-data:/var/lib/mysql

  redis:
    image: redis:alpine
    volumes:
      - redis-data:/data

volumes:
  frappe-data:
  mariadb-data:
  redis-data:
EOF

# Démarrer
docker-compose up -d

# Attendre 2-3 minutes pour l'initialisation
docker-compose logs -f frappe
```

### 2. Accéder à Frappe

- URL: http://localhost:8000
- Login: Administrator
- Password: admin

---

## 🔑 Configuration API

### 1. Créer un utilisateur API dans Frappe

```bash
# Via interface web
# User Desk → User → New
# - Email: api@bms.local
# - First Name: API
# - Role: System Manager
```

### 2. Générer API Key & Secret

```bash
# Via Frappe console
docker exec -it financia-frappe-1 bench --site erpnext.localhost console

# Dans le console Python:
from frappe.core.doctype.user.user import generate_keys
generate_keys("api@bms.local")
frappe.db.commit()

# Récupérer les clés
user = frappe.get_doc("User", "api@bms.local")
print(f"API Key: {user.api_key}")
print(f"API Secret: {user.get_password('api_secret')}")
```

### 3. Configurer BMS

```bash
cd /Users/floriace/MERP/bms/api-gateway

# Créer .env si n'existe pas
cp .env.example .env

# Ajouter les clés
echo "FRAPPE_BASE_URL=http://localhost:8000" >> .env
echo "FRAPPE_API_KEY=<votre_api_key>" >> .env
echo "FRAPPE_API_SECRET=<votre_api_secret>" >> .env
```

---

## ✅ Vérification

### 1. Test de connexion

```bash
# Dans BMS
npm run start:dev

# Tester l'endpoint
curl http://localhost:3001/api/v1/frappe/status
```

Réponse attendue:
```json
{
  "available": true,
  "message": "Connected"
}
```

### 2. Test de synchronisation

```bash
curl -X POST http://localhost:3001/api/v1/frappe/sync
```

---

## 📊 Configuration Avancée

### Activer la synchronisation automatique

Dans `frappe-sync.service.ts`, la synchronisation se fait automatiquement toutes les 5 minutes.

Pour changer la fréquence:

```typescript
// Toutes les 10 minutes
@Cron('*/10 * * * *')

// Toutes les heures
@Cron(CronExpression.EVERY_HOUR)

// Tous les jours à minuit
@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
```

### Webhooks Frappe → BMS

Dans Frappe, créer des webhooks:

1. **Setup → Integrations → Webhook**
2. **Créer nouveaux webhooks**:

```
Document Type: Sales Invoice
Event: After Insert
Webhook URL: http://host.docker.internal:3001/api/v1/frappe/webhook/invoice
```

Répéter pour:
- Payment Entry
- Journal Entry
- Customer
- Supplier

---

## 🔧 Troubleshooting

### Frappe ne démarre pas

```bash
# Vérifier les logs
docker-compose logs frappe

# Redémarrer
docker-compose restart frappe
```

### API Key ne fonctionne pas

```bash
# Vérifier dans Frappe
bench --site erpnext.localhost console
user = frappe.get_doc("User", "api@bms.local")
print(user.api_key)
```

### BMS ne voit pas Frappe

```bash
# Vérifier que Frappe est accessible
curl http://localhost:8000/api/method/ping

# Vérifier les variables d'environnement
cat .env | grep FRAPPE
```

---

## 📚 Ressources

- [Frappe Docker](https://github.com/frappe/frappe_docker)
- [Frappe REST API](https://frappeframework.com/docs/user/en/api/rest)
- [ERPNext Documentation](https://docs.erpnext.com)

---

## 🎯 Next Steps

1. ✅ Installer Frappe (Docker)
2. ✅ Créer utilisateur API
3. ✅ Configurer BMS
4. ✅ Tester la connexion
5. ⏳ Synchroniser le plan comptable
6. ⏳ Configurer les webhooks
7. ⏳ Tester les workflows complets
