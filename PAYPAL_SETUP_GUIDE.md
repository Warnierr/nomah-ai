# Guide de Configuration PayPal pour Nomah AI

## 🚀 Configuration Rapide

### Étape 1 : Créer un compte PayPal Developer

1. **Allez sur** : https://developer.paypal.com/
2. **Connectez-vous** avec votre compte PayPal ou créez-en un nouveau
3. **Vérifiez votre email** si nécessaire

### Étape 2 : Créer une Application Sandbox

1. **Dans le Dashboard**, cliquez sur **"Apps & Credentials"**
2. **Sélectionnez l'onglet "Sandbox"** (pas "Live")
3. **Cliquez sur "Create App"**
4. **Remplissez** :
   - **App Name** : `Nomah AI Sandbox`
   - **Merchant** : Sélectionnez votre compte business sandbox
   - **Features** : Cochez "Accept payments"
5. **Cliquez sur "Create App"**

### Étape 3 : Récupérer vos Clés API

Une fois l'application créée, vous verrez :
- **Client ID** : Une longue chaîne commençant par `A...`
- **Client Secret** : Cliquez sur "Show" pour le révéler

### Étape 4 : Configurer les Variables d'Environnement

**Ouvrez le fichier `.env.local`** dans la racine du projet et remplacez :

```bash
# Remplacez ces valeurs par vos vraies clés PayPal
PAYPAL_CLIENT_ID="VOTRE_CLIENT_ID_ICI"
PAYPAL_CLIENT_SECRET="VOTRE_CLIENT_SECRET_ICI"
NEXT_PUBLIC_PAYPAL_CLIENT_ID="VOTRE_CLIENT_ID_ICI"
```

**Par vos vraies clés** :

```bash
# Vos vraies clés PayPal Sandbox
PAYPAL_CLIENT_ID="AeA1QIZXiflr1_-7Zo_qzjD8RedWNqd8F_mpwMo6hkxaJzHzIGHVmHrQbQkB8VLPGjkDx8rUXFQhgoUn"
PAYPAL_CLIENT_SECRET="EL1tVxAjhT7cJimnz7VQ0z9k2_W0W6tOWqVzqgMrx9PlpoeqmVVdw-dQQr_zQQQQQQQQQQQQQQQQ"
NEXT_PUBLIC_PAYPAL_CLIENT_ID="AeA1QIZXiflr1_-7Zo_qzjD8RedWNqd8F_mpwMo6hkxaJzHzIGHVmHrQbQkB8VLPGjkDx8rUXFQhgoUn"
```

### Étape 5 : Redémarrer le Serveur

```bash
# Arrêtez le serveur (Ctrl+C) puis relancez
npm run dev
```

## 🧪 Tester le Paiement PayPal

### Comptes de Test Sandbox

PayPal crée automatiquement des comptes de test :

1. **Compte Business** (Marchand) : `pp.merch01-facilitator@example.com`
2. **Compte Personal** (Acheteur) : `pp.merch01-buyer@example.com`

### Processus de Test

1. **Ajoutez des produits** au panier sur votre site
2. **Allez au checkout** et sélectionnez PayPal
3. **Connectez-vous** avec le compte buyer sandbox
4. **Confirmez le paiement**
5. **Vérifiez** que la commande est créée

### Vérifier les Transactions

- **Site Sandbox** : https://www.sandbox.paypal.com/
- **Connectez-vous** avec vos comptes sandbox pour voir les transactions

## 🔧 Dépannage

### Erreur "Client ID not found"
- Vérifiez que `NEXT_PUBLIC_PAYPAL_CLIENT_ID` est bien défini
- Redémarrez le serveur après modification du `.env.local`

### Erreur "Access Token"
- Vérifiez `PAYPAL_CLIENT_SECRET`
- Assurez-vous que l'environnement est sur "sandbox"

### Erreur de Contrainte de Clé Étrangère
- ✅ **Déjà corrigé** : Le code crée maintenant un utilisateur invité automatiquement

## 📋 Checklist de Vérification

- [ ] Compte PayPal Developer créé
- [ ] Application Sandbox créée
- [ ] Client ID et Client Secret récupérés
- [ ] Fichier `.env.local` mis à jour
- [ ] Serveur redémarré
- [ ] Test de paiement effectué

## 🚀 Passer en Production

Quand vous serez prêt pour la production :

1. **Créez une app "Live"** dans le Dashboard PayPal
2. **Remplacez** `PAYPAL_ENVIRONMENT="sandbox"` par `"production"`
3. **Utilisez les clés Live** au lieu des clés Sandbox
4. **Testez** avec de vrais comptes PayPal

## 📞 Support

Si vous rencontrez des problèmes :
- **Documentation PayPal** : https://developer.paypal.com/docs/
- **Support PayPal** : https://developer.paypal.com/support/
- **Communauté** : https://community.paypal.com/ 