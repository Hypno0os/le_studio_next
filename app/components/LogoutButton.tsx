'use client'

import { useState } from 'react'

export default function LogoutButton() {
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    if (loading) return
    
    setLoading(true)
    
    try {
      console.log('🔄 Début de la déconnexion...')
      
      // Appel à l'API de déconnexion
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      console.log('📡 Réponse du serveur:', response.status, response.statusText)

      if (response.ok) {
        const data = await response.json()
        console.log('📋 Données de réponse:', data)
        
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
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`
          console.log(`🗑️ Cookie supprimé: ${cookieName}`)
        })
        
        // Rediriger vers la page d'accueil
        console.log('🔄 Redirection vers la page d\'accueil...')
        window.location.href = '/'
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Erreur réponse serveur:', response.status, errorData)
        alert(`Erreur de déconnexion: ${errorData.message || 'Erreur inconnue'}`)
      }
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error)
      alert('Erreur lors de la déconnexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="text-sm hover:text-yellow-500 transition-colors disabled:opacity-50"
    >
      {loading ? 'Déconnexion...' : 'Déconnexion'}
    </button>
  )
} 