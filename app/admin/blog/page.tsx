'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface ArticleImage {
  id: string
  url: string
  alt: string
  order: number
}

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED'
  createdAt: string
  publishedAt?: string
  featuredImage?: string
  author: {
    firstName: string
    lastName: string
  }
  images: ArticleImage[]
}

type ViewMode = 'table' | 'grid'

export default function AdminBlog() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'published' | 'draft'>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [csrfToken, setCsrfToken] = useState<string>('')

  useEffect(() => {
    fetchCSRFToken()
    fetchArticles()
  }, [filter])

  const fetchCSRFToken = async () => {
    try {
      const response = await fetch('/api/csrf')
      if (response.ok) {
        const data = await response.json()
        setCsrfToken(data.token)
      }
    } catch (error) {
      console.error('Erreur récupération token CSRF:', error)
    }
  }

  const fetchArticles = async () => {
    try {
      const params = filter !== 'all' ? `?status=${filter.toUpperCase()}` : ''
      const response = await fetch(`/api/blog/articles${params}`)
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles || [])
      } else if (response.status === 401) {
        console.error('Erreur d\'authentification')
        // Rediriger vers la page de login
        window.location.href = '/login'
      } else {
        console.error('Erreur récupération articles:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Erreur récupération articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateArticleStatus = async (articleId: string, status: string) => {
    try {
      const response = await fetch(`/api/blog/articles/${articleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        console.log(`Article ${articleId} mis à jour avec le statut: ${status}`)
        fetchArticles() // Recharger la liste
      } else {
        const errorData = await response.json()
        console.error('Erreur mise à jour statut:', errorData)
        alert(`Erreur: ${errorData.message || 'Erreur lors de la mise à jour'}`)
      }
    } catch (error) {
      console.error('Erreur mise à jour statut:', error)
      alert('Erreur lors de la mise à jour du statut')
    }
  }

  const deleteArticle = async (articleId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      return
    }

    try {
      const response = await fetch(`/api/blog/articles/${articleId}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': csrfToken,
        },
      })

      if (response.ok) {
        console.log(`Article ${articleId} supprimé`)
        fetchArticles() // Recharger la liste
      } else {
        const errorData = await response.json()
        console.error('Erreur suppression article:', errorData)
        alert(`Erreur: ${errorData.message || 'Erreur lors de la suppression'}`)
      }
    } catch (error) {
      console.error('Erreur suppression article:', error)
      alert('Erreur lors de la suppression de l\'article')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      DRAFT: 'bg-gray-100 text-gray-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      PUBLISHED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    }
    return badges[status as keyof typeof badges] || badges.DRAFT
  }

  const getStatusText = (status: string) => {
    const texts = {
      DRAFT: 'Brouillon',
      PENDING: 'En attente',
      PUBLISHED: 'Publié',
      REJECTED: 'Rejeté',
    }
    return texts[status as keyof typeof texts] || status
  }

  const getArticleThumbnail = (article: Article) => {
    // Priorité 1: Image mise en avant
    if (article.featuredImage && article.featuredImage.trim() !== '') {
      return article.featuredImage
    }
    
    // Priorité 2: Première image de la galerie
    if (article.images && article.images.length > 0 && article.images[0].url && article.images[0].url.trim() !== '') {
      return article.images[0].url
    }
    
    // Priorité 3: Image par défaut
    return '/assets/img/gallery/news-defaut.jpg'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Administration - Blog
          </h1>
          <Link
            href="/blog/nouveau"
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Nouvel article
          </Link>
        </div>

        {/* Filtres et vue */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              {[
                { key: 'all', label: 'Tous' },
                { key: 'pending', label: 'En attente' },
                { key: 'published', label: 'Publiés' },
                { key: 'draft', label: 'Brouillons' },
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key as any)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    filter === filterOption.key
                      ? 'bg-yellow-500 text-gray-900'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
            
            {/* Toggle vue */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Vue :</span>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'table'
                    ? 'bg-yellow-500 text-gray-900'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
                title="Vue tableau"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-yellow-500 text-gray-900'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
                title="Vue grille"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Vue tableau */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Article
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Auteur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={getArticleThumbnail(article) || '/assets/img/gallery/news-defaut.jpg'}
                              alt={article.title}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = '/assets/img/gallery/news-defaut.jpg'
                              }}
                            />
                          </div>
                          {article.images && article.images.length > 0 && (
                            <div className="mt-1 text-xs text-gray-500 text-center">
                              {article.images.length} image{article.images.length > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {article.title}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {article.excerpt}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {article.author.firstName} {article.author.lastName}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(article.status)}`}>
                          {getStatusText(article.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(article.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex gap-2">
                          <Link
                            href={`/blog/${article.slug}`}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Voir
                          </Link>
                          
                          {article.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => updateArticleStatus(article.id, 'PUBLISHED')}
                                className="text-green-600 hover:text-green-900 font-medium"
                              >
                                Publier
                              </button>
                              <button
                                onClick={() => updateArticleStatus(article.id, 'REJECTED')}
                                className="text-red-600 hover:text-red-900 font-medium"
                              >
                                Rejeter
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => deleteArticle(article.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Vue grille */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {articles.map((article) => (
              <div key={article.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Image */}
                <div className="relative h-48 bg-gray-100">
                  <Image
                    src={getArticleThumbnail(article) || '/assets/img/gallery/news-defaut.jpg'}
                    alt={article.title}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/assets/img/gallery/news-defaut.jpg'
                    }}
                  />
                  {article.images && article.images.length > 0 && (
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      {article.images.length} image{article.images.length > 1 ? 's' : ''}
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(article.status)}`}>
                      {getStatusText(article.status)}
                    </span>
                  </div>
                </div>
                
                {/* Contenu */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>{article.author.firstName} {article.author.lastName}</span>
                    <span>{new Date(article.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/blog/${article.slug}`}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 text-center py-2 px-3 rounded text-sm font-medium transition-colors"
                    >
                      Voir
                    </Link>
                    
                    {article.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => updateArticleStatus(article.id, 'PUBLISHED')}
                          className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                        >
                          Publier
                        </button>
                        <button
                          onClick={() => updateArticleStatus(article.id, 'REJECTED')}
                          className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                        >
                          Rejeter
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => deleteArticle(article.id)}
                      className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {articles.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-lg">
            <p className="text-gray-500">
              Aucun article trouvé avec ce filtre.
            </p>
          </div>
        )}
      </div>
    </main>
  )
} 