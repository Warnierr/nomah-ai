# Variables d'environnement

Ce fichier liste toutes les variables d'environnement nécessaires pour faire fonctionner l'application Nomah AI.

## Base de données

```env
DATABASE_URL="postgresql://username:password@localhost:5432/nomah_ai"
```

## NextAuth.js (Authentification)

```env
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

## Providers OAuth

### Google
```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### GitHub
```env
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

## Stripe (Paiements)

```env
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"
```

## Resend (Service d'emails)

```env
RESEND_API_KEY="re_your-resend-api-key"
EMAIL_FROM="Nomah AI <noreply@yourdomain.com>"
EMAIL_REPLY_TO="support@yourdomain.com"
```

## Configuration de l'application

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Uploadthing (Upload de fichiers)

```env
UPLOADTHING_SECRET="sk_live_your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"
```

## Instructions de configuration

1. Copiez ces variables dans votre fichier `.env.local`
2. Remplacez les valeurs par vos vraies clés API
3. Pour le développement local, utilisez les clés de test
4. Pour la production, utilisez les clés de production

## Obtenir les clés API

### Resend
1. Créez un compte sur [resend.com](https://resend.com)
2. Générez une clé API dans le dashboard
3. Configurez votre domaine pour l'envoi d'emails

### Stripe
1. Créez un compte sur [stripe.com](https://stripe.com)
2. Récupérez vos clés API dans le dashboard
3. Utilisez les clés de test pour le développement

### Uploadthing
1. Créez un compte sur [uploadthing.com](https://uploadthing.com)
2. Créez une nouvelle application
3. Récupérez vos clés API

### OAuth Providers
- **Google**: [Google Cloud Console](https://console.cloud.google.com)
- **GitHub**: [GitHub Developer Settings](https://github.com/settings/developers) 