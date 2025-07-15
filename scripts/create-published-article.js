const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createPublishedArticle() {
  try {
    // Trouver un utilisateur admin
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!admin) {
      console.error('Aucun utilisateur admin trouvé')
      return
    }

    // Créer un article publié de test
    const article = await prisma.blogArticle.create({
      data: {
        title: 'Comment optimiser votre entraînement fitness',
        slug: 'optimiser-entrainement-fitness-' + Date.now(),
        excerpt: 'Découvrez nos conseils experts pour maximiser l\'efficacité de vos séances d\'entraînement et atteindre vos objectifs plus rapidement.',
        content: `
          <h2>Les bases d'un entraînement efficace</h2>
          <p>Un entraînement fitness optimal repose sur plusieurs piliers essentiels : la planification, la technique, la récupération et la nutrition.</p>
          
          <h3>1. Planifiez vos séances</h3>
          <p>La planification est cruciale pour progresser. Définissez vos objectifs et adaptez votre programme en conséquence.</p>
          
          <h3>2. Maîtrisez la technique</h3>
          <p>Une bonne technique est plus importante que la charge. Prenez le temps d'apprendre les mouvements correctement.</p>
          
          <h3>3. Respectez la récupération</h3>
          <p>La récupération est aussi importante que l'entraînement. Donnez à votre corps le temps de se reconstruire.</p>
          
          <h3>4. Optimisez votre nutrition</h3>
          <p>Une alimentation adaptée à vos objectifs accélérera vos progrès et améliorera vos performances.</p>
        `,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        authorId: admin.id,
        featuredImage: '/assets/img/gallery/entrainement-fonctionnel.jpg'
      }
    })

    console.log('✅ Article publié créé avec succès:')
    console.log(`   ID: ${article.id}`)
    console.log(`   Titre: ${article.title}`)
    console.log(`   Statut: ${article.status}`)
    console.log(`   Slug: ${article.slug}`)
    console.log(`   Image mise en avant: ${article.featuredImage}`)
    console.log('\n🎯 Vous pouvez maintenant voir l\'article sur la page publique du blog:')
    console.log('   1. Allez sur /blog')
    console.log('   2. Vous devriez voir l\'article avec son image')
    console.log('   3. Cliquez sur "Lire l\'article" pour voir le contenu complet')

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'article publié:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createPublishedArticle() 