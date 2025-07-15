const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testAPIError() {
  try {
    console.log('🧪 Test de l\'erreur API...\n')

    // 1. Simuler exactement ce que fait l'API
    console.log('1️⃣ Test de la requête Prisma:')
    try {
      const articles = await prisma.blogArticle.findMany({
        where: { status: 'PENDING' },
        include: {
          author: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true
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
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      console.log(`✅ ${articles.length} articles trouvés`)

      // 2. Test de la sérialisation
      console.log('\n2️⃣ Test de la sérialisation:')
      try {
        const serializedArticles = articles.map(article => ({
          ...article,
          id: article.id.toString(),
          authorId: article.authorId.toString(),
          createdAt: article.createdAt.toISOString(),
          updatedAt: article.updatedAt.toISOString(),
          publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null
        }))

        console.log('✅ Sérialisation réussie')
        console.log(`   Premier article: ${serializedArticles[0]?.title}`)
        console.log(`   ID: ${serializedArticles[0]?.id} (type: ${typeof serializedArticles[0]?.id})`)

        // 3. Test du count
        console.log('\n3️⃣ Test du count:')
        const total = await prisma.blogArticle.count({ where: { status: 'PENDING' } })
        console.log(`✅ Total: ${total} (type: ${typeof total})`)
        console.log(`   Converti: ${Number(total)} (type: ${typeof Number(total)})`)

        // 4. Test de la réponse complète
        console.log('\n4️⃣ Test de la réponse complète:')
        const response = {
          articles: serializedArticles,
          pagination: {
            page: 1,
            limit: 10,
            total: Number(total),
            pages: Math.ceil(Number(total) / 10)
          }
        }

        const jsonString = JSON.stringify(response)
        console.log('✅ JSON.stringify réussi')
        console.log(`   Taille: ${jsonString.length} caractères`)

      } catch (serializeError) {
        console.log(`❌ Erreur sérialisation: ${serializeError.message}`)
        console.log(`   Stack: ${serializeError.stack}`)
      }

    } catch (queryError) {
      console.log(`❌ Erreur requête: ${queryError.message}`)
      console.log(`   Stack: ${queryError.stack}`)
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAPIError() 