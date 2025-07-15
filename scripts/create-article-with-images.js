const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createArticleWithImages() {
  try {
    // Trouver un utilisateur admin
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!admin) {
      console.error('Aucun utilisateur admin trouvé')
      return
    }

    // Créer un article avec des images
    const article = await prisma.blogArticle.create({
      data: {
        title: 'Les bienfaits du CrossFit pour votre santé',
        slug: 'bienfaits-crossfit-sante-' + Date.now(),
        excerpt: 'Le CrossFit est une méthode d\'entraînement complète qui améliore la force, l\'endurance et la flexibilité. Découvrez tous ses avantages.',
        content: `
          <h2>Qu'est-ce que le CrossFit ?</h2>
          <p>Le CrossFit est un programme de conditionnement physique qui combine des exercices de force, d'endurance cardiovasculaire et de gymnastique.</p>
          
          <h3>Les avantages du CrossFit</h3>
          <ul>
            <li><strong>Amélioration de la condition physique générale</strong></li>
            <li><strong>Développement de la force musculaire</strong></li>
            <li><strong>Augmentation de l'endurance cardiovasculaire</strong></li>
            <li><strong>Amélioration de la flexibilité et de la mobilité</strong></li>
            <li><strong>Perte de poids et tonification</strong></li>
          </ul>
          
          <h3>Pourquoi choisir le CrossFit ?</h3>
          <p>Le CrossFit s'adapte à tous les niveaux et peut être pratiqué par des débutants comme par des athlètes confirmés. Chaque entraînement est différent et stimulant.</p>
        `,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        authorId: admin.id,
        images: {
          create: [
            {
              originalName: 'crossfit-training.jpg',
              fileName: '13d97ccf-71ef-473f-83f2-e0acd25adfb3.webp',
              filePath: '/uploads/original/13d97ccf-71ef-473f-83f2-e0acd25adfb3.webp',
              mimeType: 'image/webp',
              fileSize: 1024000n,
              width: 800,
              height: 600,
              altText: 'Entraînement CrossFit',
              order: 1
            },
            {
              originalName: 'functional-exercises.jpg',
              fileName: '1d2bd439-8992-4f15-a2fb-c2693588fbd2.webp',
              filePath: '/uploads/original/1d2bd439-8992-4f15-a2fb-c2693588fbd2.webp',
              mimeType: 'image/webp',
              fileSize: 1200000n,
              width: 800,
              height: 600,
              altText: 'Exercices fonctionnels',
              order: 2
            },
            {
              originalName: 'workout-session.jpg',
              fileName: '4c930bd2-b1b0-4e79-810b-63b5ae89f0f2.webp',
              filePath: '/uploads/original/4c930bd2-b1b0-4e79-810b-63b5ae89f0f2.webp',
              mimeType: 'image/webp',
              fileSize: 980000n,
              width: 800,
              height: 600,
              altText: 'Séance d\'entraînement',
              order: 3
            }
          ]
        }
      }
    })

    console.log('✅ Article avec images créé avec succès:')
    console.log(`   ID: ${article.id}`)
    console.log(`   Titre: ${article.title}`)
    console.log(`   Statut: ${article.status}`)
    console.log(`   Slug: ${article.slug}`)
    console.log(`   Nombre d'images: 3`)
    console.log('\n🎯 Vous pouvez maintenant voir l\'article sur la page publique du blog:')
    console.log('   1. Allez sur /blog')
    console.log('   2. Vous devriez voir l\'article avec ses images')
    console.log('   3. Le compteur d\'images devrait afficher "3 images"')

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'article avec images:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createArticleWithImages() 