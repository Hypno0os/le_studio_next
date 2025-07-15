export default function Offres() {
  const plans = [
    {
      name: 'Découverte',
      price: '29',
      period: 'mois',
      description: 'Parfait pour commencer votre aventure fitness',
      features: [
        'Accès illimité à la salle',
        'Cours collectifs inclus',
        'Accompagnement initial',
        'Évaluation fitness gratuite',
        'Accès aux vestiaires'
      ],
      popular: false,
      color: 'bg-gray-100'
    },
    {
      name: 'Premium',
      price: '59',
      period: 'mois',
      description: 'Notre formule la plus populaire avec coaching inclus',
      features: [
        'Tout du plan Découverte',
        '1 séance de coaching personnel/mois',
        'Accès aux cours spécialisés',
        'Suivi nutritionnel',
        'Accès à l\'app mobile',
        'Réservation prioritaire'
      ],
      popular: true,
      color: 'bg-yellow-500'
    },
    {
      name: 'Elite',
      price: '99',
      period: 'mois',
      description: 'L\'expérience fitness ultime avec coaching intensif',
      features: [
        'Tout du plan Premium',
        '3 séances de coaching personnel/mois',
        'Programme nutritionnel personnalisé',
        'Accès 24h/24',
        'Équipements premium',
        'Séances privées incluses',
        'Suivi mensuel détaillé'
      ],
      popular: false,
      color: 'bg-gray-900'
    }
  ]

  const services = [
    {
      name: 'Coaching Personnel',
      price: '45',
      description: 'Séance individuelle avec un coach certifié',
      duration: '1h'
    },
    {
      name: 'Pack 10 séances',
      price: '400',
      description: 'Économisez avec notre pack coaching',
      duration: '10h'
    },
    {
      name: 'Évaluation Fitness',
      price: '25',
      description: 'Bilan complet de votre condition physique',
      duration: '45min'
    },
    {
      name: 'Programme Nutrition',
      price: '80',
      description: 'Plan alimentaire personnalisé sur 3 mois',
      duration: '3 mois'
    }
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
          Nos Offres & Tarifs
        </h1>
        
        <p className="text-lg text-center text-gray-600 mb-16 max-w-3xl mx-auto">
          Choisissez l'abonnement qui correspond le mieux à vos objectifs 
          et votre budget. Tous nos abonnements incluent l'accès à nos équipements premium.
        </p>

        {/* Abonnements */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Abonnements
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative rounded-lg shadow-lg overflow-hidden ${
                  plan.popular ? 'ring-4 ring-yellow-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-yellow-500 text-gray-900 px-4 py-2 rounded-full text-sm font-semibold">
                      Le plus populaire
                    </span>
                  </div>
                )}
                
                <div className={`${plan.color} p-8 text-center`}>
                  <h3 className="text-2xl font-bold mb-2 text-gray-800">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-800">{plan.price}€</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                  <p className="text-gray-600 mb-6">
                    {plan.description}
                  </p>
                </div>
                
                <div className="bg-white p-8">
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    plan.popular 
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900' 
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}>
                    Choisir ce plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Services à la carte */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Services à la carte
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 text-center">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                  {service.name}
                </h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-yellow-500">{service.price}€</span>
                  <span className="text-gray-600 text-sm">/{service.duration}</span>
                </div>
                <p className="text-gray-600 mb-6">
                  {service.description}
                </p>
                <button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                  Réserver
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center bg-gray-900 text-white rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à commencer ?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Rejoignez Le Studio dès aujourd'hui et transformez votre vie 
            avec nos programmes d'entraînement personnalisés.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-3 px-8 rounded-lg transition-colors">
              Réserver un essai gratuit
            </button>
            <button className="border-2 border-white hover:bg-white hover:text-gray-900 font-semibold py-3 px-8 rounded-lg transition-colors">
              Nous contacter
            </button>
          </div>
        </div>
      </div>
    </main>
  )
} 