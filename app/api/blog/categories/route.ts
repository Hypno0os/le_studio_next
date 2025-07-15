import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyCSRFToken } from '@/lib/csrf'
import { getCurrentUser, canPerformAction } from '@/lib/auth'
import { validateAndSanitize } from '@/lib/validation'

// Schéma de validation pour les catégories
const categorySchema = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_]+$/
  },
  description: {
    required: false,
    maxLength: 500
  },
  color: {
    required: false,
    pattern: /^#[0-9A-F]{6}$/i
  }
}

// GET - Récupérer toutes les catégories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeArticles = searchParams.get('includeArticles') === 'true'

    const categories = await prisma.blogCategory.findMany({
      include: includeArticles ? {
        articles: {
          include: {
            article: {
              where: { status: 'PUBLISHED' },
              select: {
                id: true,
                title: true,
                slug: true,
                publishedAt: true
              }
            }
          }
        }
      } : undefined,
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Erreur récupération catégories:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des catégories' },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle catégorie
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
    if (!user || !canPerformAction(user, 'manage_categories')) {
      return NextResponse.json(
        { message: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    // Récupérer et valider les données
    const body = await request.json()
    const validation = validateAndSanitize(body, categorySchema)
    
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          message: 'Données invalides',
          errors: validation.errors 
        },
        { status: 400 }
      )
    }

    const { name, description, color } = validation.sanitizedData!

    // Générer le slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Vérifier si la catégorie existe déjà
    const existingCategory = await prisma.blogCategory.findUnique({
      where: { slug }
    })

    if (existingCategory) {
      return NextResponse.json(
        { message: 'Une catégorie avec ce nom existe déjà' },
        { status: 409 }
      )
    }

    // Créer la catégorie
    const category = await prisma.blogCategory.create({
      data: {
        name,
        slug,
        description: description || null,
        color: color || null
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Erreur création catégorie:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la création de la catégorie' },
      { status: 500 }
    )
  }
} 