import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('studio_session')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier la session dans la base de données
    const session = await prisma.session.findFirst({
      where: {
        token: sessionToken,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: true
      }
    })

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Session invalide ou expirée' },
        { status: 401 }
      )
    }

    // Mettre à jour la dernière activité
    await prisma.session.update({
      where: { id: session.id },
      data: { lastActivity: new Date() }
    })

    return NextResponse.json({
      user: {
        id: session.user.id.toString(),
        email: session.user.email,
        name: `${session.user.firstName} ${session.user.lastName}`,
        role: session.user.role
      }
    })

  } catch (error) {
    console.error('Erreur récupération utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
} 