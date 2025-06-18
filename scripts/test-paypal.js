#!/usr/bin/env node

/**
 * Script de test pour vérifier la configuration PayPal
 * Usage: node scripts/test-paypal.js
 */

const fs = require('fs');
const https = require('https');

// Charger les variables d'environnement depuis .env.local
function loadEnvFile() {
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          envVars[key] = value;
        }
      }
    });
    
    return envVars;
  } catch (error) {
    return {};
  }
}

const envVars = loadEnvFile();

// Configuration PayPal
const config = {
  clientId: envVars.PAYPAL_CLIENT_ID,
  clientSecret: envVars.PAYPAL_CLIENT_SECRET,
  environment: envVars.PAYPAL_ENVIRONMENT || 'sandbox'
};

console.log('🔍 Test de Configuration PayPal\n');

// Vérifier les variables d'environnement
console.log('📋 Vérification des variables d\'environnement:');
console.log(`   PAYPAL_CLIENT_ID: ${config.clientId ? '✅ Défini' : '❌ Manquant'}`);
console.log(`   PAYPAL_CLIENT_SECRET: ${config.clientSecret ? '✅ Défini' : '❌ Manquant'}`);
console.log(`   PAYPAL_ENVIRONMENT: ${config.environment}`);
console.log(`   NEXT_PUBLIC_PAYPAL_CLIENT_ID: ${envVars.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? '✅ Défini' : '❌ Manquant'}\n`);

if (!config.clientId || !config.clientSecret) {
  console.log('❌ Configuration incomplète. Veuillez configurer vos clés PayPal dans .env.local');
  process.exit(1);
}

// Test de connexion à l'API PayPal
async function testPayPalConnection() {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
    const hostname = config.environment === 'sandbox' ? 'api-m.sandbox.paypal.com' : 'api-m.paypal.com';
    
    const postData = 'grant_type=client_credentials';
    
    const options = {
      hostname,
      port: 443,
      path: '/v1/oauth2/token',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200 && response.access_token) {
            resolve({
              success: true,
              token: response.access_token,
              expiresIn: response.expires_in
            });
          } else {
            resolve({
              success: false,
              error: response.error_description || response.error || 'Erreur inconnue',
              statusCode: res.statusCode
            });
          }
        } catch (error) {
          resolve({
            success: false,
            error: 'Réponse JSON invalide',
            rawResponse: data
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    });

    req.write(postData);
    req.end();
  });
}

// Exécuter le test
async function runTest() {
  console.log('🔄 Test de connexion à l\'API PayPal...');
  
  const result = await testPayPalConnection();
  
  if (result.success) {
    console.log('✅ Connexion PayPal réussie !');
    console.log(`   Token d'accès reçu (expire dans ${result.expiresIn}s)`);
    console.log(`   Environnement: ${config.environment}`);
    console.log('\n🎉 Configuration PayPal valide ! Vous pouvez maintenant tester les paiements.');
  } else {
    console.log('❌ Échec de la connexion PayPal');
    console.log(`   Erreur: ${result.error}`);
    if (result.statusCode) {
      console.log(`   Code de statut: ${result.statusCode}`);
    }
    console.log('\n🔧 Vérifiez vos clés PayPal dans .env.local');
  }
}

runTest().catch(console.error); 