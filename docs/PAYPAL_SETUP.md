# Configuration PayPal pour Nomah AI

## 1. Créer un compte développeur PayPal

1. Allez sur [PayPal Developer](https://developer.paypal.com/)
2. Connectez-vous ou créez un compte
3. Accédez au Dashboard

## 2. Créer une application

1. Dans le Dashboard, cliquez sur "Create App"
2. Choisissez un nom pour votre app (ex: "Nomah AI")
3. Sélectionnez votre compte business (ou sandbox pour les tests)
4. Sélectionnez les fonctionnalités : **Checkout**

## 3. Récupérer les clés API

### Pour le développement (Sandbox)
```env
PAYPAL_CLIENT_ID="your_sandbox_client_id"
PAYPAL_CLIENT_SECRET="your_sandbox_client_secret"
NEXT_PUBLIC_PAYPAL_CLIENT_ID="your_sandbox_client_id"
PAYPAL_ENVIRONMENT="sandbox"
```

### Pour la production
```env
PAYPAL_CLIENT_ID="your_live_client_id"
PAYPAL_CLIENT_SECRET="your_live_client_secret"
NEXT_PUBLIC_PAYPAL_CLIENT_ID="your_live_client_id"
PAYPAL_ENVIRONMENT="production"
```

## 4. Configuration dans votre .env

Ajoutez ces variables à votre fichier `.env.local` :

```env
# PayPal Configuration
PAYPAL_CLIENT_ID="AQlP8Wz..."
PAYPAL_CLIENT_SECRET="EHx9..."
NEXT_PUBLIC_PAYPAL_CLIENT_ID="AQlP8Wz..."
PAYPAL_ENVIRONMENT="sandbox"
```

## 5. Test avec des comptes sandbox

PayPal fournit des comptes de test :

### Acheteur de test
- Email: sb-buyer@personal.example.com
- Mot de passe: password123

### Vendeur de test  
- Email: sb-seller@business.example.com
- Mot de passe: password123

## 6. Webhooks (Optionnel)

Pour recevoir les notifications PayPal :

1. Dans votre app PayPal, allez dans "Webhooks"
2. Ajoutez l'URL : `https://votre-domaine.com/api/webhooks/paypal`
3. Sélectionnez les événements : "Payment capture completed"

## 7. Fonctionnalités implémentées

✅ Création de commandes PayPal
✅ Capture de paiements
✅ Gestion des erreurs
✅ Interface utilisateur intégrée
✅ Redirection après paiement
✅ Mise à jour du statut de commande

## 8. Flux de paiement

1. L'utilisateur sélectionne PayPal comme mode de paiement
2. Création d'une commande dans votre base de données
3. Redirection vers `/checkout/payment-paypal/[orderId]`
4. Affichage du bouton PayPal
5. Création de l'ordre PayPal via API
6. Redirection vers PayPal pour paiement
7. Retour sur votre site avec confirmation
8. Capture du paiement et mise à jour de la commande

## 9. Sécurité

- ✅ Validation côté serveur
- ✅ Vérification des montants
- ✅ Gestion des erreurs
- ✅ Logs des transactions
- ✅ Protection CSRF via Next.js

## 10. Support

En cas de problème :
- Vérifiez les logs dans la console PayPal Developer
- Consultez la documentation PayPal
- Testez avec les comptes sandbox 