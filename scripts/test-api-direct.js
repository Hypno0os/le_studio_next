const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testAPIDirect() {
  try {
    console.log('🧪 Test direct de l\'API des articles...\n')

    // 1. Trouver une session admin valide
    console.log('1️⃣ Recherche d\'une session admin valide:')
    const adminSession = await prisma.session.findFirst({
      where: {
        expiresAt: { gt: new Date() },
        user: {
          role: 'ADMIN',
          status: 'ACTIVE'
        }
      },
      include: {
        user: true
      }
    })

    if (!adminSession) {
      console.log('❌ Aucune session admin valide trouvée')
      return
    }

    console.log(`✅ Session admin trouvée: ${adminSession.user.firstName} ${adminSession.user.lastName}`)
    console.log(`   Token: ${adminSession.token.substring(0, 20)}...`)

    // 2. Simuler la fonction getCurrentUser
    console.log('\n2️⃣ Test de la fonction getCurrentUser:')
    try {
      const user = await getCurrentUser(adminSession.token)
      if (user) {
        console.log(`✅ Utilisateur récupéré: ${user.firstName} ${user.lastName} (${user.role})`)
      } else {
        console.log('❌ Aucun utilisateur récupéré')
      }
    } catch (error) {
      console.log(`❌ Erreur getCurrentUser: ${error.message}`)
    }

    // 3. Test de la fonction canPerformAction
    console.log('\n3️⃣ Test de la fonction canPerformAction:')
    try {
      const user = await getCurrentUser(adminSession.token)
      if (user) {
        const canEdit = canPerformAction(user, 'edit_articles')
        console.log(`✅ Peut éditer les articles: ${canEdit}`)
      }
    } catch (error) {
      console.log(`❌ Erreur canPerformAction: ${error.message}`)
    }

    // 4. Test de la requête Prisma directement
    console.log('\n4️⃣ Test de la requête Prisma (simulation API):')
    try {
      const articles = await prisma.blogArticle.findMany({
        where: { status: 'PENDING' },
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
        }
      })

      console.log(`✅ ${articles.length} articles PENDING trouvés via Prisma`)
      articles.forEach((article, index) => {
        console.log(`   📝 Article ${index + 1}: ${article.title}`)
        console.log(`   👤 Auteur: ${article.author.firstName} ${article.author.lastName}`)
        console.log(`   🏷️ Catégories: ${article.categories.length}`)
        console.log(`   🖼️ Images: ${article.images.length}`)
      })
    } catch (error) {
      console.log(`❌ Erreur requête Prisma: ${error.message}`)
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Fonction simulée getCurrentUser
async function getCurrentUser(sessionToken) {
  try {
    const session = await prisma.session.findFirst({
      where: { 
        token: sessionToken,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    })

    if (!session || !session.user) return null
    if (session.user.status !== 'ACTIVE') return null

    return session.user
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error)
    return null
  }
}

// Fonction simulée canPerformAction
function canPerformAction(user, action) {
  if (!user) return false

  const permissions = {
    'read_articles': true,
    'create_articles': true,
    'edit_articles': hasRole(user, 'MODERATOR'),
    'delete_articles': hasRole(user, 'MODERATOR'),
    'publish_articles': hasRole(user, 'MODERATOR'),
    'moderate_comments': hasRole(user, 'MODERATOR'),
    'manage_users': hasRole(user, 'ADMIN'),
    'manage_categories': hasRole(user, 'ADMIN'),
    'view_analytics': hasRole(user, 'ADMIN'),
    'system_settings': hasRole(user, 'ADMIN')
  }

  return permissions[action] || false
}

// Fonction simulée hasRole
function hasRole(user, requiredRole) {
  if (!user) return false

  const roleHierarchy = {
    'USER': 1,
    'MODERATOR': 2,
    'ADMIN': 3
  }

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
}

testAPIDirect() 