'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'
import { Loader2, Mail, Github } from 'lucide-react'
import { signUpAction } from '@/lib/actions'
import { toast } from '@/components/ui/use-toast'
import Link from 'next/link'

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const result = await signUpAction(formData)

      if (result.error) {
        if (result.details) {
          // Afficher les erreurs de validation
          Object.entries(result.details).forEach(([field, errors]) => {
            if (Array.isArray(errors)) {
              errors.forEach(error => {
                toast({
                  title: `Erreur dans le champ ${field}`,
                  description: error,
                  variant: 'destructive',
                })
              })
            }
          })
        } else {
          // Afficher l'erreur générale
          toast({
            title: 'Erreur lors de l\'inscription',
            description: result.error,
            variant: 'destructive',
          })
        }
        return
      }

      // Inscription réussie, connecter l'utilisateur
      const signInResult = await signIn('credentials', {
        email: formData.get('email'),
        password: formData.get('password'),
        redirect: false,
      })

      if (signInResult?.error) {
        toast({
          title: 'Erreur de connexion',
          description: 'Impossible de vous connecter automatiquement. Veuillez réessayer.',
          variant: 'destructive',
        })
        router.push('/auth/signin')
        return
      }

      toast({
        title: 'Compte créé avec succès',
        description: 'Vous êtes maintenant connecté.',
      })
      router.push('/')
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error)
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue. Veuillez réessayer.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleOAuthSignIn(provider: string) {
    try {
      setIsOAuthLoading(provider)
      await signIn(provider, { callbackUrl: '/' })
    } catch (error) {
      console.error('Erreur de connexion OAuth:', error)
      toast({
        title: 'Erreur de connexion',
        description: 'Impossible de vous connecter avec ce service. Veuillez réessayer.',
        variant: 'destructive',
      })
      setIsOAuthLoading(null)
    }
  }

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Créer un compte
        </h1>
        <p className="text-sm text-muted-foreground">
          Entrez vos informations ci-dessous pour créer votre compte
        </p>
      </div>

      <div className="grid gap-6">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                type="text"
                autoCapitalize="none"
                autoComplete="name"
                autoCorrect="off"
                disabled={isLoading}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoCapitalize="none"
                autoComplete="new-password"
                disabled={isLoading}
                required
              />
            </div>
            <Button disabled={isLoading}>
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              S'inscrire
            </Button>
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Ou continuer avec
            </span>
          </div>
        </div>

        <div className="grid gap-2">
          <Button
            variant="outline"
            type="button"
            disabled={isOAuthLoading !== null}
            onClick={() => handleOAuthSignIn('github')}
          >
            {isOAuthLoading === 'github' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Github className="mr-2 h-4 w-4" />
            )}
            GitHub
          </Button>
          <Button
            variant="outline"
            type="button"
            disabled={isOAuthLoading !== null}
            onClick={() => handleOAuthSignIn('email')}
          >
            {isOAuthLoading === 'email' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            Email Magic Link
          </Button>
        </div>
      </div>

      <p className="px-8 text-center text-sm text-muted-foreground">
        Déjà un compte ?{' '}
        <Link
          href="/auth/signin"
          className="underline underline-offset-4 hover:text-primary"
        >
          Se connecter
        </Link>
      </p>
    </div>
  )
} 