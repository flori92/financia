#!/usr/bin/env node

/**
 * Test de la page Projects
 * Vérifie que la page se charge et affiche le contenu correct
 */

const https = require('https');

function testPage(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          content: data,
          has404: data.includes('404: This page could not be found'),
          hasProjects: data.includes('Projets'),
          hasLoading: data.includes('Chargement'),
          hasKPI: data.includes('Total Projets')
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function runTest() {
  console.log('🔍 Test de la page Projects...\n');
  
  try {
    const result = await testPage('https://bms-frontend-production.up.railway.app/projects');
    
    console.log(`Status Code: ${result.statusCode}`);
    console.log(`Contenu "404": ${result.has404 ? '❌ Présent' : '✅ Absent'}`);
    console.log(`Contenu "Projets": ${result.hasProjects ? '✅ Présent' : '❌ Absent'}`);
    console.log(`Contenu "Chargement": ${result.hasLoading ? '✅ Présent' : '❌ Absent'}`);
    console.log(`Contenu "Total Projets": ${result.hasKPI ? '✅ Présent' : '❌ Absent'}`);
    
    if (result.hasProjects && !result.has404) {
      console.log('\n🎉 SUCCÈS: La page Projects fonctionne correctement !');
    } else if (result.has404) {
      console.log('\n⚠️  ATTENTION: La page affiche encore 404 - Déploiement en cours ?');
    } else {
      console.log('\n❌ ERREUR: La page a un problème');
    }
    
  } catch (error) {
    console.error('❌ Erreur de test:', error.message);
  }
}

runTest();
