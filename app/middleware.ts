import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Vérifier si l'utilisateur est authentifié en regardant le cookie de session
  const authCookie = request.cookies.get('next-auth.session-token')?.value
  
  // Si l'utilisateur n'est pas authentifié et essaie d'accéder à une route protégée
  if (!authCookie && !request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Si l'utilisateur est authentifié et essaie d'accéder aux pages d'auth
  if (authCookie && request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 