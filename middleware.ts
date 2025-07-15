import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Vérifier l'authentification pour les routes protégées
  if (pathname.startsWith('/admin/') || pathname === '/profil') {
    const sessionToken = request.cookies.get('studio_session')?.value

    if (!sessionToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Vérifier la session via une API call au lieu d'utiliser Prisma directement
    try {
      const sessionResponse = await fetch(`${request.nextUrl.origin}/api/auth/verify-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: sessionToken }),
      })

      if (!sessionResponse.ok) {
        // Session invalide, supprimer le cookie et rediriger
        const response = NextResponse.redirect(new URL('/login', request.url))
        response.cookies.set('studio_session', '', {
          httpOnly: true,
          path: '/',
          expires: new Date(0),
          sameSite: 'lax',
        })
        return response
      }

      const sessionData = await sessionResponse.json()
      
      // Vérifier les permissions pour les routes admin
      if (pathname.startsWith('/admin/') && sessionData.user.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }

    } catch (error) {
      console.error('Erreur vérification session:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Ne pas rediriger automatiquement depuis la page de login pour éviter les conflits avec la déconnexion
  // La redirection sera gérée côté client dans la page de login

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/profil',
    '/api/:path*'
  ]
} 