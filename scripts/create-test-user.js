const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    // Vérifier si l'utilisateur de test existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    })

    if (existingUser) {
      console.log('✅ Utilisateur de test existe déjà:', existingUser.email)
      return
    }

    // Créer le mot de passe hashé
    const hashedPassword = await bcrypt.hash('test123', 12)

    // Créer l'utilisateur de test
    const testUser = await prisma.user.create({
      data: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'USER',
        status: 'ACTIVE'
      }
    })

    console.log('✅ Utilisateur de test créé avec succès:')
    console.log('   Email:', testUser.email)
    console.log('   Nom:', `${testUser.firstName} ${testUser.lastName}`)
    console.log('   Rôle:', testUser.role)
    console.log('   Mot de passe: test123')

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur de test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser() 