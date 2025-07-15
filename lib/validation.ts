import DOMPurify from 'isomorphic-dompurify'

// Types pour la validation
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  sanitizedData?: any
}

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
}

export interface ValidationSchema {
  [key: string]: ValidationRule
}

/**
 * Valide une chaîne de caractères
 */
function validateString(value: any, rules: ValidationRule): { isValid: boolean; error?: string } {
  // Vérifier si requis
  if (rules.required && (!value || value.trim() === '')) {
    return { isValid: false, error: 'Ce champ est requis' }
  }

  // Si pas de valeur et pas requis, c'est OK
  if (!value || value.trim() === '') {
    return { isValid: true }
  }

  const strValue = String(value).trim()

  // Vérifier la longueur minimale
  if (rules.minLength && strValue.length < rules.minLength) {
    return { isValid: false, error: `Minimum ${rules.minLength} caractères requis` }
  }

  // Vérifier la longueur maximale
  if (rules.maxLength && strValue.length > rules.maxLength) {
    return { isValid: false, error: `Maximum ${rules.maxLength} caractères autorisés` }
  }

  // Vérifier le pattern
  if (rules.pattern && !rules.pattern.test(strValue)) {
    return { isValid: false, error: 'Format invalide' }
  }

  // Validation personnalisée
  if (rules.custom) {
    const result = rules.custom(strValue)
    if (typeof result === 'string') {
      return { isValid: false, error: result }
    }
    if (!result) {
      return { isValid: false, error: 'Validation échouée' }
    }
  }

  return { isValid: true }
}

/**
 * Sanitise le contenu HTML avec DOMPurify
 */
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a', 'img', 'table', 'thead',
      'tbody', 'tr', 'td', 'th', 'div', 'span'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'width', 'height', 'class', 'id', 'style',
      'target', 'rel'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
  })
}

/**
 * Valide et sanitise les données selon un schéma
 */
export function validateAndSanitize(data: any, schema: ValidationSchema): ValidationResult {
  const errors: string[] = []
  const sanitizedData: any = {}

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field]
    
    // Validation
    const validation = validateString(value, rules)
    if (!validation.isValid) {
      errors.push(`${field}: ${validation.error}`)
      continue
    }

    // Sanitisation
    if (value) {
      let sanitizedValue = String(value).trim()
      
      // Sanitisation spéciale pour le contenu HTML
      if (field === 'content') {
        sanitizedValue = sanitizeHTML(sanitizedValue)
      } else {
        // Échappement HTML pour les champs texte simples
        sanitizedValue = sanitizedValue
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
      }
      
      sanitizedData[field] = sanitizedValue
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? sanitizedData : undefined
  }
}

/**
 * Schémas de validation prédéfinis
 */
export const validationSchemas = {
  // Schéma pour la création d'articles
  createArticle: {
    title: {
      required: true,
      minLength: 3,
      maxLength: 255,
      pattern: /^[a-zA-ZÀ-ÿ0-9\s\-_.,!?()'"]+$/,
      custom: (value: string) => {
        if (value.includes('<script>') || value.includes('javascript:')) {
          return 'Contenu non autorisé détecté'
        }
        return true
      }
    },
    excerpt: {
      required: true,
      minLength: 10,
      maxLength: 500
    },
    content: {
      required: true,
      minLength: 50,
      custom: (value: string) => {
        // Vérifier que le contenu HTML n'est pas vide après sanitisation
        const sanitized = sanitizeHTML(value)
        if (sanitized.trim().length < 50) {
          return 'Le contenu doit contenir au moins 50 caractères valides'
        }
        return true
      }
    },
    featuredImage: {
      required: false,
      pattern: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i
    }
  },

  // Schéma pour la mise à jour d'articles
  updateArticle: {
    title: {
      required: false,
      minLength: 3,
      maxLength: 255,
      pattern: /^[a-zA-ZÀ-ÿ0-9\s\-_.,!?()'"]+$/
    },
    excerpt: {
      required: false,
      minLength: 10,
      maxLength: 500
    },
    content: {
      required: false,
      minLength: 50
    },
    featuredImage: {
      required: false,
      pattern: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i
    },
    status: {
      required: false,
      pattern: /^(DRAFT|PENDING|PUBLISHED|REJECTED)$/
    }
  },

  // Schéma pour l'authentification
  login: {
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password: {
      required: true,
      minLength: 6
    }
  }
}

/**
 * Valide un fichier uploadé
 */
export function validateFile(file: File): { isValid: boolean; error?: string } {
  // Types MIME autorisés
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ]

  // Taille maximale (5MB)
  const maxSize = 5 * 1024 * 1024

  // Vérifier le type
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Type de fichier non autorisé' }
  }

  // Vérifier la taille
  if (file.size > maxSize) {
    return { isValid: false, error: 'Fichier trop volumineux (max 5MB)' }
  }

  // Vérifier le nom du fichier
  const fileName = file.name.toLowerCase()
  if (!/^[a-z0-9\-_\.]+\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)) {
    return { isValid: false, error: 'Nom de fichier invalide' }
  }

  return { isValid: true }
} 