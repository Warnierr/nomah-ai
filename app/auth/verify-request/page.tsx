'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'

export default function VerifyRequest() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Mail className="h-12 w-12 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Vérifiez votre email
          </h1>
          <p className="text-sm text-muted-foreground">
            Un lien de connexion a été envoyé à{' '}
            <span className="font-medium text-primary">{email}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Cliquez sur le lien dans l'email pour vous connecter à votre compte.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/auth/signin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la connexion
          </Link>
        </Button>
      </div>
    </div>
  )
} 