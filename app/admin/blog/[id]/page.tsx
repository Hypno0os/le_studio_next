'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter, useParams } from 'next/navigation'

// Import dynamique de TinyMCE pour éviter l'hydratation
const Editor = dynamic(() => import('@tinymce/tinymce-react').then(mod => mod.Editor), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
      <p className="text-gray-500">Chargement de l'éditeur...</p>
    </div>
  )
})

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED'
  featuredImage?: string
  createdAt: string
  publishedAt?: string
  author: {
    firstName: string
    lastName: string
  }
}

export default function EditArticle() {
  const router = useRouter()
  const params = useParams()
  const articleId = params.id as string

  const [article, setArticle] = useState<Article | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    status: 'DRAFT' as 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [csrfToken, setCsrfToken] = useState<string>('')

  // Récupérer le token CSRF et l'article au chargement
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer le token CSRF
        const csrfResponse = await fetch('/api/csrf')
        if (csrfResponse.ok) {
          const csrfData = await csrfResponse.json()
          setCsrfToken(csrfData.token)
        }

        // Récupérer l'article
        const articleResponse = await fetch(`/api/blog/articles/${articleId}`)
        if (articleResponse.ok) {
          const articleData = await articleResponse.json()
          setArticle(articleData)
          setFormData({
            title: articleData.title,
            excerpt: articleData.excerpt,
            content: articleData.content,
            featuredImage: articleData.featuredImage || '',
            status: articleData.status
          })
        } else if (articleResponse.status === 401) {
          router.push('/login')
          return
        } else {
          setMessage('Erreur lors du chargement de l\'article')
        }
      } catch (error) {
        console.error('Erreur récupération données:', error)
        setMessage('Erreur lors du chargement de l\'article')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [articleId, router])

  const handleEditorChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch(`/api/blog/articles/${articleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setMessage('Article mis à jour avec succès !')
        setTimeout(() => {
          router.push('/admin/blog')
        }, 2000)
      } else {
        const error = await response.json()
        if (error.errors && Array.isArray(error.errors)) {
          setMessage(`Erreurs de validation:\n${error.errors.join('\n')}`)
        } else {
          setMessage(`Erreur: ${error.message}`)
        }
      }
    } catch (error) {
      setMessage('Erreur lors de la mise à jour de l\'article')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Article non trouvé</p>
          <button
            onClick={() => router.push('/admin/blog')}
            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Retour à l'administration
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Modifier l'article
          </h1>
          <button
            onClick={() => router.push('/admin/blog')}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Retour à l'administration
          </button>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('Erreur') 
              ? 'bg-red-100 text-red-700 border border-red-300' 
              : 'bg-green-100 text-green-700 border border-green-300'
          }`}>
            {message.split('\n').map((line, index) => (
              <div key={index} className={index > 0 ? 'mt-1' : ''}>
                {line}
              </div>
            ))}
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
            {/* Informations de l'article */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Informations de l'article :</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Auteur :</strong> {article.author.firstName} {article.author.lastName}</p>
                <p><strong>Créé le :</strong> {new Date(article.createdAt).toLocaleDateString('fr-FR')}</p>
                {article.publishedAt && (
                  <p><strong>Publié le :</strong> {new Date(article.publishedAt).toLocaleDateString('fr-FR')}</p>
                )}
                <p><strong>Slug :</strong> {article.slug}</p>
              </div>
            </div>

            {/* Titre */}
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Titre de l'article *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-black bg-white"
                required
                placeholder="Entrez le titre de l'article..."
              />
            </div>

            {/* Extrait */}
            <div className="mb-6">
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                Extrait *
              </label>
              <textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-black bg-white"
                required
                placeholder="Résumé court de l'article..."
              />
            </div>

            {/* Statut */}
            <div className="mb-6">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Statut *
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-black bg-white"
                required
              >
                <option value="DRAFT">Brouillon</option>
                <option value="PENDING">En attente</option>
                <option value="PUBLISHED">Publié</option>
                <option value="REJECTED">Rejeté</option>
              </select>
            </div>

            {/* Image de couverture */}
            <div className="mb-6">
              <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700 mb-2">
                Image de couverture (URL)
              </label>
              <input
                type="url"
                id="featuredImage"
                value={formData.featuredImage}
                onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-black bg-white"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-sm text-gray-500 mt-1">
                Laissez vide pour utiliser une image par défaut
              </p>
            </div>

            {/* Éditeur TinyMCE */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contenu de l'article *
              </label>
              <Editor
                apiKey="s0eh41kdyv9j7cyvxznh2n5soj3evtaj69dreswy0q8wkocv"
                value={formData.content}
                onEditorChange={handleEditorChange}
                init={{
                  height: 500,
                  menubar: true,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'help', 'wordcount'
                  ],
                  toolbar: 'undo redo | formatselect | ' +
                    'bold italic backcolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | image media | help',
                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px; color:#111; background:#fff; }',
                  
                  // Configuration pour le drag & drop et upload d'images
                  automatic_uploads: true,
                  file_picker_types: 'image',
                  images_upload_url: '/api/blog/upload-image',
                  images_upload_handler: async (blobInfo, progress) => {
                    try {
                      const formData = new FormData()
                      formData.append('file', blobInfo.blob(), blobInfo.filename())
                      
                      const response = await fetch('/api/blog/upload-image', {
                        method: 'POST',
                        body: formData,
                      })
                      
                      if (response.ok) {
                        const result = await response.json()
                        // S'assurer que l'URL retournée est absolue
                        const imageUrl = result.location.startsWith('/') ? result.location : `/${result.location}`
                        return imageUrl
                      } else {
                        throw new Error('Upload failed')
                      }
                    } catch (error) {
                      console.error('Erreur upload image:', error)
                      return ''
                    }
                  },
                  
                  // Configuration pour le drag & drop
                  paste_data_images: true,
                  paste_as_text: false,
                  paste_enable_default_filters: true,
                  
                  // Configuration des images
                  image_advtab: true,
                  image_caption: true,
                  image_dimensions: true,
                  image_class_list: [
                    {title: 'Responsive', value: 'img-fluid'},
                    {title: 'Thumbnail', value: 'img-thumbnail'}
                  ],
                  
                  // Configuration pour le drag & drop direct
                  dragdrop_callbacks: true,
                  
                  // Configuration de sécurité
                  extended_valid_elements: 'img[src|alt|title|width|height|style|class]',
                  invalid_elements: 'script,iframe,object,embed,form,input,textarea,select,button',
                  
                  // Configuration de l'interface
                  language: 'fr_FR',
                  browser_spellcheck: true,
                  contextmenu: false,
                  branding: false,
                  elementpath: false,
                  resize: true
                }}
              />
            </div>

            {/* Boutons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-gray-900 font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                {isSubmitting ? 'Mise à jour...' : 'Mettre à jour l\'article'}
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/admin/blog')}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
} 