import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import Link from 'next/link'
import { cookies } from 'next/headers'

async function getPublishedArticles() {
  try {
    const articles = await prisma.blogArticle.findMany({
      where: {
        status: 'PUBLISHED'
      },
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
        publishedAt: 'desc'
      }
    })
    return articles
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error)
    return []
  }
}

export default async function Blog() {
  const articles = await getPublishedArticles()
  const cookiesStore = await cookies()
  const isLogged = !!cookiesStore.get('studio_session')

  const getArticleThumbnail = (article: any) => {
    // Priorité 1: Image mise en avant
    if (article.featuredImage) {
      return article.featuredImage
    }
    
    // Priorité 2: Première image de la galerie
    if (article.images && article.images.length > 0) {
      const firstImage = article.images[0]
      // Utiliser l'URL directe si disponible, sinon construire le chemin
      if (firstImage.url) {
        return firstImage.url
      } else if (firstImage.filePath) {
        // Convertir le chemin original en thumbnail
        return firstImage.filePath.replace('/original/', '/thumbnails/').replace(/\.[^/.]+$/, '.webp')
      }
    }
    
    // Priorité 3: Image par défaut
    return '/assets/img/gallery/news-defaut.jpg'
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
          Blog - Le Studio
        </h1>
        
        <p className="text-lg text-center text-gray-600 mb-16 max-w-3xl mx-auto">
          Découvrez nos conseils fitness, nos actualités et les témoignages 
          de nos membres pour vous motiver dans votre parcours sportif.
        </p>

        {articles.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">
              Aucun article publié pour le moment
            </h2>
            <p className="text-gray-500">
              Revenez bientôt pour découvrir nos premiers articles !
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <article key={article.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Image de l'article */}
                <div className="relative h-48 bg-gray-100">
                  <Image
                    src={getArticleThumbnail(article)}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                  
                  {/* Badge de statut */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      Publié
                    </span>
                  </div>

                  {/* Compteur d'images */}
                  {article.images && article.images.length > 0 && (
                    <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      {article.images.length} image{article.images.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                {/* Contenu de l'article */}
                <div className="p-6">
                  {/* Catégories */}
                  {article.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {article.categories.map((cat) => (
                        <span
                          key={cat.categoryId}
                          className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full"
                        >
                          {cat.category.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Titre */}
                  <h2 className="text-xl font-bold mb-3 text-gray-800 line-clamp-2">
                    {article.title}
                  </h2>

                  {/* Extrait */}
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>

                  {/* Métadonnées */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-2">
                      {article.author.avatar ? (
                        <Image
                          src={article.author.avatar}
                          alt={`${article.author.firstName} ${article.author.lastName}`}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-xs text-gray-500">
                            {article.author.firstName.charAt(0)}{article.author.lastName.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span>
                        {article.author.firstName} {article.author.lastName}
                      </span>
                    </div>
                    {article.publishedAt && (
                      <span>
                        {new Date(article.publishedAt).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>

                  {/* Lien vers l'article */}
                  <Link
                    href={`/blog/${article.slug}`}
                    className="inline-block bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Lire l'article
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* CTA pour créer un article */}
        {isLogged && (
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Vous avez une histoire à partager ?
            </h2>
            <p className="text-gray-600 mb-6">
              Rejoignez notre communauté et partagez votre expérience fitness !
            </p>
            <Link
              href="/blog/nouveau"
              className="bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Écrire un article
            </Link>
          </div>
        )}
      </div>
    </main>
  )
} 