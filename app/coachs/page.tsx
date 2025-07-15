import Image from 'next/image'

const coaches = [
  {
    id: 1,
    name: 'Bastien',
    role: 'Coach CrossFit',
    specialty: 'Entraînement fonctionnel',
    description: 'Coach certifié CrossFit avec plus de 5 ans d\'expérience. Spécialisé dans l\'entraînement fonctionnel et la préparation physique.',
    image: '/assets/img/gallery/coach/bastien-coach-fitness-biarritz-cote-basque.jpg',
    certifications: ['CrossFit Level 2', 'Entraîneur sportif'],
    experience: '5+ ans'
  },
  {
    id: 2,
    name: 'Julie',
    role: 'Coach Fitness',
    specialty: 'Musculation & Cardio',
    description: 'Passionnée de fitness, Julie vous accompagne dans vos objectifs de remise en forme et de musculation.',
    image: '/assets/img/gallery/coach/julie-coach-fitness-biarritz.jpg',
    certifications: ['BPJEPS Fitness', 'Nutrition sportive'],
    experience: '3+ ans'
  },
  {
    id: 3,
    name: 'Julien',
    role: 'Coach Personnel',
    specialty: 'Coaching sur mesure',
    description: 'Spécialiste du coaching personnel, Julien crée des programmes adaptés à vos objectifs et votre niveau.',
    image: '/assets/img/gallery/coach/julien-coach-biarritz-fitness-studio-sport.jpg',
    certifications: ['Coach personnel certifié', 'Rééducation sportive'],
    experience: '7+ ans'
  },
  {
    id: 4,
    name: 'Elise',
    role: 'Coach Cycling',
    specialty: 'Cardio-training',
    description: 'Énergique et motivante, Elise anime les cours de cycling avec passion et dynamisme.',
    image: '/assets/img/gallery/coach/elise-coach-biarritz-salle-de-sport.jpg',
    certifications: ['Instructeur Cycling', 'Coach cardio'],
    experience: '4+ ans'
  },
  {
    id: 5,
    name: 'Martial',
    role: 'Coach CrossFit',
    specialty: 'Force & Conditionnement',
    description: 'Expert en force et conditionnement, Martial vous pousse à dépasser vos limites en toute sécurité.',
    image: '/assets/img/gallery/coach/martial-coach-crossfit-biarritz.jpg',
    certifications: ['CrossFit Level 1', 'Préparateur physique'],
    experience: '6+ ans'
  }
]

export default function Coachs() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
          Notre Équipe de Coachs
        </h1>
        
        <p className="text-lg text-center text-gray-600 mb-16 max-w-3xl mx-auto">
          Découvrez notre équipe de coachs passionnés et certifiés, 
          prêts à vous accompagner dans l'atteinte de vos objectifs fitness.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coaches.map((coach) => (
            <div key={coach.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative h-64">
                <Image
                  src={coach.image}
                  alt={`${coach.name} - ${coach.role}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">{coach.name}</h3>
                  <p className="text-yellow-400">{coach.role}</p>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <span className="inline-block bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full mb-2">
                    {coach.specialty}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">
                  {coach.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-semibold mr-2">Expérience:</span>
                    <span>{coach.experience}</span>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    <span className="font-semibold">Certifications:</span>
                    <ul className="mt-1 space-y-1">
                      {coach.certifications.map((cert, index) => (
                        <li key={index} className="ml-4">• {cert}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <button className="w-full mt-6 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors">
                  Réserver un cours
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Rejoignez notre équipe
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Vous êtes coach passionné et vous souhaitez rejoindre notre équipe ? 
            Contactez-nous pour discuter des opportunités.
          </p>
          <button className="bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
            Postuler comme coach
          </button>
        </div>
      </div>
    </main>
  )
} 