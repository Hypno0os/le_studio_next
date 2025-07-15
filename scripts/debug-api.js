const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugAPI() {
  try {
    console.log('🔍 Débogage de l\'API des articles...\n')

    // Test 1: Vérifier la base de données directement
    console.log('1️⃣ Test direct de la base de données:')
    const articles = await prisma.blogArticle.findMany({
      where: { status: 'PENDING' },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      }
    })
    console.log(`   ✅ ${articles.length} articles PENDING trouvés directement`)
    
    if (articles.length > 0) {
      articles.forEach((article, index) => {
        console.log(`   📝 Article ${index + 1}: ${article.title} (${article.author.firstName} ${article.author.lastName})`)
      })
    }

    console.log('')

    // Test 2: Vérifier les sessions
    console.log('2️⃣ Test des sessions:')
    const sessions = await prisma.session.findMany({
      where: {
        expiresAt: { gt: new Date() }
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      }
    })
    console.log(`   ✅ ${sessions.length} sessions actives trouvées`)
    
    if (sessions.length > 0) {
      sessions.forEach((session, index) => {
        console.log(`   👤 Session ${index + 1}: ${session.user.firstName} ${session.user.lastName} (${session.user.role})`)
      })
    }

    console.log('')

    // Test 3: Vérifier les utilisateurs admin
    console.log('3️⃣ Test des utilisateurs admin:')
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true
      }
    })
    console.log(`   ✅ ${admins.length} utilisateurs admin trouvés`)
    
    admins.forEach((admin, index) => {
      console.log(`   👑 Admin ${index + 1}: ${admin.firstName} ${admin.lastName} (${admin.email}) - Statut: ${admin.status}`)
    })

    console.log('')

    // Test 4: Vérifier la structure de la base de données
    console.log('4️⃣ Test de la structure de la base de données:')
    try {
      const testQuery = await prisma.blogArticle.findFirst({
        include: {
          author: true,
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
      console.log('   ✅ Structure de la base de données OK')
      if (testQuery) {
        console.log(`   📝 Article test: ${testQuery.title}`)
        console.log(`   👤 Auteur: ${testQuery.author.firstName} ${testQuery.author.lastName}`)
        console.log(`   🏷️ Catégories: ${testQuery.categories.length}`)
        console.log(`   🖼️ Images: ${testQuery.images.length}`)
      }
    } catch (error) {
      console.log(`   ❌ Erreur structure: ${error.message}`)
    }

  } catch (error) {
    console.error('❌ Erreur lors du débogage:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugAPI() 