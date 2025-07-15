const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestArticle() {
  try {
    // Trouver un utilisateur admin
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!admin) {
      console.error('Aucun utilisateur admin trouvé')
      return
    }

    // Créer un article de test en statut PENDING
    const article = await prisma.blogArticle.create({
      data: {
        title: 'Article de test pour validation',
        slug: 'article-test-validation-' + Date.now(),
        excerpt: 'Cet article est en attente de validation par l\'administrateur.',
        content: `
          <h2>Article de test</h2>
          <p>Ceci est un article de test créé pour vérifier le système de validation des articles dans l'interface d'administration.</p>
          <p>L'article est actuellement en statut "PENDING" et devrait apparaître dans la liste des articles en attente de validation.</p>
          <h3>Fonctionnalités à tester :</h3>
          <ul>
            <li>Publication de l'article</li>
            <li>Rejet de l'article</li>
            <li>Suppression de l'article</li>
          </ul>
        `,
        status: 'PENDING',
        authorId: admin.id,
        featuredImage: null
      }
    })

    console.log('✅ Article de test créé avec succès:')
    console.log(`   ID: ${article.id}`)
    console.log(`   Titre: ${article.title}`)
    console.log(`   Statut: ${article.status}`)
    console.log(`   Slug: ${article.slug}`)
    console.log('\n🎯 Vous pouvez maintenant tester la validation dans l\'interface d\'administration:')
    console.log('   1. Connectez-vous avec admin@lestudiosport.fr')
    console.log('   2. Allez dans /admin/blog')
    console.log('   3. Filtrez par "En attente"')
    console.log('   4. Testez les boutons "Publier" et "Rejeter"')

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'article de test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestArticle() 