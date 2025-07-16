const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixImagePaths() {
  try {
    console.log('🔧 Correction des chemins d\'images dans la base de données...\n')

    // 1. Récupérer tous les articles avec du contenu HTML
    console.log('1️⃣ Récupération des articles...')
    const articles = await prisma.blogArticle.findMany({
      where: {
        content: {
          contains: '../uploads/'
        }
      },
      select: {
        id: true,
        title: true,
        content: true
      }
    })

    console.log(`✅ ${articles.length} articles trouvés avec des chemins d'images à corriger`)

    if (articles.length === 0) {
      console.log('✅ Aucun article à corriger')
      return
    }

    // 2. Corriger les chemins dans chaque article
    console.log('\n2️⃣ Correction des chemins d\'images...')
    let correctedCount = 0

    for (const article of articles) {
      console.log(`\n📝 Article: "${article.title}"`)
      
      let originalContent = article.content
      let correctedContent = originalContent

      // Remplacer les chemins relatifs par des chemins absolus
      correctedContent = correctedContent.replace(
        /\.\.\/uploads\//g,
        '/uploads/'
      )

      // Vérifier s'il y a eu des changements
      if (correctedContent !== originalContent) {
        try {
          await prisma.blogArticle.update({
            where: { id: article.id },
            data: { content: correctedContent }
          })
          
          console.log(`   ✅ Chemins corrigés`)
          correctedCount++
          
          // Afficher les changements
          const changes = originalContent.match(/\.\.\/uploads\/[^"'\s>]+/g) || []
          changes.forEach(change => {
            const newPath = change.replace('../uploads/', '/uploads/')
            console.log(`      ${change} → ${newPath}`)
          })
          
        } catch (error) {
          console.log(`   ❌ Erreur lors de la correction: ${error.message}`)
        }
      } else {
        console.log(`   ⏭️  Aucun changement nécessaire`)
      }
    }

    // 3. Vérifier les images dans la table BlogImage
    console.log('\n3️⃣ Vérification des images dans la table BlogImage...')
    const images = await prisma.blogImage.findMany({
      where: {
        filePath: {
          startsWith: '../uploads/'
        }
      },
      select: {
        id: true,
        filePath: true,
        fileName: true
      }
    })

    console.log(`✅ ${images.length} images trouvées avec des chemins à corriger`)

    if (images.length > 0) {
      for (const image of images) {
        const newFilePath = image.filePath.replace('../uploads/', '/uploads/')
        
        try {
          await prisma.blogImage.update({
            where: { id: image.id },
            data: { filePath: newFilePath }
          })
          
          console.log(`   ✅ ${image.fileName}: ${image.filePath} → ${newFilePath}`)
          correctedCount++
          
        } catch (error) {
          console.log(`   ❌ Erreur pour ${image.fileName}: ${error.message}`)
        }
      }
    }

    // 4. Vérifier les featuredImage
    console.log('\n4️⃣ Vérification des images de couverture...')
    const featuredImages = await prisma.blogArticle.findMany({
      where: {
        featuredImage: {
          startsWith: '../uploads/'
        }
      },
      select: {
        id: true,
        title: true,
        featuredImage: true
      }
    })

    console.log(`✅ ${featuredImages.length} images de couverture à corriger`)

    if (featuredImages.length > 0) {
      for (const article of featuredImages) {
        const newFeaturedImage = article.featuredImage.replace('../uploads/', '/uploads/')
        
        try {
          await prisma.blogArticle.update({
            where: { id: article.id },
            data: { featuredImage: newFeaturedImage }
          })
          
          console.log(`   ✅ "${article.title}": ${article.featuredImage} → ${newFeaturedImage}`)
          correctedCount++
          
        } catch (error) {
          console.log(`   ❌ Erreur pour "${article.title}": ${error.message}`)
        }
      }
    }

    // 5. Résumé
    console.log('\n🎉 Correction terminée !')
    console.log(`📊 Résumé:`)
    console.log(`   • Articles traités: ${articles.length}`)
    console.log(`   • Images BlogImage traitées: ${images.length}`)
    console.log(`   • Images de couverture traitées: ${featuredImages.length}`)
    console.log(`   • Total des corrections: ${correctedCount}`)

    // 6. Test de vérification
    console.log('\n6️⃣ Test de vérification...')
    const remainingIssues = await prisma.blogArticle.findMany({
      where: {
        OR: [
          { content: { contains: '../uploads/' } },
          { featuredImage: { startsWith: '../uploads/' } }
        ]
      },
      select: {
        id: true,
        title: true
      }
    })

    if (remainingIssues.length === 0) {
      console.log('✅ Aucun problème restant détecté')
    } else {
      console.log(`⚠️  ${remainingIssues.length} articles avec des problèmes restants:`)
      remainingIssues.forEach(issue => {
        console.log(`   • ${issue.title} (ID: ${issue.id})`)
      })
    }

  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le script
fixImagePaths() 