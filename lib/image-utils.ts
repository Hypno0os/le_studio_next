export interface ImageFormats {
  original: string
  large: string
  medium: string
  thumbnail: string
}

export interface ImageMetadata {
  width: number
  height: number
  format: string
}

export interface UploadedImage {
  location: string
  urls: ImageFormats
  metadata: ImageMetadata
}

/**
 * Génère les URLs pour les différents formats d'image
 */
export function getImageUrls(fileName: string, baseUrl: string = '/uploads'): ImageFormats {
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '')
  
  return {
    original: `${baseUrl}/original/${fileName}`,
    large: `${baseUrl}/large/${nameWithoutExt}.webp`,
    medium: `${baseUrl}/medium/${nameWithoutExt}.webp`,
    thumbnail: `${baseUrl}/thumbnails/${nameWithoutExt}.webp`
  }
}

/**
 * Retourne l'URL appropriée selon le contexte d'utilisation
 */
export function getImageUrlForContext(
  imageUrls: ImageFormats | string,
  context: 'thumbnail' | 'medium' | 'large' | 'original' = 'medium'
): string {
  if (typeof imageUrls === 'string') {
    return imageUrls
  }
  
  return imageUrls[context]
}

/**
 * Valide un fichier image
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Type de fichier non autorisé' }
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Fichier trop volumineux (max 5MB)' }
  }

  return { valid: true }
} 