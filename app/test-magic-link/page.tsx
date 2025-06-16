import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Mail, Shield, Zap } from 'lucide-react'

export default function TestMagicLinkPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">🔗 Magic Link Authentication</h1>
          <p className="text-xl text-muted-foreground">
            Test de l'authentification par lien magique
          </p>
          <Badge variant="secondary" className="text-sm">
            ✅ Implémentation terminée
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Fonctionnalités ajoutées
              </CardTitle>
              <CardDescription>
                Nouvelles capacités d'authentification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Provider Email NextAuth configuré</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Fonction sendMagicLinkEmail créée</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Page de vérification d'email</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Formulaire de connexion mis à jour</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Support OAuth (Google, GitHub)</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Sécurité
              </CardTitle>
              <CardDescription>
                Mesures de sécurité implémentées
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Liens à usage unique</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Expiration automatique (24h)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Validation email côté serveur</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Protection CSRF intégrée</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Comment tester
            </CardTitle>
            <CardDescription>
              Étapes pour tester l'authentification Magic Link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">1</Badge>
                <div>
                  <p className="font-medium">Configurer les variables d'environnement</p>
                  <p className="text-sm text-muted-foreground">
                    Copiez .env.example vers .env et configurez RESEND_API_KEY
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">2</Badge>
                <div>
                  <p className="font-medium">Aller à la page de connexion</p>
                  <p className="text-sm text-muted-foreground">
                    Visitez /auth/signin pour voir le nouveau formulaire
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">3</Badge>
                <div>
                  <p className="font-medium">Tester Magic Link</p>
                  <p className="text-sm text-muted-foreground">
                    Entrez votre email et cliquez sur "Envoyer le lien de connexion"
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">4</Badge>
                <div>
                  <p className="font-medium">Vérifier l'email</p>
                  <p className="text-sm text-muted-foreground">
                    Consultez votre boîte mail pour le lien de connexion sécurisé
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800">⚠️ Configuration requise</CardTitle>
          </CardHeader>
          <CardContent className="text-amber-700">
            <p className="text-sm">
              Pour que Magic Link fonctionne, vous devez configurer votre clé API Resend dans le fichier .env :
            </p>
            <div className="mt-2 p-2 bg-amber-100 rounded font-mono text-xs">
              RESEND_API_KEY="re_your_actual_resend_api_key"<br/>
              EMAIL_FROM="Nomah AI &lt;noreply@yourdomain.com&gt;"
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 