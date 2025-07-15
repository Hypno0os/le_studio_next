import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

const SESSION_COOKIE = 'studio_session'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    console.log('🔐 Tentative de connexion pour:', email)
    
    if (!email || !password) {
      return NextResponse.json({ message: 'Email et mot de passe requis' }, { status: 400 })
    }
    
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      console.log('❌ Utilisateur non trouvé:', email)
      return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 401 })
    }
    
    console.log('👤 Utilisateur trouvé:', user.email, 'Rôle:', user.role)
    console.log('🔍 Vérification du mot de passe...')
    
    const valid = await bcrypt.compare(password, user.password)
    console.log('🔐 Résultat de la vérification:', valid ? '✅ OK' : '❌ ÉCHEC')
    
    if (!valid) {
      console.log('❌ Mot de passe incorrect pour:', email)
      return NextResponse.json({ message: 'Mot de passe incorrect' }, { status: 401 })
    }
    // Créer une session simple (cookie)
    const sessionToken = randomUUID()
    await prisma.session.create({
      data: {
        id: sessionToken,
        userId: user.id,
        token: sessionToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 jours
      }
    })
    
    const response = NextResponse.json({ 
      message: 'Connexion réussie',
      user: {
        id: user.id.toString(),
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role
      }
    })
    
    response.cookies.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    })
    return response
  } catch (error) {
    console.error('Erreur login:', error)
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 })
  }
} 