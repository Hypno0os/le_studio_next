import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, canPerformAction } from '@/lib/auth'

// GET - Récupérer les statistiques du blog
export async function GET(request: NextRequest) {
  try {
    // Vérifier les permissions (admin uniquement)
    const user = await getCurrentUser()
    if (!user || !canPerformAction(user, 'view_analytics')) {
      return NextResponse.json(
        { message: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // jours

    const daysAgo = new Date()
    daysAgo.setDate(daysAgo.getDate() - parseInt(period))

    // Statistiques des articles
    const articlesStats = await prisma.blogArticle.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    })

    // Articles récents
    const recentArticles = await prisma.blogArticle.findMany({
      where: {
        createdAt: {
          gte: daysAgo
        }
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    // Statistiques des utilisateurs
    const usersStats = await prisma.user.groupBy({
      by: ['role', 'status'],
      _count: {
        id: true
      }
    })

    // Utilisateurs récents
    const recentUsers = await prisma.user.findMany({
      where: {
        memberSince: {
          gte: daysAgo
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        memberSince: true
      },
      orderBy: {
        memberSince: 'desc'
      },
      take: 10
    })

    // Statistiques des catégories
    const categoriesStats = await prisma.blogCategory.findMany({
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      },
      orderBy: {
        _count: {
          articles: 'desc'
        }
      }
    })

    // Sessions actives
    const activeSessions = await prisma.session.count({
      where: {
        expiresAt: {
          gt: new Date()
        }
      }
    })

    // Calcul des statistiques globales
    const totalArticles = articlesStats.reduce((sum, stat) => sum + stat._count.id, 0)
    const publishedArticles = articlesStats.find(stat => stat.status === 'PUBLISHED')?._count.id || 0
    const pendingArticles = articlesStats.find(stat => stat.status === 'PENDING')?._count.id || 0
    const draftArticles = articlesStats.find(stat => stat.status === 'DRAFT')?._count.id || 0

    const totalUsers = usersStats.reduce((sum, stat) => sum + stat._count.id, 0)
    const activeUsers = usersStats.find(stat => stat.status === 'ACTIVE')?._count.id || 0

    // Tendances (comparaison avec la période précédente)
    const previousPeriodStart = new Date(daysAgo)
    previousPeriodStart.setDate(previousPeriodStart.getDate() - parseInt(period))

    const currentPeriodArticles = await prisma.blogArticle.count({
      where: {
        createdAt: {
          gte: daysAgo
        }
      }
    })

    const previousPeriodArticles = await prisma.blogArticle.count({
      where: {
        createdAt: {
          gte: previousPeriodStart,
          lt: daysAgo
        }
      }
    })

    const articlesGrowth = previousPeriodArticles > 0 
      ? ((currentPeriodArticles - previousPeriodArticles) / previousPeriodArticles) * 100
      : 0

    return NextResponse.json({
      overview: {
        totalArticles,
        publishedArticles,
        pendingArticles,
        draftArticles,
        totalUsers,
        activeUsers,
        activeSessions,
        articlesGrowth: Math.round(articlesGrowth * 100) / 100
      },
      articles: {
        byStatus: articlesStats,
        recent: recentArticles
      },
      users: {
        byRole: usersStats,
        recent: recentUsers
      },
      categories: categoriesStats,
      period: parseInt(period)
    })
  } catch (error) {
    console.error('Erreur récupération analytics:', error)
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
} 