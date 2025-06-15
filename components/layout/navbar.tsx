'use client'

import { SignOutButton } from '@/components/auth/sign-out-button'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { User } from 'lucide-react'

export function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <div className="flex items-center space-x-4">
          <Link href="/" className="font-bold">
            Nomah AI
          </Link>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          {session && (
            <Button variant="ghost" asChild>
              <Link href="/profile">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </Button>
          )}
          <ThemeToggle />
          {session && <SignOutButton />}
        </div>
      </div>
    </nav>
  )
} 