import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/index.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    credential: '',
    password: '',
    rememberMe: false
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.credential || !formData.password) {
      setError('Podaj email/username i hasło');
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData.credential, formData.password);

      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Błąd logowania');
      }
    } catch (err) {
      setError('Wystąpił błąd podczas logowania. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

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

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* Email/Username Field */}
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Email lub Nazwa użytkownika
                    </label>
                    <input
                      type="text"
                      name="credential"
                      value={formData.credential}
                      onChange={handleChange}
                      placeholder="mail@email.com lub username"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      disabled={loading}
                      autoComplete="username"
                    />
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Hasło
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      disabled={loading}
                      autoComplete="current-password"
                    />
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        disabled={loading}
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
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Logowanie...' : 'Zaloguj się'}
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
  );
}
