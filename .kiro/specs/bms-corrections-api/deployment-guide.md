# Guide de Déploiement BMS

## 🎯 Prérequis

### Serveur
- Node.js 18+ LTS
- PostgreSQL 14+
- Redis 6+
- Nginx (reverse proxy)
- SSL/TLS certificate

### Services Externes (Optionnels)
- SendGrid (emails)
- Twilio (SMS/WhatsApp)
- MinIO ou AWS S3 (stockage)
- Budget Insight (banking)

## 📦 Déploiement Backend (API Gateway)

### 1. Préparer le serveur

```bash
# Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Installer Redis
sudo apt-get install redis-server

# Installer PM2 (process manager)
sudo npm install -g pm2
```

### 2. Configurer PostgreSQL

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer la base de données et l'utilisateur
CREATE DATABASE bms_erp;
CREATE USER bms_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE bms_erp TO bms_user;
\q
```

### 3. Cloner et configurer le projet

```bash
# Cloner le repository
git clone https://github.com/your-org/bms.git
cd bms/api-gateway

# Installer les dépendances
npm ci --production

# Copier et configurer .env
cp .env.example .env
nano .env
```

### 4. Configuration .env Production

```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=bms_user
DATABASE_PASSWORD=secure_password
DATABASE_NAME=bms_erp

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=generate_a_very_long_random_secret_key_here
JWT_EXPIRATION=7d

# Email Provider
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your_sendgrid_key

# SMS Provider
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1234567890

# WhatsApp Provider
WHATSAPP_PROVIDER=twilio
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890

# Storage
MINIO_ENDPOINT=s3.amazonaws.com
MINIO_PORT=443
MINIO_ACCESS_KEY=your_aws_access_key
MINIO_SECRET_KEY=your_aws_secret_key
MINIO_BUCKET=bms-production
MINIO_USE_SSL=true

# Environment
NODE_ENV=production
PORT=3001

# CORS
CORS_ORIGIN=https://app.yourdomain.com

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

### 5. Exécuter les migrations

```bash
npm run typeorm migration:run
```

### 6. Build et démarrage

```bash
# Build
npm run build

# Démarrer avec PM2
pm2 start dist/main.js --name bms-api

# Sauvegarder la configuration PM2
pm2 save
pm2 startup
```

### 7. Configuration Nginx

```nginx
# /etc/nginx/sites-available/bms-api
server {
    listen 80;
    server_name api.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Proxy to Node.js
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/bms-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🌐 Déploiement Frontend (Next.js)

### 1. Configuration

```bash
cd bms-web

# Installer les dépendances
npm ci --production

# Configurer .env.production
cp .env.example .env.production
nano .env.production
```

### 2. Configuration .env.production

```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_NAME=BMS
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=production
```

### 3. Build et démarrage

```bash
# Build
npm run build

# Démarrer avec PM2
pm2 start npm --name bms-web -- start

# Sauvegarder
pm2 save
```

### 4. Configuration Nginx Frontend

```nginx
# /etc/nginx/sites-available/bms-web
server {
    listen 80;
    server_name app.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/app.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;
    
    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Cache static assets
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    location /static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/bms-web /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 SSL/TLS avec Let's Encrypt

```bash
# Installer Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtenir les certificats
sudo certbot --nginx -d api.yourdomain.com
sudo certbot --nginx -d app.yourdomain.com

# Renouvellement automatique
sudo certbot renew --dry-run
```

## 📊 Monitoring et Logs

### 1. PM2 Monitoring

```bash
# Voir les logs
pm2 logs bms-api
pm2 logs bms-web

# Monitoring en temps réel
pm2 monit

# Voir le statut
pm2 status

# Redémarrer
pm2 restart bms-api
pm2 restart bms-web
```

### 2. Configuration des logs

```bash
# Rotation des logs PM2
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### 3. Monitoring PostgreSQL

```bash
# Voir les connexions actives
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"

# Voir la taille de la base
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('bms_erp'));"
```

### 4. Monitoring Redis

```bash
# Voir les stats
redis-cli info

# Voir les clés
redis-cli keys "*"

# Monitoring en temps réel
redis-cli monitor
```

## 🔄 Mise à jour

### Backend

```bash
cd bms/api-gateway

# Pull les dernières modifications
git pull origin main

# Installer les nouvelles dépendances
npm ci --production

# Exécuter les migrations
npm run typeorm migration:run

# Rebuild
npm run build

# Redémarrer
pm2 restart bms-api
```

### Frontend

```bash
cd bms-web

# Pull les dernières modifications
git pull origin main

# Installer les nouvelles dépendances
npm ci --production

# Rebuild
npm run build

# Redémarrer
pm2 restart bms-web
```

## 💾 Backup

### 1. Backup PostgreSQL

```bash
# Script de backup quotidien
#!/bin/bash
# /usr/local/bin/backup-bms-db.sh

BACKUP_DIR="/var/backups/bms"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="bms_erp_$DATE.sql.gz"

mkdir -p $BACKUP_DIR

# Backup
sudo -u postgres pg_dump bms_erp | gzip > $BACKUP_DIR/$FILENAME

# Garder seulement les 30 derniers jours
find $BACKUP_DIR -name "bms_erp_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $FILENAME"
```

```bash
# Rendre le script exécutable
sudo chmod +x /usr/local/bin/backup-bms-db.sh

# Ajouter au cron (tous les jours à 2h du matin)
sudo crontab -e
0 2 * * * /usr/local/bin/backup-bms-db.sh
```

### 2. Restauration

```bash
# Restaurer depuis un backup
gunzip -c /var/backups/bms/bms_erp_20240101_020000.sql.gz | sudo -u postgres psql bms_erp
```

## 🚨 Troubleshooting

### Backend ne démarre pas

```bash
# Vérifier les logs
pm2 logs bms-api --lines 100

# Vérifier la connexion PostgreSQL
psql -h localhost -U bms_user -d bms_erp

# Vérifier la connexion Redis
redis-cli ping
```

### Frontend ne charge pas

```bash
# Vérifier les logs
pm2 logs bms-web --lines 100

# Vérifier que l'API est accessible
curl https://api.yourdomain.com/api/v1/health
```

### Erreurs de migration

```bash
# Voir l'état des migrations
npm run typeorm migration:show

# Revenir en arrière
npm run typeorm migration:revert

# Réexécuter
npm run typeorm migration:run
```

### Performance lente

```bash
# Vérifier l'utilisation CPU/RAM
pm2 monit

# Vérifier les requêtes lentes PostgreSQL
sudo -u postgres psql -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"

# Vérifier Redis
redis-cli info stats
```

## 📈 Optimisations Production

### 1. PostgreSQL

```sql
-- Optimiser les index
REINDEX DATABASE bms_erp;

-- Analyser les tables
ANALYZE;

-- Vacuum
VACUUM ANALYZE;
```

### 2. Redis Cache

```bash
# Configurer Redis pour la persistence
sudo nano /etc/redis/redis.conf

# Ajouter:
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### 3. Node.js

```bash
# Augmenter la mémoire disponible
pm2 delete bms-api
pm2 start dist/main.js --name bms-api --node-args="--max-old-space-size=4096"
pm2 save
```

## 🔐 Sécurité

### 1. Firewall

```bash
# Installer UFW
sudo apt-get install ufw

# Configurer
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Fail2Ban

```bash
# Installer
sudo apt-get install fail2ban

# Configurer
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Redémarrer
sudo systemctl restart fail2ban
```

### 3. Mises à jour de sécurité

```bash
# Activer les mises à jour automatiques
sudo apt-get install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

## ✅ Checklist de Déploiement

- [ ] Serveur configuré (Node.js, PostgreSQL, Redis)
- [ ] Base de données créée et migrations exécutées
- [ ] Variables d'environnement configurées
- [ ] SSL/TLS configuré
- [ ] Nginx configuré et testé
- [ ] PM2 configuré avec auto-restart
- [ ] Backups automatiques configurés
- [ ] Monitoring en place
- [ ] Firewall configuré
- [ ] Logs rotation configurée
- [ ] Tests end-to-end passés
- [ ] Documentation à jour
- [ ] Équipe formée

## 📞 Support

En cas de problème:
1. Vérifier les logs: `pm2 logs`
2. Vérifier le statut: `pm2 status`
3. Consulter la documentation
4. Contacter l'équipe technique
