'use client'

import { useEffect, useState } from 'react'

export default function LogoutPage() {
  const [message, setMessage] = useState('Déconnexion en cours...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const logout = async () => {
      try {
        console.log('🔄 Début de la déconnexion côté client...')
        
        // Appel à l'API de déconnexion
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Important pour inclure les cookies
        })

        console.log('📡 Réponse du serveur:', response.status, response.statusText)

        if (response.ok) {
          const data = await response.json()
          console.log('📋 Données de réponse:', data)
          
          setMessage('Déconnexion réussie ! Nettoyage en cours...')
          
          // Vider le localStorage et sessionStorage
          console.log('🗑️ Nettoyage du localStorage et sessionStorage...')
          localStorage.clear()
          sessionStorage.clear()
          
          // Supprimer tous les cookies possibles côté client
          const cookiesToDelete = [
            'studio_session',
            'csrf_token',
            'next-auth.session-token',
            '__Secure-next-auth.session-token',
            'next-auth.csrf-token',
            '__Host-next-auth.csrf-token'
          ]
          
          console.log('🍪 Suppression des cookies côté client...')
          cookiesToDelete.forEach(cookieName => {
            // Supprimer avec différents domaines et chemins
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`
            console.log(`🗑️ Cookie supprimé: ${cookieName}`)
          })
          
          // Attendre un peu puis forcer un rafraîchissement complet
          setTimeout(() => {
            console.log('🔄 Redirection vers la page d\'accueil...')
            // Forcer un rafraîchissement complet de la page
            window.location.href = '/'
          }, 1000)
        } else {
          const errorData = await response.json().catch(() => ({}))
          console.error('❌ Erreur réponse serveur:', response.status, errorData)
          setError(`Erreur ${response.status}: ${errorData.message || 'Erreur inconnue'}`)
          setMessage('Erreur lors de la déconnexion')
          setTimeout(() => {
            window.location.href = '/'
          }, 3000)
        }
      } catch (error) {
        console.error('❌ Erreur déconnexion:', error)
        setError(error instanceof Error ? error.message : 'Erreur inconnue')
        setMessage('Erreur lors de la déconnexion')
        setTimeout(() => {
          window.location.href = '/'
        }, 3000)
      }
    }

    logout()
  }, [])

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Déconnexion
          </h1>
          
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <div className="animate-pulse">
            <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    </main>
  )
} 