'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-red-500">
                Something went wrong!
              </h1>
              <p className="text-sm text-muted-foreground">
                {error.message || 'An unexpected error occurred.'}
              </p>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => reset()} className="flex-1">
                Try again
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/">
                  Return Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
} 