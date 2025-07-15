import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
        <div className="relative z-20 text-center text-white">
          <h1 className="text-6xl font-bold mb-6">
            Le Studio
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-300">
            Votre salle de sport premium à Biarritz, Côte Basque
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/activites" 
              className="bg-yellow-500 hover:bg-yellow-600 px-8 py-3 rounded-lg font-semibold transition-colors text-gray-900"
            >
              Nos Activités
            </Link>
            <Link 
              href="/contact" 
              className="border-2 border-yellow-500 hover:bg-yellow-500 hover:text-gray-900 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Réserver
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-white">
            Nos Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg shadow-lg bg-gray-700">
              <div className="w-16 h-16 bg-yellow-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-gray-900 text-2xl">💪</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">CrossFit</h3>
              <p className="text-gray-300">
                Entraînement fonctionnel de haute intensité pour tous niveaux
              </p>
            </div>
            <div className="text-center p-6 rounded-lg shadow-lg bg-gray-700">
              <div className="w-16 h-16 bg-yellow-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-gray-900 text-2xl">🚴</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Cycling</h3>
              <p className="text-gray-300">
                Cardio-training en groupe avec nos coachs passionnés
              </p>
            </div>
            <div className="text-center p-6 rounded-lg shadow-lg bg-gray-700">
              <div className="w-16 h-16 bg-yellow-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-gray-900 text-2xl">👨‍🏫</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Coaching Personnel</h3>
              <p className="text-gray-300">
                Accompagnement personnalisé pour atteindre vos objectifs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-white">
                À propos du Studio
              </h2>
              <p className="text-lg text-gray-300 mb-6">
                Le Studio est votre salle de sport de référence à Biarritz. 
                Nous proposons un environnement moderne et convivial pour 
                tous vos entraînements fitness.
              </p>
              <p className="text-lg text-gray-300 mb-8">
                Notre équipe de coachs certifiés vous accompagne dans 
                l'atteinte de vos objectifs, que vous soyez débutant 
                ou sportif confirmé.
              </p>
              <Link 
                href="/coachs" 
                className="bg-yellow-500 hover:bg-yellow-600 px-8 py-3 rounded-lg font-semibold text-gray-900 transition-colors"
              >
                Rencontrer l'équipe
              </Link>
            </div>
            <div className="bg-gray-700 h-96 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-lg">Image du Studio</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-300">
            Rejoignez Le Studio dès aujourd'hui et transformez votre vie 
            avec nos programmes d'entraînement personnalisés.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/offres" 
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Voir les tarifs
            </Link>
            <Link 
              href="/contact" 
              className="border-2 border-yellow-500 hover:bg-yellow-500 hover:text-gray-900 font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
} 