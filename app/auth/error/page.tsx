'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'Il y a un problème avec la configuration du serveur.'
      case 'AccessDenied':
        return 'Vous n\'avez pas la permission de vous connecter.'
      case 'Verification':
        return 'Le lien de connexion n\'est plus valide.'
      case 'OAuthSignin':
        return 'Erreur lors de la connexion avec le fournisseur d\'authentification.'
      case 'OAuthCallback':
        return 'Erreur lors de la réponse du fournisseur d\'authentification.'
      case 'EmailSignin':
        return 'Erreur lors de l\'envoi du lien de connexion par email.'
      case 'CredentialsSignin':
        return 'Les identifiants de connexion sont incorrects.'
      default:
        return 'Une erreur inconnue est survenue.'
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col items-center space-y-2 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h1 className="text-2xl font-semibold tracking-tight text-destructive">
            Erreur d'authentification
          </h1>
          <p className="text-sm text-muted-foreground">
            {getErrorMessage(error)}
          </p>
        </div>
        <Button asChild>
          <Link href="/auth/signin">
            Réessayer
          </Link>
        </Button>
      </div>
    </div>
  )
} 