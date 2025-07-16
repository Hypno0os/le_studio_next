const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testImageDisplay() {
  try {
    console.log('🖼️  Test d\'affichage des images...\n')

    // 1. Récupérer quelques articles avec des images
    console.log('1️⃣ Récupération d\'articles avec des images...')
    const articles = await prisma.blogArticle.findMany({
      where: {
        OR: [
          { content: { contains: '/uploads/' } },
          { featuredImage: { not: null } }
        ]
      },
      include: {
        images: true
      },
      take: 5
    })

    console.log(`✅ ${articles.length} articles trouvés avec des images`)

    if (articles.length === 0) {
      console.log('❌ Aucun article avec des images trouvé')
      return
    }

    // 2. Analyser chaque article
    console.log('\n2️⃣ Analyse des chemins d\'images...')
    
    for (const article of articles) {
      console.log(`\n📝 Article: "${article.title}"`)
      console.log(`   ID: ${article.id}`)
      console.log(`   Statut: ${article.status}`)
      
      // Vérifier l'image de couverture
      if (article.featuredImage) {
        console.log(`   🖼️  Image de couverture: ${article.featuredImage}`)
        if (article.featuredImage.startsWith('/uploads/')) {
          console.log(`      ✅ Chemin correct`)
        } else {
          console.log(`      ❌ Chemin incorrect`)
        }
      }
      
      // Vérifier les images dans le contenu
      const imageMatches = article.content.match(/src="([^"]+)"/g) || []
      if (imageMatches.length > 0) {
        console.log(`   📸 Images dans le contenu: ${imageMatches.length}`)
        imageMatches.forEach(match => {
          const src = match.match(/src="([^"]+)"/)[1]
          console.log(`      ${src}`)
          if (src.startsWith('/uploads/')) {
            console.log(`         ✅ Chemin correct`)
          } else if (src.startsWith('../uploads/')) {
            console.log(`         ❌ Chemin relatif incorrect`)
          } else if (src.startsWith('http')) {
            console.log(`         ✅ URL externe`)
          } else {
            console.log(`         ⚠️  Chemin suspect`)
          }
        })
      }
      
      // Vérifier les images dans la table BlogImage
      if (article.images.length > 0) {
        console.log(`   🗂️  Images en base: ${article.images.length}`)
        article.images.forEach(image => {
          console.log(`      ${image.fileName}: ${image.filePath}`)
          if (image.filePath.startsWith('/uploads/')) {
            console.log(`         ✅ Chemin correct`)
          } else {
            console.log(`         ❌ Chemin incorrect`)
          }
        })
      }
    }

    // 3. Test de simulation d'affichage
    console.log('\n3️⃣ Test de simulation d\'affichage...')
    
    for (const article of articles) {
      console.log(`\n📱 Simulation pour "${article.title}":`)
      
      // Simuler getArticleThumbnail
      let thumbnail = null
      
      // Priorité 1: Image mise en avant
      if (article.featuredImage && article.featuredImage.trim() !== '') {
        thumbnail = article.featuredImage
        console.log(`   🖼️  Thumbnail (featured): ${thumbnail}`)
      }
      // Priorité 2: Première image de la galerie
      else if (article.images && article.images.length > 0) {
        const firstImage = article.images[0]
        if (firstImage.filePath) {
          // Convertir le chemin original en thumbnail
          thumbnail = firstImage.filePath.replace('/original/', '/thumbnails/').replace(/\.[^/.]+$/, '.webp')
          console.log(`   🖼️  Thumbnail (gallery): ${thumbnail}`)
        }
      }
      // Priorité 3: Image par défaut
      else {
        thumbnail = '/assets/img/gallery/news-defaut.jpg'
        console.log(`   🖼️  Thumbnail (default): ${thumbnail}`)
      }
      
      // Vérifier si le chemin est accessible
      if (thumbnail && thumbnail.startsWith('/uploads/')) {
        console.log(`   ✅ Chemin d'accès: ${thumbnail}`)
      } else if (thumbnail && thumbnail.startsWith('/assets/')) {
        console.log(`   ✅ Image par défaut: ${thumbnail}`)
      } else {
        console.log(`   ❌ Chemin d'accès invalide: ${thumbnail}`)
      }
    }

    // 4. Vérification des fichiers physiques
    console.log('\n4️⃣ Vérification des fichiers physiques...')
    const fs = require('fs')
    const path = require('path')
    
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    const mediumDir = path.join(uploadsDir, 'medium')
    const originalDir = path.join(uploadsDir, 'original')
    const thumbnailsDir = path.join(uploadsDir, 'thumbnails')
    
    console.log(`   📁 Dossier uploads: ${uploadsDir}`)
    console.log(`   📁 Dossier medium: ${mediumDir}`)
    console.log(`   📁 Dossier original: ${originalDir}`)
    console.log(`   📁 Dossier thumbnails: ${thumbnailsDir}`)
    
    // Compter les fichiers dans chaque dossier
    try {
      const mediumFiles = fs.readdirSync(mediumDir).filter(f => f.endsWith('.webp') || f.endsWith('.jpg') || f.endsWith('.png'))
      const originalFiles = fs.readdirSync(originalDir).filter(f => f.endsWith('.webp') || f.endsWith('.jpg') || f.endsWith('.png'))
      const thumbnailFiles = fs.readdirSync(thumbnailsDir).filter(f => f.endsWith('.webp') || f.endsWith('.jpg') || f.endsWith('.png'))
      
      console.log(`   📊 Fichiers medium: ${mediumFiles.length}`)
      console.log(`   📊 Fichiers original: ${originalFiles.length}`)
      console.log(`   📊 Fichiers thumbnails: ${thumbnailFiles.length}`)
      
      // Vérifier quelques fichiers spécifiques
      const testFiles = ['53583bfc-84aa-483f-b97d-d20959fd0434.webp']
      testFiles.forEach(filename => {
        const mediumPath = path.join(mediumDir, filename)
        const originalPath = path.join(originalDir, filename.replace('.webp', '.jpg'))
        const thumbnailPath = path.join(thumbnailsDir, filename)
        
        console.log(`\n   🔍 Test du fichier: ${filename}`)
        console.log(`      Medium: ${fs.existsSync(mediumPath) ? '✅ Existe' : '❌ Manquant'}`)
        console.log(`      Original: ${fs.existsSync(originalPath) ? '✅ Existe' : '❌ Manquant'}`)
        console.log(`      Thumbnail: ${fs.existsSync(thumbnailPath) ? '✅ Existe' : '❌ Manquant'}`)
      })
      
    } catch (error) {
      console.log(`   ❌ Erreur lors de la vérification des fichiers: ${error.message}`)
    }

    // 5. Résumé
    console.log('\n🎉 Test terminé !')
    console.log('📋 Recommandations:')
    console.log('   • Vérifiez que le serveur Next.js est démarré')
    console.log('   • Testez l\'accès direct aux images via le navigateur')
    console.log('   • Vérifiez les logs du serveur pour les erreurs 404')
    console.log('   • Assurez-vous que les permissions de fichiers sont correctes')

  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le test
testImageDisplay() 