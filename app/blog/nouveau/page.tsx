'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

// Import dynamique de TinyMCE pour éviter l'hydratation
const Editor = dynamic(() => import('@tinymce/tinymce-react').then(mod => mod.Editor), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
      <p className="text-gray-500">Chargement de l'éditeur...</p>
    </div>
  )
})

export default function NouvelArticle() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    categories: [] as string[]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [csrfToken, setCsrfToken] = useState<string>('')

  // Récupérer le token CSRF au chargement
  useEffect(() => {
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
    
    fetchCSRFToken()
  }, [])

  const handleEditorChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch('/api/blog/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken, // Inclure le token CSRF
        },
        body: JSON.stringify({
          ...formData,
          status: 'PENDING' // Les articles des utilisateurs sont en attente de validation
        }),
      })

      if (response.ok) {
        setMessage('Article soumis avec succès ! Il sera publié après validation par l\'administrateur.')
        setTimeout(() => {
          router.push('/blog')
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
      setMessage('Erreur lors de la soumission de l\'article')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
          Écrire un nouvel article
        </h1>

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
                placeholder="Entrez le titre de votre article..."
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
                placeholder="Résumé court de votre article (visible dans la liste des articles)..."
              />
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
                Vous pouvez utiliser une image hébergée en ligne ou laisser vide pour utiliser une image par défaut
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
                        return result.location
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

            {/* Informations importantes */}
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Informations importantes :</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Votre article sera soumis pour validation par l'administrateur</li>
                <li>• Vous recevrez une notification une fois l'article publié</li>
                <li>• Assurez-vous que votre contenu respecte nos règles de publication</li>
                <li>• Vous pouvez glisser-déposer des images directement dans l'éditeur</li>
                <li>• Les images seront automatiquement optimisées et redimensionnées</li>
              </ul>
            </div>

            {/* Boutons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-gray-900 font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                {isSubmitting ? 'Soumission...' : 'Soumettre l\'article'}
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/blog')}
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