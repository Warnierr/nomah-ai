'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-red-500">
            Authentication Error
          </h1>
          <p className="text-sm text-muted-foreground">
            {error === 'Configuration' && (
              'There is a problem with the server configuration.'
            )}
            {error === 'AccessDenied' && (
              'You do not have permission to sign in.'
            )}
            {error === 'Verification' && (
              'The sign in link is no longer valid.'
            )}
            {!error && 'An unknown error occurred.'}
          </p>
        </div>
        <Button asChild>
          <Link href="/auth/signin">
            Try Again
          </Link>
        </Button>
      </div>
    </div>
  )
} 