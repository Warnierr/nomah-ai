'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function VerifyRequestPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Vérifiez votre email</CardTitle>
            <CardDescription>
              Un lien de connexion a été envoyé à votre adresse email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {email && (
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <p className="text-sm font-medium">Email envoyé à :</p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground font-mono">
                  {email}
                </p>
              </div>
            )}
            
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start space-x-2">
                <span className="font-bold text-primary">1.</span>
                <p>Consultez votre boîte de réception (et vos spams)</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-bold text-primary">2.</span>
                <p>Cliquez sur le lien "Se connecter maintenant"</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-bold text-primary">3.</span>
                <p>Vous serez automatiquement connecté</p>
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-800">
                <strong>💡 Astuce :</strong> Le lien expire dans 24 heures et ne fonctionne qu'une seule fois pour votre sécurité.
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/auth/signin">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à la connexion
                </Link>
              </Button>
              
              <p className="text-center text-xs text-muted-foreground">
                Vous n'avez pas reçu l'email ? Vérifiez vos spams ou{' '}
                <Link href="/auth/signin" className="underline hover:text-primary">
                  réessayez
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 