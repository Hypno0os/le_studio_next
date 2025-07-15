import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Début de la déconnexion...')
    
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('studio_session')?.value
    
    console.log('📋 Token de session trouvé:', sessionToken ? 'Oui' : 'Non')

    if (sessionToken) {
      // Supprimer la session de la base de données
      try {
        const deletedSessions = await prisma.session.deleteMany({
          where: { token: sessionToken }
        })
        console.log('🗑️ Sessions supprimées de la DB:', deletedSessions.count)
      } catch (dbError) {
        console.error('❌ Erreur suppression session DB:', dbError)
        // Continuer même si la suppression DB échoue
      }
    }

    // Créer la réponse de déconnexion
    const response = NextResponse.json({ 
      message: 'Déconnexion réussie',
      success: true
    })

    // Supprimer le cookie de session principal
    response.cookies.set('studio_session', '', {
      httpOnly: true,
      path: '/',
      expires: new Date(0),
      maxAge: 0,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    // Supprimer le token CSRF
    response.cookies.set('csrf_token', '', {
      httpOnly: true,
      path: '/',
      expires: new Date(0),
      maxAge: 0,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    // Ajouter des headers pour forcer la suppression des cookies
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    console.log('✅ Déconnexion terminée avec succès')
    return response
    
  } catch (error) {
    console.error('❌ Erreur déconnexion:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la déconnexion', success: false },
      { status: 500 }
    )
  }
} 