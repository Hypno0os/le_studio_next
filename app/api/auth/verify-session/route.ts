import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 400 }
      )
    }

    // Vérifier la session dans la base de données
    const session = await prisma.session.findFirst({
      where: {
        token: token,
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

    // Nettoyer les sessions expirées périodiquement
    if (Math.random() < 0.1) {
      await prisma.session.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      })
    }

    return NextResponse.json({
      valid: true,
      user: {
        id: session.user.id.toString(),
        email: session.user.email,
        role: session.user.role,
        name: `${session.user.firstName} ${session.user.lastName}`
      },
      session: {
        id: session.id.toString(),
        expiresAt: session.expiresAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Erreur vérification session:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
} 