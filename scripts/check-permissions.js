/**
 * Script de diagnostic des permissions
 * À exécuter dans la console du navigateur (F12)
 */

console.log('🔍 Diagnostic des Permissions Expert-Comptable\n');

// 1. Vérifier le token
const token = localStorage.getItem('bms_token') || localStorage.getItem('token');

if (!token) {
  console.error('❌ Aucun token trouvé. Veuillez vous connecter.');
} else {
  console.log('✅ Token trouvé');
  
  try {
    // Décoder le payload du JWT
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    console.log('\n📋 Informations du Token:');
    console.log('  Email:', payload.email);
    console.log('  Role:', payload.role);
    console.log('  User ID:', payload.sub);
    
    // Vérifier si les rôles RBAC sont présents
    if (payload.roles && Array.isArray(payload.roles)) {
      console.log('  ✅ Rôles RBAC présents:', payload.roles.length);
      
      // Afficher les permissions
      const allPermissions = new Set();
      payload.roles.forEach(role => {
        if (role.permissions) {
          role.permissions.forEach(perm => {
            allPermissions.add(`${perm.resource}:${perm.action}`);
          });
        }
      });
      
      console.log('\n🔐 Permissions disponibles:');
      Array.from(allPermissions).sort().forEach(perm => {
        console.log('  -', perm);
      });
      
      // Vérifier les permissions bancaires spécifiques
      const hasBankRead = allPermissions.has('bank-accounts:read');
      const hasBankReconcile = allPermissions.has('bank-accounts:reconcile');
      const hasTreasury = allPermissions.has('treasury:read');
      const hasTax = allPermissions.has('tax:read');
      
      console.log('\n✅ Permissions Critiques:');
      console.log('  bank-accounts:read:', hasBankRead ? '✅' : '❌');
      console.log('  bank-accounts:reconcile:', hasBankReconcile ? '✅' : '❌');
      console.log('  treasury:read:', hasTreasury ? '✅' : '❌');
      console.log('  tax:read:', hasTax ? '✅' : '❌');
      
      if (!hasBankReconcile) {
        console.error('\n❌ PROBLÈME: Permission bank-accounts:reconcile manquante!');
        console.log('   Solution: Le seed doit être exécuté sur le serveur');
      }
      
    } else {
      console.error('\n❌ PROBLÈME: Rôles RBAC absents du token!');
      console.log('   Cause: Le backend n\'a pas été redéployé avec la nouvelle JWT Strategy');
      console.log('   Solution: Attendre le redéploiement et se reconnecter');
    }
    
    // Vérifier l'expiration
    const exp = new Date(payload.exp * 1000);
    const now = new Date();
    console.log('\n⏰ Expiration du token:', exp.toLocaleString());
    if (exp < now) {
      console.error('   ❌ Token expiré! Reconnectez-vous.');
    } else {
      console.log('   ✅ Token valide');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du décodage du token:', error);
  }
}

// 2. Vérifier les données utilisateur
const userData = localStorage.getItem('user_data');
if (userData) {
  try {
    const user = JSON.parse(userData);
    console.log('\n👤 Données Utilisateur:');
    console.log('  Email:', user.email);
    console.log('  Role:', user.role);
  } catch (e) {
    console.log('\n⚠️  Données utilisateur non parsables');
  }
}

// 3. Tester un appel API
console.log('\n🌐 Test d\'appel API...');
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://bms-production-d9e9.up.railway.app';
const companyId = localStorage.getItem('companyId') || 'default-company';

fetch(`${apiUrl}/api/v1/banking/transactions?companyId=${companyId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  }
})
.then(response => {
  console.log('  Status:', response.status);
  if (response.status === 403) {
    console.error('  ❌ 403 Forbidden - Permissions insuffisantes');
    console.log('  → Le backend bloque l\'accès');
  } else if (response.status === 401) {
    console.error('  ❌ 401 Unauthorized - Token invalide');
    console.log('  → Reconnectez-vous');
  } else if (response.status === 200) {
    console.log('  ✅ Accès autorisé!');
  }
  return response.json();
})
.then(data => {
  console.log('  Données reçues:', Array.isArray(data) ? `${data.length} transactions` : data);
})
.catch(error => {
  console.error('  ❌ Erreur:', error.message);
});

console.log('\n📝 Résumé:');
console.log('Si vous voyez "Rôles RBAC absents", le backend doit être redéployé.');
console.log('Si vous voyez "Permission manquante", le seed doit être exécuté.');
console.log('Après correction, déconnectez-vous et reconnectez-vous.');
