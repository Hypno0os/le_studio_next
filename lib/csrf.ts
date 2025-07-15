import { randomBytes, createHmac } from 'crypto'
import { cookies } from 'next/headers'

const CSRF_SECRET = process.env.CSRF_SECRET || 'your-csrf-secret-key-change-in-production'
const CSRF_COOKIE_NAME = 'csrf_token'
const CSRF_HEADER_NAME = 'x-csrf-token'

/**
 * Génère un token CSRF sécurisé
 */
export function generateCSRFToken(): string {
  const randomToken = randomBytes(32).toString('hex')
  const timestamp = Date.now().toString()
  const data = `${randomToken}:${timestamp}`
  
  // Créer un HMAC pour signer le token
  const hmac = createHmac('sha256', CSRF_SECRET)
  hmac.update(data)
  const signature = hmac.digest('hex')
  
  return `${data}:${signature}`
}

/**
 * Valide un token CSRF
 */
export function validateCSRFToken(token: string): boolean {
  try {
    const parts = token.split(':')
    if (parts.length !== 3) return false
    
    const [randomToken, timestamp, signature] = parts
    
    // Vérifier que le timestamp n'est pas trop ancien (24h)
    const tokenAge = Date.now() - parseInt(timestamp)
    if (tokenAge > 24 * 60 * 60 * 1000) return false
    
    // Recréer la signature pour vérification
    const data = `${randomToken}:${timestamp}`
    const hmac = createHmac('sha256', CSRF_SECRET)
    hmac.update(data)
    const expectedSignature = hmac.digest('hex')
    
    return signature === expectedSignature
  } catch (error) {
    return false
  }
}

/**
 * Récupère le token CSRF depuis les cookies
 */
export async function getCSRFToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(CSRF_COOKIE_NAME)?.value || null
}

/**
 * Définit le token CSRF dans les cookies
 */
export function setCSRFTokenCookie(token: string): void {
  const cookieStore = cookies()
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 24 heures
    path: '/'
  })
}

/**
 * Vérifie si la requête contient un token CSRF valide
 */
export async function verifyCSRFToken(request: Request): Promise<boolean> {
  const token = request.headers.get(CSRF_HEADER_NAME)
  if (!token) return false
  
  return validateCSRFToken(token)
}

/**
 * Middleware pour ajouter automatiquement le token CSRF aux réponses
 */
export function withCSRF<T extends { cookies: any }>(handler: (req: Request, context: T) => Promise<Response>) {
  return async (req: Request, context: T) => {
    // Générer un nouveau token CSRF si nécessaire
    const existingToken = await getCSRFToken()
    if (!existingToken) {
      const newToken = generateCSRFToken()
      setCSRFTokenCookie(newToken)
    }
    
    return handler(req, context)
  }
} 