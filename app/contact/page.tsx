export default function Contact() {
  return (
    <main className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-12 text-white">
          Contactez-nous
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Informations de contact */}
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-white">
              Informations
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-900 text-sm">📍</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Adresse</h3>
                  <p className="text-gray-300">
                    123 Avenue de la Plage<br />
                    64200 Biarritz, France
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-900 text-sm">📞</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Téléphone</h3>
                  <p className="text-gray-300">05 59 12 34 56</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-900 text-sm">✉️</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Email</h3>
                  <p className="text-gray-300">contact@lestudiosport-biarritz.fr</p>
                </div>
              </div>
            </div>

            {/* Horaires d'ouverture */}
            <div className="mt-12">
              <h2 className="text-2xl font-semibold mb-6 text-white">
                Horaires d'ouverture
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Lundi - Vendredi</span>
                  <span className="text-yellow-500 font-semibold">6h00 - 22h00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Samedi</span>
                  <span className="text-yellow-500 font-semibold">8h00 - 20h00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Dimanche</span>
                  <span className="text-yellow-500 font-semibold">9h00 - 18h00</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Formulaire de contact */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6 text-white">
              Envoyez-nous un message
            </h2>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                    required
                    placeholder="Votre prénom"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                    required
                    placeholder="Votre nom"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                  required
                  placeholder="votre@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                  placeholder="06 12 34 56 78"
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                  Sujet *
                </label>
                <select
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-gray-700 text-white"
                  required
                >
                  <option value="">Choisissez un sujet</option>
                  <option value="reservation">Réservation séance d'essai</option>
                  <option value="tarifs">Demande de tarifs</option>
                  <option value="coaching">Coaching personnel</option>
                  <option value="horaires">Horaires et planning</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                  placeholder="Votre message..."
                  required
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Envoyer le message
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
} 