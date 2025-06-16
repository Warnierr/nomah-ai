'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'
import { Loader2, Mail, Github } from 'lucide-react'
import { Icons } from '@/components/icons'
import { toast } from '@/components/ui/use-toast'

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false)
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null)
  const [magicLinkEmail, setMagicLinkEmail] = useState('')
  const router = useRouter()

  async function handleCredentialsSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: 'Erreur de connexion',
          description: 'Email ou mot de passe incorrect.',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Connexion réussie',
        description: 'Vous êtes maintenant connecté.',
      })

      router.push('/')
      router.refresh()
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la connexion.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleMagicLinkSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsMagicLinkLoading(true)

    try {
      const result = await signIn('email', {
        email: magicLinkEmail,
        redirect: false,
        callbackUrl: '/',
      })

      if (result?.error) {
        toast({
          title: 'Erreur',
          description: 'Impossible d\'envoyer le lien de connexion.',
          variant: 'destructive',
        })
        return
      }

      // Redirect to verify request page
      router.push(`/auth/verify-request?email=${encodeURIComponent(magicLinkEmail)}`)
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'envoi du lien.',
        variant: 'destructive',
      })
    } finally {
      setIsMagicLinkLoading(false)
    }
  }

  async function handleOAuthSignIn(provider: string) {
    setIsOAuthLoading(provider)
    try {
      await signIn(provider, { callbackUrl: '/' })
    } catch (error) {
      toast({
        title: 'Erreur',
        description: `Impossible de se connecter avec ${provider}.`,
        variant: 'destructive',
      })
    } finally {
      setIsOAuthLoading(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 p-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Connexion</h1>
        <p className="text-muted-foreground">
          Choisissez votre méthode de connexion préférée
        </p>
      </div>

      {/* Magic Link Section */}
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-lg font-semibold flex items-center justify-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Connexion par email
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Recevez un lien de connexion sécurisé par email
          </p>
        </div>
        
        <form onSubmit={handleMagicLinkSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="magic-email">Adresse email</Label>
            <Input
              id="magic-email"
              type="email"
              placeholder="votre@email.com"
              value={magicLinkEmail}
              onChange={(e) => setMagicLinkEmail(e.target.value)}
              required
              disabled={isMagicLinkLoading}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isMagicLinkLoading || !magicLinkEmail}
          >
            {isMagicLinkLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Envoyer le lien de connexion
              </>
            )}
          </Button>
        </form>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Ou continuer avec
          </span>
        </div>
      </div>

      {/* OAuth Providers */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={() => handleOAuthSignIn('google')}
          disabled={isOAuthLoading === 'google'}
        >
          {isOAuthLoading === 'google' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.google className="mr-2 h-4 w-4" />
          )}
          Google
        </Button>
        <Button
          variant="outline"
          onClick={() => handleOAuthSignIn('github')}
          disabled={isOAuthLoading === 'github'}
        >
          {isOAuthLoading === 'github' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Github className="mr-2 h-4 w-4" />
          )}
          GitHub
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Ou avec mot de passe
          </span>
        </div>
      </div>

      {/* Traditional Login */}
      <form onSubmit={handleCredentialsSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            placeholder="votre@email.com"
            required
            type="email"
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            name="password"
            placeholder="Votre mot de passe"
            required
            type="password"
            disabled={isLoading}
          />
        </div>
        <Button className="w-full" type="submit" disabled={isLoading} variant="outline">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connexion...
            </>
          ) : (
            'Se connecter avec mot de passe'
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          Pas encore de compte ?{' '}
          <a href="/auth/signup" className="underline hover:text-primary">
            Créer un compte
          </a>
        </p>
      </div>
    </div>
  )
} 