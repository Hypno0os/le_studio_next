const fetch = require('node-fetch')

async function testImageAccess() {
  try {
    console.log('🌐 Test d\'accès aux images via le serveur...\n')

    const baseUrl = 'http://localhost:3000'
    
    // Liste des images à tester
    const testImages = [
      '/uploads/medium/53583bfc-84aa-483f-b97d-d20959fd0434.webp',
      '/uploads/medium/b7735ada-a068-4f11-b067-28eef8d09754.webp',
      '/uploads/medium/b7a4e62b-ccf2-4a4a-b765-6acae417af19.webp',
      '/uploads/medium/2c702ec4-29e0-4c66-a44a-2bb79e1e5549.webp',
      '/uploads/medium/088ce289-100a-437c-a487-bbc55d4bfd4a.webp',
      '/uploads/medium/ee61e635-1d79-4b37-84b0-094e5269511b.webp',
      '/uploads/medium/75f43264-8bf0-4591-998f-7f292d0c13fc.webp',
      '/uploads/medium/42764381-59ff-4abd-891f-dba8fd17f09b.webp',
      '/uploads/medium/f1b62072-6734-4a7d-bf8b-90e9e633add4.webp',
      '/uploads/medium/6505d72f-af79-4f30-8cb5-43aa38ac5810.webp'
    ]

    console.log('1️⃣ Test d\'accès aux images medium...')
    let successCount = 0
    let errorCount = 0

    for (const imagePath of testImages) {
      try {
        const response = await fetch(`${baseUrl}${imagePath}`, {
          method: 'HEAD', // Juste vérifier l'existence, pas télécharger
          timeout: 5000
        })

        if (response.ok) {
          console.log(`   ✅ ${imagePath} - ${response.status} ${response.statusText}`)
          successCount++
        } else {
          console.log(`   ❌ ${imagePath} - ${response.status} ${response.statusText}`)
          errorCount++
        }
      } catch (error) {
        console.log(`   ❌ ${imagePath} - Erreur: ${error.message}`)
        errorCount++
      }
    }

    console.log(`\n📊 Résumé medium: ${successCount} succès, ${errorCount} erreurs`)

    // Test des images originales
    console.log('\n2️⃣ Test d\'accès aux images originales...')
    const originalImages = [
      '/uploads/original/e5fb990c-6bc3-41df-b5d5-32f2f947511c.jpg',
      '/uploads/original/a8df1e11-a85d-451f-bd79-389b35d2c4f5.jpg',
      '/uploads/original/7acaafd6-967f-4c75-959b-ebaae03223c8.jpg',
      '/uploads/original/fc2efd83-931a-42a0-a9e8-f69dc6b6b6ac.jpg',
      '/uploads/original/4ee5306c-352c-4162-9476-a200d9c19db0.jpg'
    ]

    let originalSuccessCount = 0
    let originalErrorCount = 0

    for (const imagePath of originalImages) {
      try {
        const response = await fetch(`${baseUrl}${imagePath}`, {
          method: 'HEAD',
          timeout: 5000
        })

        if (response.ok) {
          console.log(`   ✅ ${imagePath} - ${response.status} ${response.statusText}`)
          originalSuccessCount++
        } else {
          console.log(`   ❌ ${imagePath} - ${response.status} ${response.statusText}`)
          originalErrorCount++
        }
      } catch (error) {
        console.log(`   ❌ ${imagePath} - Erreur: ${error.message}`)
        originalErrorCount++
      }
    }

    console.log(`\n📊 Résumé original: ${originalSuccessCount} succès, ${originalErrorCount} erreurs`)

    // Test des thumbnails
    console.log('\n3️⃣ Test d\'accès aux thumbnails...')
    const thumbnailImages = [
      '/uploads/thumbnails/53583bfc-84aa-483f-b97d-d20959fd0434.webp',
      '/uploads/thumbnails/b7735ada-a068-4f11-b067-28eef8d09754.webp',
      '/uploads/thumbnails/b7a4e62b-ccf2-4a4a-b765-6acae417af19.webp'
    ]

    let thumbnailSuccessCount = 0
    let thumbnailErrorCount = 0

    for (const imagePath of thumbnailImages) {
      try {
        const response = await fetch(`${baseUrl}${imagePath}`, {
          method: 'HEAD',
          timeout: 5000
        })

        if (response.ok) {
          console.log(`   ✅ ${imagePath} - ${response.status} ${response.statusText}`)
          thumbnailSuccessCount++
        } else {
          console.log(`   ❌ ${imagePath} - ${response.status} ${response.statusText}`)
          thumbnailErrorCount++
        }
      } catch (error) {
        console.log(`   ❌ ${imagePath} - Erreur: ${error.message}`)
        thumbnailErrorCount++
      }
    }

    console.log(`\n📊 Résumé thumbnails: ${thumbnailSuccessCount} succès, ${thumbnailErrorCount} erreurs`)

    // Test de l'image par défaut
    console.log('\n4️⃣ Test de l\'image par défaut...')
    try {
      const response = await fetch(`${baseUrl}/assets/img/gallery/news-defaut.jpg`, {
        method: 'HEAD',
        timeout: 5000
      })

      if (response.ok) {
        console.log(`   ✅ /assets/img/gallery/news-defaut.jpg - ${response.status} ${response.statusText}`)
      } else {
        console.log(`   ❌ /assets/img/gallery/news-defaut.jpg - ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.log(`   ❌ /assets/img/gallery/news-defaut.jpg - Erreur: ${error.message}`)
    }

    // Résumé global
    console.log('\n🎉 Test terminé !')
    console.log('📋 Résumé global:')
    console.log(`   • Images medium: ${successCount}/${testImages.length} accessibles`)
    console.log(`   • Images originales: ${originalSuccessCount}/${originalImages.length} accessibles`)
    console.log(`   • Thumbnails: ${thumbnailSuccessCount}/${thumbnailImages.length} accessibles`)
    
    const totalSuccess = successCount + originalSuccessCount + thumbnailSuccessCount
    const totalTests = testImages.length + originalImages.length + thumbnailImages.length
    
    console.log(`   • Total: ${totalSuccess}/${totalTests} images accessibles`)
    
    if (totalSuccess === totalTests) {
      console.log('   ✅ Toutes les images sont accessibles !')
    } else {
      console.log('   ⚠️  Certaines images ne sont pas accessibles')
      console.log('   💡 Vérifiez que le serveur Next.js est démarré sur http://localhost:3000')
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
    console.log('💡 Assurez-vous que le serveur Next.js est démarré sur http://localhost:3000')
  }
}

// Exécuter le test
testImageAccess() 