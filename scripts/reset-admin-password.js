const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function resetAdminPassword() {
  try {
    // Vérifier si l'utilisateur admin existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@lestudiosport.fr' }
    })

    if (!existingUser) {
      console.log('❌ Utilisateur admin non trouvé')
      return
    }

    console.log('👤 Utilisateur trouvé:', existingUser.email)

    // Créer un nouveau mot de passe hashé
    const newPassword = 'admin123'
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Mettre à jour le mot de passe
    const updatedUser = await prisma.user.update({
      where: { email: 'admin@lestudiosport.fr' },
      data: {
        password: hashedPassword
      }
    })

    console.log('✅ Mot de passe réinitialisé avec succès:')
    console.log('   Email:', updatedUser.email)
    console.log('   Nouveau mot de passe:', newPassword)
    console.log('   Hash généré:', hashedPassword.substring(0, 20) + '...')

    // Tester la vérification du mot de passe
    const isValid = await bcrypt.compare(newPassword, hashedPassword)
    console.log('   Test de vérification:', isValid ? '✅ OK' : '❌ ÉCHEC')

  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetAdminPassword() 