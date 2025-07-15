const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestPendingArticle() {
  try {
    // Trouver un utilisateur normal
    const user = await prisma.user.findFirst({
      where: { role: 'USER' }
    })

    if (!user) {
      console.error('❌ Aucun utilisateur normal trouvé')
      return
    }

    console.log(`👤 Utilisateur trouvé: ${user.firstName} ${user.lastName} (${user.email})`)

    // Créer un article de test en statut PENDING
    const article = await prisma.blogArticle.create({
      data: {
        title: 'Article de test en attente de validation',
        slug: 'article-test-pending-' + Date.now(),
        excerpt: 'Cet article a été créé pour tester l\'affichage des articles en attente dans l\'interface d\'administration.',
        content: `
          <h2>Article de test</h2>
          <p>Ceci est un article de test créé pour vérifier que les articles en statut PENDING s'affichent correctement dans l'interface d'administration.</p>
          <p>L'article est actuellement en attente de validation par l'administrateur.</p>
          <h3>Fonctionnalités à tester :</h3>
          <ul>
            <li>Affichage dans la liste des articles en attente</li>
            <li>Boutons de publication et de rejet</li>
            <li>Filtrage par statut</li>
          </ul>
        `,
        status: 'PENDING',
        authorId: user.id,
        featuredImage: null
      }
    })

    console.log('✅ Article de test créé avec succès:')
    console.log(`   ID: ${article.id}`)
    console.log(`   Titre: ${article.title}`)
    console.log(`   Statut: ${article.status}`)
    console.log(`   Slug: ${article.slug}`)
    console.log(`   Auteur: ${user.firstName} ${user.lastName}`)
    console.log('\n🎯 Instructions de test:')
    console.log('   1. Connectez-vous avec admin@lestudiosport.fr')
    console.log('   2. Allez dans /admin/blog')
    console.log('   3. Cliquez sur le filtre "En attente"')
    console.log('   4. Vérifiez que l\'article apparaît dans la liste')
    console.log('   5. Testez les boutons "Publier" et "Rejeter"')

  } catch (error) {
    console.error('❌ Erreur lors de la création:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestPendingArticle() 