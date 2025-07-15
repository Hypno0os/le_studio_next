'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import LogoutButton from './LogoutButton'

interface User {
  id: string
  email: string
  name: string
  role: string
}

export default function Navigation() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Erreur vérification auth:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Écouter les changements de route pour rafraîchir l'état d'authentification
    const handleRouteChange = () => {
      checkAuth()
    }

    window.addEventListener('focus', handleRouteChange)
    return () => window.removeEventListener('focus', handleRouteChange)
  }, [pathname])

  const navItems = [
    { href: '/', label: 'Accueil' },
    { href: '/offres', label: 'Offres' },
    { href: '/activites', label: 'Activités' },
    { href: '/coachs', label: 'Coachs' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <header className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-gray-900 font-bold text-lg">S</span>
            </div>
            <div>
              <div className="text-xl font-bold">le studio</div>
              <div className="text-yellow-500 text-sm">sport & coaching</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`hover:text-yellow-500 transition-colors ${
                  pathname === item.href ? 'text-yellow-500' : 'text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {!loading && (
              <>
                {user ? (
                  <>
                    {user.role === 'ADMIN' && (
                      <Link 
                        href="/admin" 
                        className="text-sm hover:text-yellow-500 transition-colors"
                      >
                        Admin
                      </Link>
                    )}
                    <Link 
                      href="/profil" 
                      className="text-sm hover:text-yellow-500 transition-colors"
                    >
                      Mon profil
                    </Link>
                    <LogoutButton />
                  </>
                ) : (
                  <Link 
                    href="/login" 
                    className="text-sm hover:text-yellow-500 transition-colors"
                  >
                    Connexion
                  </Link>
                )}
              </>
            )}
            <Link
              href="/reservation"
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Réserver
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
} 