import '../styles/index.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'

export default function RegisterPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-700">
        <div className="max-w-7xl mx-auto px-6 py-16 flex items-center justify-center min-h-[calc(100vh-200px)]">
          
          <div className="w-full max-w-2xl">
            {/* Register Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Dołącz do AuctionHub
                </h1>
              </div>

              {/* Register Form */}
              <form className="space-y-6">
                
                {/* Name Fields Row */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Imię
                    </label>
                    <input
                      type="text"
                      placeholder="Jan"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Nazwisko
                    </label>
                    <input
                      type="text"
                      placeholder="Kowalski"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Adres e-mail
                  </label>
                  <input
                    type="email"
                    placeholder="twoj@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Numer telefonu
                  </label>
                  <input
                    type="tel"
                    placeholder="+48 123 456 789"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                {/* Password Fields Row */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Hasło
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Min. 8 znaków, w tym cyfry i znaki specjalne
                    </p>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Potwierdź hasło
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Account Type Selection */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-3">
                    Typ konta
                  </label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <label className="relative flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
                      <input
                        type="radio"
                        name="accountType"
                        value="buyer"
                        defaultChecked
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-semibold text-gray-900">
                          🛍️ Kupujący
                        </span>
                        <span className="block text-xs text-gray-500">
                          Licytuj i kupuj przedmioty
                        </span>
                      </div>
                    </label>

                    <label className="relative flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
                      <input
                        type="radio"
                        name="accountType"
                        value="seller"
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-semibold text-gray-900">
                          🏛️ Sprzedający
                        </span>
                        <span className="block text-xs text-gray-500">
                          Sprzedawaj i organizuj aukcje
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
                {/* Register Button */}
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition"
                >
                  Utwórz konto
                </button>
              </form>
              {/* Login Link */}
              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Masz już konto?{' '}
                  <Link
                    to="/login"
                    className="text-blue-600 hover:text-blue-800 font-semibold transition"
                  >
                    Zaloguj się
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
