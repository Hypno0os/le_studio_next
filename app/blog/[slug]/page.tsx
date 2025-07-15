import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

interface BlogPageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogArticlePage({ params }: BlogPageProps) {
  const { slug } = await params
  
  const article = await prisma.blogArticle.findUnique({
    where: { slug },
    include: {
      author: {
        select: { firstName: true, lastName: true, avatar: true }
      },
      categories: { include: { category: true } },
      images: { orderBy: { order: 'asc' } }
    }
  })

  if (!article) return notFound()

  // Vérifier les permissions d'accès
  const user = await getCurrentUser()
  const canAccess = 
    article.status === 'PUBLISHED' || 
    (user && (user.role === 'ADMIN' || user.role === 'MODERATOR')) ||
    (user && user.id === article.authorId)

  if (!canAccess) {
    return notFound()
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-yellow-500">{article.title}</h1>
          <div className="flex flex-wrap gap-2 mb-2">
            {article.categories.map((cat) => (
              <span key={cat.categoryId} className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                {cat.category.name}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            {article.author.avatar ? (
              <Image src={article.author.avatar} alt="avatar" width={24} height={24} className="rounded-full" />
            ) : (
              <div className="w-6 h-6 bg-gray-700 rounded-full" />
            )}
            <span>{article.author.firstName} {article.author.lastName}</span>
            {article.publishedAt && <span>· {new Date(article.publishedAt).toLocaleDateString('fr-FR')}</span>}
          </div>
        </div>
        {article.featuredImage && (
          <div className="mb-8">
            <Image src={article.featuredImage} alt={article.title} width={800} height={400} className="rounded-lg w-full h-auto object-cover" />
          </div>
        )}
        <article className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
      </div>
    </main>
  )
} 