import '../styles/index.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main
        className="flex-1 relative"
        style={{
          backgroundImage: "url('/resources/marmurphotos/marmur2.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#3B82F6',
        }}
      >
        <div className="absolute inset-0 bg-black/30 mix-blend-multiply" aria-hidden="true" />
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-6 py-16 flex items-center justify-center min-h-[calc(100vh-200px)]">

            <div className="w-full max-w-md">
              {/* Login Card */}
              <div className="bg-white rounded-2xl shadow-2xl p-8">
              
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Witaj ponownie
                </h1>
                <p className="text-gray-600">
                  Zaloguj się do swojego konta AuctionHub
                </p>
              </div>

              {/* Login Form */}
              <form className="space-y-6">
                
                {/* Email Field */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Adres e-mail
                  </label>
                  <input
                    type="email"
                    placeholder="mail@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Hasło
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Zapamiętaj mnie</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium transition"
                  >
                    Zapomniałeś hasła?
                  </Link>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition"
                >
                  Zaloguj się
                </button>
              </form>

              {/* Register Link */}
              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Nie masz jeszcze konta?{' '}
                  <Link
                    to="/register"
                    className="text-blue-600 hover:text-blue-800 font-semibold transition"
                  >
                    Zarejestruj się
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
