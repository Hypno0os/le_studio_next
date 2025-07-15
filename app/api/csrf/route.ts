import { NextRequest, NextResponse } from 'next/server'
import { generateCSRFToken, setCSRFTokenCookie } from '@/lib/csrf'

export async function GET(request: NextRequest) {
  try {
    // Générer un nouveau token CSRF
    const token = generateCSRFToken()
    
    // Créer la réponse
    const response = NextResponse.json({ 
      token,
      message: 'Token CSRF généré avec succès'
    })
    
    // Définir le cookie CSRF
    response.cookies.set('csrf_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 heures
      path: '/'
    })
    
    return response
  } catch (error) {
    console.error('Erreur génération token CSRF:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la génération du token CSRF' },
      { status: 500 }
    )
  }
} 