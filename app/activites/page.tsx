export default function Activites() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
          Nos Activités
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* CrossFit */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-48 bg-orange-500 flex items-center justify-center">
              <span className="text-white text-6xl">💪</span>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-4">CrossFit</h3>
              <p className="text-gray-600 mb-4">
                Entraînement fonctionnel de haute intensité qui combine force, 
                cardio et gymnastique pour un développement physique complet.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Cours pour tous niveaux</li>
                <li>• Équipements professionnels</li>
                <li>• Coachs certifiés</li>
              </ul>
            </div>
          </div>

          {/* Cycling */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-48 bg-blue-500 flex items-center justify-center">
              <span className="text-white text-6xl">🚴</span>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-4">Cycling</h3>
              <p className="text-gray-600 mb-4">
                Cardio-training en groupe sur vélos stationnaires avec 
                musique motivante et coachs passionnés.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Sessions de 45 minutes</li>
                <li>• Musique énergisante</li>
                <li>• Brûlage de calories optimal</li>
              </ul>
            </div>
          </div>

          {/* Coaching Personnel */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-48 bg-green-500 flex items-center justify-center">
              <span className="text-white text-6xl">👨‍🏫</span>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-4">Coaching Personnel</h3>
              <p className="text-gray-600 mb-4">
                Accompagnement personnalisé pour atteindre vos objectifs 
                fitness avec un programme sur mesure.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Programme personnalisé</li>
                <li>• Suivi nutritionnel</li>
                <li>• Objectifs adaptés</li>
              </ul>
            </div>
          </div>

          {/* Functional Training */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-48 bg-purple-500 flex items-center justify-center">
              <span className="text-white text-6xl">🏃</span>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-4">Entraînement Fonctionnel</h3>
              <p className="text-gray-600 mb-4">
                Exercices qui reproduisent les mouvements de la vie quotidienne 
                pour améliorer force et mobilité.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Mouvements naturels</li>
                <li>• Amélioration de la posture</li>
                <li>• Prévention des blessures</li>
              </ul>
            </div>
          </div>

          {/* Yoga */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-48 bg-pink-500 flex items-center justify-center">
              <span className="text-white text-6xl">🧘</span>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-4">Yoga</h3>
              <p className="text-gray-600 mb-4">
                Pratique millénaire pour équilibrer corps et esprit, 
                améliorer la flexibilité et réduire le stress.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Cours pour débutants</li>
                <li>• Relaxation et méditation</li>
                <li>• Flexibilité et équilibre</li>
              </ul>
            </div>
          </div>

          {/* Pilates */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-48 bg-teal-500 flex items-center justify-center">
              <span className="text-white text-6xl">🤸</span>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-4">Pilates</h3>
              <p className="text-gray-600 mb-4">
                Méthode douce qui renforce les muscles profonds et 
                améliore la posture et la coordination.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Renforcement profond</li>
                <li>• Amélioration de la posture</li>
                <li>• Rééducation possible</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 