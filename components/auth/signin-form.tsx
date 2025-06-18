'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Mail, Github } from 'lucide-react'
import { Icons } from '@/components/icons'
import { toast } from '@/components/ui/use-toast'
import Link from 'next/link'

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false)
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null)
  const [magicLinkEmail, setMagicLinkEmail] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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
        callbackUrl,
      })

      if (result?.error) {
        toast({
          title: 'Erreur',
          description: 'Email ou mot de passe incorrect',
          variant: 'destructive',
        })
        return
      }

      router.push(callbackUrl)
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue. Veuillez réessayer.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleMagicLinkSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsMagicLinkLoading(true)

    try {
      const result = await signIn('email', {
        email: magicLinkEmail,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        toast({
          title: 'Erreur',
          description: 'Impossible d\'envoyer le lien de connexion',
          variant: 'destructive',
        })
        return
      }

      router.push(`/auth/verify-request?email=${encodeURIComponent(magicLinkEmail)}`)
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue. Veuillez réessayer.',
        variant: 'destructive',
      })
    } finally {
      setIsMagicLinkLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 p-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Connexion</h1>
        <p className="text-muted-foreground">
          Connectez-vous à votre compte pour continuer
        </p>
      </div>

      <div className="space-y-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setIsOAuthLoading('github')
            signIn('github', { callbackUrl })
          }}
          disabled={isOAuthLoading === 'github'}
        >
          {isOAuthLoading === 'github' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Github className="mr-2 h-4 w-4" />
          )}
          Continuer avec GitHub
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Ou continuez avec
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="votre@email.com"
              required
              disabled={isLoading}
              autoComplete="username"
              aria-label="Adresse email"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mot de passe</Label>
              <Button variant="link" asChild className="px-0 text-sm">
                <Link href="/auth/forgot-password">
                  Mot de passe oublié ?
                </Link>
              </Button>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              disabled={isLoading}
              autoComplete="current-password"
              aria-label="Mot de passe"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connexion en cours...
              </>
            ) : (
              'Se connecter'
            )}
          </Button>
        </form>

        <Separator />

        <form onSubmit={handleMagicLinkSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label>Connexion sans mot de passe</Label>
            <Input
              type="email"
              placeholder="votre@email.com"
              value={magicLinkEmail}
              onChange={(e) => setMagicLinkEmail(e.target.value)}
              disabled={isMagicLinkLoading}
            />
          </div>

          <Button
            type="submit"
            variant="secondary"
            className="w-full"
            disabled={isMagicLinkLoading || !magicLinkEmail}
          >
            {isMagicLinkLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi du lien...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Recevoir un lien de connexion
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Pas encore de compte ?{' '}
          <Button variant="link" asChild className="px-0">
            <Link href="/auth/signup">Créer un compte</Link>
          </Button>
        </p>
      </div>
    </div>
  )
} 