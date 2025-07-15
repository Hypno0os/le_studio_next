import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyCSRFToken } from '@/lib/csrf'
import { getCurrentUser, canPerformAction, canEditArticle, canDeleteArticle } from '@/lib/auth'
import { validateAndSanitize, validationSchemas } from '@/lib/validation'

// GET - Récupérer un article spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const article = await prisma.blogArticle.findUnique({
      where: { id },
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
      }
    })

    if (!article) {
      return NextResponse.json(
        { message: 'Article non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier si l'article est publié ou si l'utilisateur a les permissions
    const user = await getCurrentUser()
    if (article.status !== 'PUBLISHED' && !canPerformAction(user, 'edit_articles')) {
      return NextResponse.json(
        { message: 'Article non accessible' },
        { status: 403 }
      )
    }

    // Convertir les BigInt en string pour la sérialisation JSON
    const serializedArticle = {
      ...article,
      id: article.id.toString(),
      authorId: article.authorId.toString(),
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
      publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
      // Sérialiser les images avec leurs IDs
      images: article.images.map(image => ({
        ...image,
        id: image.id.toString(),
        articleId: image.articleId.toString()
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
    }

    return NextResponse.json(serializedArticle)
  } catch (error) {
    console.error('Erreur récupération article:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la récupération de l\'article' },
      { status: 500 }
    )
  }
}

// PATCH - Mettre à jour un article
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Vérifier le token CSRF
    const csrfValid = await verifyCSRFToken(request)
    if (!csrfValid) {
      return NextResponse.json(
        { message: 'Token CSRF invalide ou manquant' },
        { status: 403 }
      )
    }

    // Vérifier les permissions
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      )
    }

    const canEdit = await canEditArticle(id)
    if (!canEdit) {
      return NextResponse.json(
        { message: 'Vous ne pouvez pas modifier cet article' },
        { status: 403 }
      )
    }

    // Récupérer et valider les données
    const body = await request.json()
    
    // Validation et sanitisation des données
    const validation = validateAndSanitize(body, validationSchemas.updateArticle)
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          message: 'Données invalides',
          errors: validation.errors 
        },
        { status: 400 }
      )
    }

    const { title, excerpt, content, featuredImage, status } = validation.sanitizedData!

    // Vérifier les permissions pour la publication
    if (status === 'PUBLISHED' && !canPerformAction(user, 'publish_articles')) {
      return NextResponse.json(
        { message: 'Vous ne pouvez pas publier des articles' },
        { status: 403 }
      )
    }

    // Mise à jour de l'article avec les données sanitifiées
    const updatedArticle = await prisma.blogArticle.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(excerpt && { excerpt }),
        ...(content && { content }),
        ...(featuredImage !== undefined && { featuredImage }),
        ...(status && { 
          status: status as any,
          publishedAt: status === 'PUBLISHED' ? new Date() : null
        })
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })

    // Convertir les BigInt en string pour la sérialisation JSON
    const serializedArticle = {
      ...updatedArticle,
      id: updatedArticle.id.toString(),
      authorId: updatedArticle.authorId.toString(),
      createdAt: updatedArticle.createdAt.toISOString(),
      updatedAt: updatedArticle.updatedAt.toISOString(),
      publishedAt: updatedArticle.publishedAt ? updatedArticle.publishedAt.toISOString() : null
    }

    console.log(`Article ${id} mis à jour avec le statut: ${status}`)
    return NextResponse.json(serializedArticle)
  } catch (error) {
    console.error('Erreur mise à jour article:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour de l\'article' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un article
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Vérifier le token CSRF
    const csrfValid = await verifyCSRFToken(request)
    if (!csrfValid) {
      return NextResponse.json(
        { message: 'Token CSRF invalide ou manquant' },
        { status: 403 }
      )
    }

    // Vérifier les permissions
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      )
    }

    const canDelete = await canDeleteArticle(id)
    if (!canDelete) {
      return NextResponse.json(
        { message: 'Vous ne pouvez pas supprimer cet article' },
        { status: 403 }
      )
    }

    // Supprimer l'article (les images seront supprimées automatiquement via CASCADE)
    await prisma.blogArticle.delete({
      where: { id }
    })

    console.log(`Article ${id} supprimé`)
    return NextResponse.json(
      { message: 'Article supprimé avec succès' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur suppression article:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la suppression de l\'article' },
      { status: 500 }
    )
  }
} 