# Nomah AI - Plateforme E-commerce Moderne

Une plateforme e-commerce complète construite avec Next.js 14, TypeScript, Prisma, et une stack moderne.

## 🚀 Fonctionnalités

### 🛍️ Côté Client
- **Catalogue de produits** avec navigation par catégories
- **Recherche avancée** avec filtres, tri et suggestions
- **Panier d'achat** persistant avec gestion des quantités
- **Processus de commande** complet avec paiement Stripe
- **Authentification** (Email/Password, Google, GitHub)
- **Profil utilisateur** avec gestion des adresses
- **Historique des commandes** et suivi
- **Liste de souhaits** pour sauvegarder les produits
- **Système d'avis** et de notation
- **Design responsive** et moderne

### 🔧 Administration
- **Dashboard complet** avec statistiques en temps réel
- **Gestion des produits** (CRUD, upload d'images)
- **Gestion des commandes** avec mise à jour de statut
- **Système de remboursement** intégré
- **Gestion des utilisateurs** et des rôles
- **Analytics avancés** avec graphiques (Recharts)
- **Notifications en temps réel** pour les événements importants
- **Système de cache** pour optimiser les performances

### 📧 Communication
- **Emails automatiques** (confirmations, expéditions)
- **Notifications push** pour les admins
- **Système de notifications** intégré

## 🛠️ Technologies

### Frontend
- **Next.js 14** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **Shadcn UI** - Composants UI modernes
- **Lucide Icons** - Icônes SVG
- **Recharts** - Graphiques et analytics

### Backend
- **Next.js API Routes** - API REST
- **Prisma ORM** - Base de données
- **PostgreSQL** - Base de données relationnelle
- **NextAuth.js** - Authentification
- **Stripe** - Paiements en ligne
- **Resend** - Service d'emails
- **Uploadthing** - Upload de fichiers

### État et Validation
- **Zustand** - Gestion d'état
- **Zod** - Validation de schémas
- **React Hook Form** - Gestion des formulaires

## 📦 Installation

### Prérequis
- Node.js 18+ 
- PostgreSQL
- Comptes pour les services externes (Stripe, Resend, etc.)

### 1. Cloner le projet
```bash
git clone https://github.com/votre-username/nomah-ai.git
cd nomah-ai
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration de l'environnement
Créez un fichier `.env` à la racine :

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/nomah-ai"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OAuth Providers
GITHUB_ID="your_github_client_id"
GITHUB_SECRET="your_github_client_secret"
GOOGLE_ID="your_google_client_id"
GOOGLE_SECRET="your_google_client_secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key"

# Resend (Emails)
RESEND_API_KEY="your_resend_api_key"

# Uploadthing (File uploads)
UPLOADTHING_SECRET="your_uploadthing_secret"
UPLOADTHING_APP_ID="your_uploadthing_app_id"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Configuration de la base de données
```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma db push

# (Optionnel) Seed avec des données de test
npx prisma db seed
```

### 5. Lancer le serveur de développement
```bash
npm run dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000)

## 🏗️ Structure du projet

```
nomah-ai/
├── app/                    # Pages et routes Next.js
│   ├── admin/             # Interface d'administration
│   ├── api/               # Routes API
│   ├── auth/              # Pages d'authentification
│   ├── products/          # Pages produits
│   ├── profile/           # Profil utilisateur
│   └── search/            # Page de recherche
├── components/            # Composants réutilisables
│   ├── admin/             # Composants admin
│   ├── layout/            # Composants de mise en page
│   └── ui/                # Composants UI de base
├── lib/                   # Utilitaires et logique métier
│   ├── auth.ts            # Configuration NextAuth
│   ├── cache.ts           # Système de cache
│   ├── prisma.ts          # Client Prisma
│   ├── search.ts          # Logique de recherche
│   └── stripe.ts          # Configuration Stripe
├── prisma/                # Schéma et migrations
├── public/                # Assets statiques
└── stores/                # Stores Zustand
```

## 🎯 Utilisation

### Compte Administrateur
1. Créez un compte utilisateur normal
2. Modifiez le rôle en base de données :
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'votre-email@example.com';
```
3. Accédez à `/admin` pour l'interface d'administration

### Fonctionnalités principales

#### Gestion des produits
- Ajout/modification/suppression de produits
- Upload d'images via Uploadthing
- Gestion des catégories et du stock
- Mise en avant de produits

#### Gestion des commandes
- Suivi des commandes en temps réel
- Mise à jour des statuts
- Traitement des remboursements
- Notifications automatiques

#### Analytics
- Graphiques de ventes et revenus
- Analyse par catégories
- Produits les plus vendus
- Métriques de performance

## 🔧 Scripts disponibles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Démarrer en production
npm start

# Linting
npm run lint

# Formatage du code
npm run format

# Base de données
npx prisma studio          # Interface graphique
npx prisma db push         # Appliquer le schéma
npx prisma generate        # Générer le client
```

## 🚀 Déploiement

### Vercel (Recommandé)
1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement
3. Déployez automatiquement

### Variables d'environnement de production
Assurez-vous de configurer toutes les variables d'environnement en production, notamment :
- `DATABASE_URL` (PostgreSQL en production)
- `NEXTAUTH_SECRET` (générez une clé sécurisée)
- Clés API des services externes

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests d'intégration
npm run test:integration

# Tests E2E
npm run test:e2e
```

## 📈 Performance

### Optimisations implémentées
- **Cache en mémoire** pour les requêtes fréquentes
- **Optimisation d'images** avec Next.js Image
- **Lazy loading** des composants
- **Pagination** des listes
- **Compression** des assets

### Métriques
- **Lighthouse Score** : 90+
- **First Contentful Paint** : < 1.5s
- **Time to Interactive** : < 3s

## 🔒 Sécurité

- **Authentification** sécurisée avec NextAuth.js
- **Validation** des données avec Zod
- **Protection CSRF** intégrée
- **Sanitisation** des entrées utilisateur
- **Gestion des rôles** et permissions

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Changelog

### v1.0.0 (2024)
- ✅ Système d'authentification complet
- ✅ Catalogue de produits avec recherche
- ✅ Panier et processus de commande
- ✅ Interface d'administration
- ✅ Analytics et reporting
- ✅ Notifications en temps réel
- ✅ Optimisations de performance

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🆘 Support

Pour obtenir de l'aide :
1. Consultez la [documentation](docs/)
2. Ouvrez une [issue](https://github.com/votre-username/nomah-ai/issues)
3. Contactez l'équipe de développement

## 🙏 Remerciements

- [Next.js](https://nextjs.org/) pour le framework
- [Shadcn UI](https://ui.shadcn.com/) pour les composants
- [Prisma](https://prisma.io/) pour l'ORM
- [Stripe](https://stripe.com/) pour les paiements
- La communauté open source

---

Développé avec ❤️ par l'équipe Nomah AI
