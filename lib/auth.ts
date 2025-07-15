import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'USER' | 'MODERATOR' | 'ADMIN'
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED'
}

export interface Session {
  id: string
  token: string
  userId: string
  expiresAt: Date
  user: User
}

/**
 * Récupère l'utilisateur connecté depuis la session
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('studio_session')?.value
    
    if (!sessionToken) return null

    const session = await prisma.session.findFirst({
      where: { 
        token: sessionToken,
        expiresAt: { gt: new Date() } // Session non expirée
      },
      include: { user: true }
    })

    if (!session || !session.user) return null

    // Vérifier que l'utilisateur est actif
    if (session.user.status !== 'ACTIVE') return null

    // Convertir les BigInt en string
    return {
      ...session.user,
      id: session.user.id.toString()
    }
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error)
    return null
  }
}

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 */
export function hasRole(user: User | null, requiredRole: 'USER' | 'MODERATOR' | 'ADMIN'): boolean {
  if (!user) return false

  const roleHierarchy = {
    'USER': 1,
    'MODERATOR': 2,
    'ADMIN': 3
  }

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
}

/**
 * Vérifie si l'utilisateur peut effectuer une action spécifique
 */
export function canPerformAction(user: User | null, action: string): boolean {
  if (!user) return false

  const permissions = {
    // Actions pour tous les utilisateurs connectés
    'read_articles': true,
    'create_articles': true,
    
    // Actions pour modérateurs et admins
    'edit_articles': hasRole(user, 'MODERATOR'),
    'delete_articles': hasRole(user, 'MODERATOR'),
    'publish_articles': hasRole(user, 'MODERATOR'),
    'moderate_comments': hasRole(user, 'MODERATOR'),
    
    // Actions pour admins uniquement
    'manage_users': hasRole(user, 'ADMIN'),
    'manage_categories': hasRole(user, 'ADMIN'),
    'view_analytics': hasRole(user, 'ADMIN'),
    'system_settings': hasRole(user, 'ADMIN')
  }

  return permissions[action as keyof typeof permissions] || false
}

/**
 * Middleware pour protéger les routes selon les rôles
 */
export async function requireAuth(requiredRole: 'USER' | 'MODERATOR' | 'ADMIN' = 'USER') {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  if (!hasRole(user, requiredRole)) {
    redirect('/unauthorized')
  }

  return user
}

/**
 * Middleware pour vérifier une permission spécifique
 */
export async function requirePermission(action: string) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  if (!canPerformAction(user, action)) {
    redirect('/unauthorized')
  }

  return user
}

/**
 * Vérifie si l'utilisateur peut modifier un article spécifique
 */
export async function canEditArticle(articleId: string): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  // Les admins peuvent tout modifier
  if (hasRole(user, 'ADMIN')) return true

  // Les modérateurs peuvent modifier tous les articles
  if (hasRole(user, 'MODERATOR')) return true

  // Les utilisateurs normaux ne peuvent modifier que leurs propres articles
  if (hasRole(user, 'USER')) {
    const article = await prisma.blogArticle.findUnique({
      where: { id: articleId },
      select: { authorId: true }
    })
    return article?.authorId.toString() === user.id
  }

  return false
}

/**
 * Vérifie si l'utilisateur peut supprimer un article spécifique
 */
export async function canDeleteArticle(articleId: string): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  // Seuls les modérateurs et admins peuvent supprimer
  return hasRole(user, 'MODERATOR')
} 