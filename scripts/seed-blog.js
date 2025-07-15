const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seeding...')

  // Créer les utilisateurs
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lestudiosport.fr' },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@lestudiosport.fr',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE'
    }
  })

  const moderator = await prisma.user.upsert({
    where: { email: 'mod@lestudiosport.fr' },
    update: {},
    create: {
      firstName: 'Moderator',
      lastName: 'User',
      email: 'mod@lestudiosport.fr',
      password: hashedPassword,
      role: 'MODERATOR',
      status: 'ACTIVE'
    }
  })

  const author = await prisma.user.upsert({
    where: { email: 'author@lestudiosport.fr' },
    update: {},
    create: {
      firstName: 'Bastien',
      lastName: 'Coach',
      email: 'author@lestudiosport.fr',
      password: hashedPassword,
      role: 'MODERATOR',
      status: 'ACTIVE'
    }
  })

  // Utilisateur de test pour les utilisateurs normaux
  const testUser = await prisma.user.upsert({
    where: { email: 'user@lestudiosport.fr' },
    update: {},
    create: {
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'user@lestudiosport.fr',
      password: hashedPassword,
      role: 'USER',
      status: 'ACTIVE'
    }
  })

  console.log('✅ Utilisateurs créés')

  // Créer les catégories
  const categories = await Promise.all([
    prisma.blogCategory.upsert({
      where: { slug: 'crossfit' },
      update: {},
      create: {
        name: 'CrossFit',
        slug: 'crossfit',
        description: 'Articles sur le CrossFit et l\'entraînement fonctionnel',
        color: '#E5C97B'
      }
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'nutrition' },
      update: {},
      create: {
        name: 'Nutrition',
        slug: 'nutrition',
        description: 'Conseils nutrition et alimentation sportive',
        color: '#4CAF50'
      }
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'coaching' },
      update: {},
      create: {
        name: 'Coaching',
        slug: 'coaching',
        description: 'Conseils et techniques de coaching',
        color: '#2196F3'
      }
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'actualites' },
      update: {},
      create: {
        name: 'Actualités',
        slug: 'actualites',
        description: 'Actualités du studio et du sport',
        color: '#FF9800'
      }
    })
  ])

  console.log('✅ Catégories créées')

  // Créer les articles
  const articles = await Promise.all([
    prisma.blogArticle.upsert({
      where: { slug: 'nouveau-cours-crossfit-debutants' },
      update: {},
      create: {
        title: 'Nouveau cours de CrossFit pour débutants',
        slug: 'nouveau-cours-crossfit-debutants',
        excerpt: 'Découvrez notre nouveau cours de CrossFit spécialement conçu pour les débutants. Une approche progressive et sécurisée pour découvrir cette discipline.',
        content: `
          <h2>Un cours adapté à tous les niveaux</h2>
          <p>Nous sommes ravis d'annoncer le lancement de notre nouveau cours de CrossFit pour débutants. Ce cours est spécialement conçu pour accueillir les nouveaux pratiquants et leur permettre de découvrir cette discipline de manière progressive et sécurisée.</p>
          
          <h3>Ce que vous apprendrez :</h3>
          <ul>
            <li>Les mouvements fondamentaux du CrossFit</li>
            <li>Les techniques de sécurité essentielles</li>
            <li>La progression adaptée à votre niveau</li>
            <li>L'importance de la récupération</li>
          </ul>
          
          <p>Nos coachs expérimentés vous accompagneront à chaque étape pour vous assurer une progression optimale tout en préservant votre santé.</p>
          
          <h3>Horaires du cours :</h3>
          <p>Mardi et Jeudi à 18h00<br>
          Samedi à 10h00</p>
        `,
        status: 'PUBLISHED',
        publishedAt: new Date('2024-01-15'),
        authorId: author.id,
        categories: {
          create: [
            { categoryId: categories[0].id }, // CrossFit
            { categoryId: categories[3].id }  // Actualités
          ]
        }
      }
    }),
    prisma.blogArticle.upsert({
      where: { slug: 'conseils-nutrition-performances' },
      update: {},
      create: {
        title: 'Conseils nutrition pour optimiser vos performances',
        slug: 'conseils-nutrition-performances',
        excerpt: 'Découvrez nos conseils nutrition pour optimiser vos performances sportives et améliorer votre récupération.',
        content: `
          <h2>L'importance de la nutrition dans la performance sportive</h2>
          <p>La nutrition joue un rôle crucial dans vos performances sportives. Une alimentation adaptée peut faire la différence entre un bon entraînement et un excellent entraînement.</p>
          
          <h3>Les macronutriments essentiels :</h3>
          <ul>
            <li><strong>Protéines :</strong> Essentielles pour la récupération musculaire</li>
            <li><strong>Glucides :</strong> Source d'énergie principale pour l'effort</li>
            <li><strong>Lipides :</strong> Importants pour la santé hormonale</li>
          </ul>
          
          <h3>Timing nutritionnel :</h3>
          <p>Lorsque vous mangez est aussi important que ce que vous mangez. Voici nos recommandations :</p>
          <ul>
            <li>2-3 heures avant l'entraînement : Repas complet</li>
            <li>30 minutes avant : Collation légère riche en glucides</li>
            <li>Dans les 30 minutes après : Protéines + glucides</li>
          </ul>
        `,
        status: 'PUBLISHED',
        publishedAt: new Date('2024-01-10'),
        authorId: author.id,
        categories: {
          create: [
            { categoryId: categories[1].id } // Nutrition
          ]
        }
      }
    }),
    prisma.blogArticle.upsert({
      where: { slug: 'functional-training-approche-moderne-fitness' },
      update: {},
      create: {
        title: 'Le Functional Training : Une approche moderne du fitness',
        slug: 'functional-training-approche-moderne-fitness',
        excerpt: 'Le Functional Training représente une approche moderne et efficace du fitness, basée sur des mouvements naturels et fonctionnels.',
        content: `
          <h2>Qu'est-ce que le Functional Training ?</h2>
          <p>Le Functional Training est une approche du fitness qui se concentre sur des mouvements naturels et fonctionnels, plutôt que sur l'isolation musculaire traditionnelle.</p>
          
          <h3>Les principes du Functional Training :</h3>
          <ul>
            <li>Mouvements multi-articulaires</li>
            <li>Stabilité et équilibre</li>
            <li>Transfert vers la vie quotidienne</li>
            <li>Prévention des blessures</li>
          </ul>
          
          <h3>Avantages du Functional Training :</h3>
          <p>Cette approche offre de nombreux avantages :</p>
          <ul>
            <li>Amélioration de la coordination</li>
            <li>Renforcement du core</li>
            <li>Meilleure posture</li>
            <li>Performance sportive optimisée</li>
          </ul>
          
          <p>Chez Le Studio Sport, nous intégrons ces principes dans tous nos cours pour vous offrir un entraînement efficace et sécurisé.</p>
        `,
        status: 'PUBLISHED',
        publishedAt: new Date('2024-01-05'),
        authorId: author.id,
        categories: {
          create: [
            { categoryId: categories[0].id }, // CrossFit
            { categoryId: categories[2].id }  // Coaching
          ]
        }
      }
    })
  ])

  console.log('✅ Articles créés')

  console.log('🎉 Seeding terminé avec succès !')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 