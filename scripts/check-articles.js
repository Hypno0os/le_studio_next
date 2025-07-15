const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkArticles() {
  try {
    console.log('🔍 Vérification des articles dans la base de données...\n')

    // Récupérer tous les articles
    const articles = await prisma.blogArticle.findMany({
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📊 Total d'articles trouvés: ${articles.length}\n`)

    if (articles.length === 0) {
      console.log('❌ Aucun article trouvé dans la base de données')
      return
    }

    // Afficher les détails de chaque article
    articles.forEach((article, index) => {
      console.log(`📝 Article ${index + 1}:`)
      console.log(`   ID: ${article.id}`)
      console.log(`   Titre: ${article.title}`)
      console.log(`   Statut: ${article.status}`)
      console.log(`   Créé le: ${article.createdAt}`)
      console.log(`   Publié le: ${article.publishedAt || 'Non publié'}`)
      console.log(`   Auteur: ${article.author.firstName} ${article.author.lastName} (${article.author.email}) - Rôle: ${article.author.role}`)
      console.log(`   Slug: ${article.slug}`)
      console.log('')
    })

    // Statistiques par statut
    const stats = articles.reduce((acc, article) => {
      acc[article.status] = (acc[article.status] || 0) + 1
      return acc
    }, {})

    console.log('📈 Statistiques par statut:')
    Object.entries(stats).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} article(s)`)
    })

    // Vérifier les articles en attente
    const pendingArticles = articles.filter(a => a.status === 'PENDING')
    if (pendingArticles.length > 0) {
      console.log(`\n⏳ Articles en attente de validation: ${pendingArticles.length}`)
      pendingArticles.forEach(article => {
        console.log(`   - ${article.title} (par ${article.author.firstName} ${article.author.lastName})`)
      })
    } else {
      console.log('\n✅ Aucun article en attente de validation')
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkArticles() 