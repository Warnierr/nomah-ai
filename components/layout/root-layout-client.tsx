'use client'

import React from 'react'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { Navbar } from '@/components/layout/navbar'
import { Toaster } from '@/components/ui/toaster'
import { SessionProvider } from '@/components/auth/session-provider'

export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
        </div>
        <Toaster />
      </SessionProvider>
    </ThemeProvider>
  )
} 