# 🚀 BMS - Démarrage Rapide

## ⚡ Lancement en 30 secondes

```bash
# 1. Démarrer l'application
./START_ALL.sh

# 2. Ouvrir votre navigateur
# http://localhost:3000

# 3. Se connecter avec un compte de test
# Email: comptable@cabinet.bj
# Mot de passe: password123
```

## 🎯 Comptes de Démonstration

| Rôle | Email | Mot de passe | Page d'accueil |
|------|-------|--------------|----------------|
| **Comptable** | comptable@cabinet.bj | password123 | `/accountant` |
| **Entrepreneur** | entrepreneur@test.bj | password123 | `/dashboard` |
| **Admin Fiscal** | taxadmin@dgi.bj | password123 | `/dashboard` |
| **Admin** | admin@bms.bj | password123 | `/dashboard` |

## 📱 Modules Disponibles

### 🏠 Dashboard
- Vue d'ensemble de l'activité
- KPIs principaux
- Graphiques de performance

### 👥 CRM
- **Contacts**: Gestion clients
- **Opportunités**: Pipeline de vente
- **Dashboard CRM**: Statistiques

### 💰 Comptabilité (Profil Comptable)
- **Dashboard**: KPIs financiers
- **Plan Comptable**: SYSCOHADA
- **Journal**: Écritures comptables
- **Grand Livre**: Par compte
- **Balance Âgée**: Créances/Dettes
- **Compte de Résultat**: Produits et charges
- **Bilan**: Actif/Passif
- **TVA**: Déclarations
- **Rapprochement Bancaire**: Automatique

### 💵 Factures
- Création et envoi
- Suivi des paiements
- Relances automatiques

### 🛒 Achats
- **Fournisseurs**: Gestion complète
- **Commandes**: Bons de commande
- **Réceptions**: Contrôle marchandises
- **Appels d'offres**: Demandes de devis

### 🏭 Production
- **Ordres de Fabrication**: Gestion des OF
- **Nomenclatures (BOM)**: Composants
- **Planification MRP**: Calcul besoins

### 📦 Stock
- Gestion multi-entrepôts
- Mouvements de stock
- Alertes de rupture

### 👨‍💼 RH
- **Employés**: Gestion du personnel
- **Paie**: Calcul et fiches
- **Congés**: Demandes et validation
- **Notes de frais**: Remboursements

### 📊 Projets
- Suivi de progression
- Budget vs dépensé
- Gantt et timesheet

### 💵 Budget
- Budget prévisionnel
- Réalisé vs Budget
- Analyse des écarts

### 💰 Trésorerie
- Solde bancaire en temps réel
- Prévisions de trésorerie
- Cash flow
- Comptes bancaires

### ⚙️ Paramètres
- Configuration société
- Gestion utilisateurs
- Préférences

## 🛠️ Commandes Utiles

### Démarrer
```bash
./START_ALL.sh
```

### Arrêter
```bash
./STOP_ALL.sh
```

### Voir les logs
```bash
# Backend
tail -f bms/api-gateway/mock.log

# Frontend
tail -f bms-web/frontend.log
```

### Redémarrer
```bash
./STOP_ALL.sh && ./START_ALL.sh
```

## 🌐 URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health**: http://localhost:3001/api/v1/auth/me

## 📚 Documentation

- `CORRECTIONS_EFFECTUEES.md` - Liste des corrections
- `ACCES_FONCTIONNALITES.md` - Guide d'accès aux fonctionnalités
- `GUIDE_UTILISATEUR_BMS.md` - Guide utilisateur complet
- `API_IMPLEMENTATION_COMPLETE.md` - Documentation API

## 🐛 Dépannage

### Le backend ne démarre pas
```bash
# Vérifier si le port 3001 est libre
lsof -i :3001

# Tuer le processus si nécessaire
kill -9 $(lsof -t -i:3001)

# Redémarrer
./START_ALL.sh
```

### Le frontend ne démarre pas
```bash
# Vérifier si le port 3000 est libre
lsof -i :3000

# Tuer le processus si nécessaire
kill -9 $(lsof -t -i:3000)

# Réinstaller les dépendances si nécessaire
cd bms-web
npm install

# Redémarrer
cd ..
./START_ALL.sh
```

### Erreur de connexion
1. Vérifier que le backend est démarré: `curl http://localhost:3001/api/v1/auth/me`
2. Vérifier les logs: `tail -f bms/api-gateway/mock.log`
3. Utiliser un des comptes de test listés ci-dessus

### Page blanche après connexion
1. Ouvrir la console du navigateur (F12)
2. Vérifier les erreurs réseau
3. Vérifier que le token est stocké: `localStorage.getItem('bms_token')`
4. Se déconnecter et se reconnecter

## ✨ Fonctionnalités Clés

### 🔐 Authentification
- Login sécurisé
- Gestion des sessions
- Redirection selon le rôle

### 📊 Tableaux de Bord
- KPIs en temps réel
- Graphiques interactifs
- Alertes et notifications

### 🔄 Synchronisation
- Données en temps réel
- Mise à jour automatique
- Cache intelligent

### 📱 Responsive
- Compatible mobile
- Interface adaptative
- Navigation intuitive

## 🎨 Technologies

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **UI Components**: Shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React

## 📞 Support

Pour toute question ou problème:
1. Consulter la documentation dans `/docs`
2. Vérifier les logs d'erreur
3. Consulter `CORRECTIONS_EFFECTUEES.md`

---

**Version**: 1.0.0  
**Dernière mise à jour**: Janvier 2025  
**Statut**: ✅ Production Ready
