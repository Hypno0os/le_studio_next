import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyCSRFToken } from '@/lib/csrf'
import { getCurrentUser, canPerformAction } from '@/lib/auth'
import { validateAndSanitize } from '@/lib/validation'
import bcrypt from 'bcryptjs'

// Schéma de validation pour les utilisateurs
const userSchema = {
  firstName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s\-']+$/
  },
  lastName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s\-']+$/
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    required: false, // Optionnel pour les mises à jour
    minLength: 6
  },
  role: {
    required: false,
    pattern: /^(USER|MODERATOR|ADMIN)$/
  }
}

// GET - Récupérer tous les utilisateurs
export async function GET(request: NextRequest) {
  try {
    // Vérifier les permissions (admin uniquement)
    const user = await getCurrentUser()
    if (!user || !canPerformAction(user, 'manage_users')) {
      return NextResponse.json(
        { message: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const role = searchParams.get('role')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    const where: any = {}
    if (status) where.status = status
    if (role) where.role = role

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        memberSince: true,
        lastLogin: true,
        avatar: true,
        _count: {
          select: {
            articles: true,
            sessions: true
          }
        }
      },
      orderBy: {
        memberSince: 'desc'
      },
      take: limit,
      skip: (page - 1) * limit
    })

    const total = await prisma.user.count({ where })

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouvel utilisateur
export async function POST(request: NextRequest) {
  try {
    // Vérifier le token CSRF
    const csrfValid = await verifyCSRFToken(request)
    if (!csrfValid) {
      return NextResponse.json(
        { message: 'Token CSRF invalide ou manquant' },
        { status: 403 }
      )
    }

    // Vérifier les permissions (admin uniquement)
    const user = await getCurrentUser()
    if (!user || !canPerformAction(user, 'manage_users')) {
      return NextResponse.json(
        { message: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    // Récupérer et valider les données
    const body = await request.json()
    const validation = validateAndSanitize(body, userSchema)
    
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          message: 'Données invalides',
          errors: validation.errors 
        },
        { status: 400 }
      )
    }

    const { firstName, lastName, email, password, role = 'USER' } = validation.sanitizedData!

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Un utilisateur avec cet email existe déjà' },
        { status: 409 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'utilisateur
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: role as any,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        memberSince: true
      }
    })

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error('Erreur création utilisateur:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    )
  }
} 