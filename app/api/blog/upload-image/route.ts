import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'
import { validateFile } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { message: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // Validation du fichier
    const fileValidation = validateFile(file)
    if (!fileValidation.isValid) {
      return NextResponse.json(
        { message: fileValidation.error },
        { status: 400 }
      )
    }

    // Génération du nom de fichier unique et sécurisé
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const fileName = `${uuidv4()}.${fileExtension}`
    
    // Création des dossiers uploads s'ils n'existent pas
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    const originalDir = join(uploadsDir, 'original')
    const largeDir = join(uploadsDir, 'large')
    const mediumDir = join(uploadsDir, 'medium')
    const thumbnailsDir = join(uploadsDir, 'thumbnails')

    await mkdir(originalDir, { recursive: true })
    await mkdir(largeDir, { recursive: true })
    await mkdir(mediumDir, { recursive: true })
    await mkdir(thumbnailsDir, { recursive: true })

    // Conversion du fichier en buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Chemin des fichiers
    const originalPath = join(originalDir, fileName)
    const largePath = join(largeDir, fileName)
    const mediumPath = join(mediumDir, fileName)
    const thumbnailPath = join(thumbnailsDir, fileName)

    // Sauvegarde du fichier original
    await writeFile(originalPath, buffer)

    // Redimensionnement avec Sharp
    const image = sharp(buffer)
    const metadata = await image.metadata()

    // Vérification des dimensions minimales
    if (metadata.width && metadata.width < 100 || metadata.height && metadata.height < 100) {
      return NextResponse.json(
        { message: 'Image trop petite (minimum 100x100px)' },
        { status: 400 }
      )
    }

    // Génération des formats multiples
    await Promise.all([
      // Large (800x600)
      image
        .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(largePath.replace(/\.[^/.]+$/, '.webp')),
      
      // Medium (400x300)
      image
        .resize(400, 300, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(mediumPath.replace(/\.[^/.]+$/, '.webp')),
      
      // Thumbnail (150x150)
      image
        .resize(150, 150, { fit: 'cover', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(thumbnailPath.replace(/\.[^/.]+$/, '.webp'))
    ])

    // URLs publiques des fichiers (toujours absolues)
    const baseUrl = '/uploads'
    const imageUrls = {
      original: `${baseUrl}/original/${fileName}`,
      large: `${baseUrl}/large/${fileName.replace(/\.[^/.]+$/, '.webp')}`,
      medium: `${baseUrl}/medium/${fileName.replace(/\.[^/.]+$/, '.webp')}`,
      thumbnail: `${baseUrl}/thumbnails/${fileName.replace(/\.[^/.]+$/, '.webp')}`
    }

    // S'assurer que l'URL retournée est absolue
    const returnUrl = imageUrls.medium.startsWith('/') ? imageUrls.medium : `/${imageUrls.medium}`

    return NextResponse.json({
      location: returnUrl, // URL par défaut pour TinyMCE (toujours absolue)
      urls: imageUrls,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format
      },
      message: 'Image uploadée et redimensionnée avec succès'
    })

  } catch (error) {
    console.error('Erreur upload image:', error)
    return NextResponse.json(
      { message: 'Erreur lors de l\'upload de l\'image' },
      { status: 500 }
    )
  }
} 