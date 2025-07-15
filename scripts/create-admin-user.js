const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    // Vérifier si l'utilisateur admin existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@lestudiosport.fr' }
    })

    if (existingUser) {
      console.log('✅ Utilisateur admin existe déjà:', existingUser.email)
      return
    }

    // Créer le mot de passe hashé
    const hashedPassword = await bcrypt.hash('admin123', 12)

    // Créer l'utilisateur admin
    const adminUser = await prisma.user.create({
      data: {
        firstName: 'Admin',
        lastName: 'Studio',
        email: 'admin@lestudiosport.fr',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    })

    console.log('✅ Utilisateur admin créé avec succès:')
    console.log('   Email:', adminUser.email)
    console.log('   Nom:', `${adminUser.firstName} ${adminUser.lastName}`)
    console.log('   Rôle:', adminUser.role)
    console.log('   Mot de passe: admin123')

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser() 