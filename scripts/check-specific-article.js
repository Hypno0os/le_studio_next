const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkSpecificArticle() {
  try {
    console.log('🔍 Vérification de l\'article "gsdb"...\n')

    // Rechercher l'article par slug
    const article = await prisma.blogArticle.findUnique({
      where: { slug: 'gsdb' },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            role: true
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
      console.log('❌ Article "gsdb" non trouvé')
      return
    }

    console.log('✅ Article trouvé:')
    console.log(`   ID: ${article.id}`)
    console.log(`   Titre: ${article.title}`)
    console.log(`   Slug: ${article.slug}`)
    console.log(`   Statut: ${article.status}`)
    console.log(`   Créé le: ${article.createdAt}`)
    console.log(`   Publié le: ${article.publishedAt || 'Non publié'}`)
    console.log(`   Auteur: ${article.author.firstName} ${article.author.lastName} (${article.author.email}) - Rôle: ${article.author.role}`)
    console.log(`   Catégories: ${article.categories.length}`)
    console.log(`   Images: ${article.images.length}`)
    console.log(`   Contenu: ${article.content.substring(0, 100)}...`)

    // Vérifier si l'article peut être affiché publiquement
    if (article.status === 'PUBLISHED') {
      console.log('\n✅ Article publié - accessible publiquement')
    } else if (article.status === 'PENDING') {
      console.log('\n⏳ Article en attente - accessible uniquement aux admins/mods')
    } else if (article.status === 'DRAFT') {
      console.log('\n📝 Article brouillon - accessible uniquement à l\'auteur et admins')
    } else {
      console.log('\n❌ Article rejeté - non accessible')
    }

    // Vérifier les permissions d'accès
    console.log('\n🔐 Permissions d\'accès:')
    console.log(`   - Public: ${article.status === 'PUBLISHED' ? 'Oui' : 'Non'}`)
    console.log(`   - Admin/Mod: ${['ADMIN', 'MODERATOR'].includes(article.author.role) ? 'Oui' : 'Non'}`)
    console.log(`   - Auteur: ${article.author.role === 'USER' ? 'Oui' : 'Non'}`)

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSpecificArticle() 