import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { verifyCSRFToken } from '@/lib/csrf'
import { getCurrentUser, canPerformAction } from '@/lib/auth'
import { validateAndSanitize, validationSchemas } from '@/lib/validation'

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

    // Vérifier l'authentification et les permissions
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      )
    }

    if (!canPerformAction(user, 'create_articles')) {
      return NextResponse.json(
        { message: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    // Récupérer et valider les données
    const body = await request.json()
    
    // Validation et sanitisation des données
    const validation = validateAndSanitize(body, validationSchemas.createArticle)
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          message: 'Données invalides',
          errors: validation.errors 
        },
        { status: 400 }
      )
    }

    const { title, excerpt, content, featuredImage, status = 'DRAFT' } = validation.sanitizedData!

    // Vérifier les permissions pour la publication
    if (status === 'PUBLISHED' && !canPerformAction(user, 'publish_articles')) {
      return NextResponse.json(
        { message: 'Vous ne pouvez pas publier directement des articles' },
        { status: 403 }
      )
    }

    // Pour les utilisateurs normaux, forcer le statut PENDING
    const finalStatus = user.role === 'USER' ? 'PENDING' : status

    // Génération du slug sécurisé
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now()

    // Création de l'article avec les données sanitifiées
    const article = await prisma.blogArticle.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        featuredImage: featuredImage || null,
        status: finalStatus as any,
        publishedAt: finalStatus === 'PUBLISHED' ? new Date() : null,
        authorId: user.id,
      },
    })

    return NextResponse.json(article, { status: 201 })
  } catch (error) {
    console.error('Erreur création article:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la création de l\'article' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    // Pour les requêtes avec statut spécifique, vérifier l'authentification
    if (status && status !== 'PUBLISHED') {
      try {
        const user = await getCurrentUser()
        if (!user || !canPerformAction(user, 'edit_articles')) {
          return NextResponse.json(
            { message: 'Non autorisé' },
            { status: 401 }
          )
        }
      } catch (authError) {
        console.error('Erreur authentification:', authError)
        return NextResponse.json(
          { message: 'Erreur d\'authentification' },
          { status: 401 }
        )
      }
    }

    const where = status ? { status: status as any } : {}

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
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: (page - 1) * limit
    })

    const total = await prisma.blogArticle.count({ where })

    // Convertir les BigInt en Number pour la sérialisation JSON
    const serializedArticles = articles.map(article => ({
      ...article,
      id: article.id.toString(),
      authorId: article.authorId.toString(),
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
      publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
      // Sérialiser les images avec conversion des BigInt et Int
      images: article.images.map(image => ({
        ...image,
        id: image.id.toString(),
        articleId: image.articleId.toString(),
        fileSize: typeof image.fileSize === 'bigint' ? image.fileSize.toString() : image.fileSize,
        width: Number(image.width),
        height: Number(image.height),
        order: Number(image.order)
      })),
      // Sérialiser les catégories avec leurs IDs
      categories: article.categories.map(cat => ({
        ...cat,
        id: cat.id.toString(),
        articleId: cat.articleId.toString(),
        categoryId: cat.categoryId.toString(),
        category: {
          ...cat.category,
          id: cat.category.id.toString()
        }
      }))
    }))

    return NextResponse.json({
      articles: serializedArticles,
      pagination: {
        page,
        limit,
        total: Number(total),
        pages: Math.ceil(Number(total) / limit)
      }
    })
  } catch (error) {
    console.error('Erreur récupération articles:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des articles' },
      { status: 500 }
    )
  }
} 