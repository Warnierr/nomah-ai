'use client'

import { SignOutButton } from '@/components/auth/sign-out-button'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { SearchBar } from '@/components/layout/search-bar'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShoppingCart, User } from 'lucide-react'
import { usePathname } from "next/navigation"
import { useCart } from '@/store/cart'
import { cn } from "@/lib/utils"

export function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const { itemsCount } = useCart()

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 gap-4">
        <Link href="/" className="font-bold text-xl">
          Nomah AI
        </Link>
        
        <nav className="flex items-center space-x-4 lg:space-x-6">
          <Link
            href="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/" ? "text-black dark:text-white" : "text-muted-foreground"
            )}
          >
            Accueil
          </Link>
          <Link
            href="/products"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/products" ? "text-black dark:text-white" : "text-muted-foreground"
            )}
          >
            Produits
          </Link>
        </nav>

        <div className="flex-1 flex justify-center">
          <SearchBar />
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {itemsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                  {itemsCount}
                </span>
              )}
            </Link>
          </Button>
          {session && (
            <Button variant="ghost" asChild>
              <Link href="/dashboard">
                <User className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
          )}
          <ThemeToggle />
          {session && <SignOutButton />}
        </div>
      </div>
    </div>
  )
} 