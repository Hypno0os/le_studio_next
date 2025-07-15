import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, canPerformAction } from '@/lib/auth'

// GET - Rechercher des articles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category')
    const author = searchParams.get('author')
    const status = searchParams.get('status') || 'PUBLISHED'
    const sortBy = searchParams.get('sortBy') || 'publishedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    // Vérifier les permissions pour voir les articles non publiés
    const user = await getCurrentUser()
    const canViewAll = user && canPerformAction(user, 'edit_articles')

    // Construire les conditions de recherche
    const where: any = {}

    // Statut des articles
    if (canViewAll && status !== 'PUBLISHED') {
      where.status = status
    } else {
      where.status = 'PUBLISHED'
    }

    // Recherche textuelle
    if (query) {
      where.OR = [
        {
          title: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          excerpt: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          content: {
            contains: query,
            mode: 'insensitive'
          }
        }
      ]
    }

    // Filtre par catégorie
    if (category) {
      where.categories = {
        some: {
          category: {
            slug: category
          }
        }
      }
    }

    // Filtre par auteur
    if (author) {
      where.author = {
        OR: [
          {
            firstName: {
              contains: author,
              mode: 'insensitive'
            }
          },
          {
            lastName: {
              contains: author,
              mode: 'insensitive'
            }
          }
        ]
      }
    }

    // Recherche des articles
    const articles = await prisma.blogArticle.findMany({
      where,
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        images: {
          take: 1,
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      take: limit,
      skip: (page - 1) * limit
    })

    // Compter le total des résultats
    const total = await prisma.blogArticle.count({ where })

    // Calculer les métadonnées de pagination
    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      search: {
        query,
        category,
        author,
        status,
        sortBy,
        sortOrder
      }
    })
  } catch (error) {
    console.error('Erreur recherche articles:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la recherche' },
      { status: 500 }
    )
  }
} 