import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/index.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    passwordConfirm: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const validateForm = () => {
    // Username validation
    if (!formData.username) {
      setError('Nazwa użytkownika jest wymagana');
      return false;
    }
    if (formData.username.length < 3) {
      setError('Nazwa użytkownika musi mieć co najmniej 3 znaki');
      return false;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      setError('Nazwa użytkownika może zawierać tylko litery, cyfry, _ i -');
      return false;
    }

    // Email validation
    if (!formData.email) {
      setError('Email jest wymagany');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Podaj prawidłowy adres email');
      return false;
    }

    // Password validation
    if (!formData.password) {
      setError('Hasło jest wymagane');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Hasło musi mieć co najmniej 8 znaków');
      return false;
    }

    // Password confirmation
    if (formData.password !== formData.passwordConfirm) {
      setError('Hasła nie są identyczne');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare data for API (exclude passwordConfirm)
      const { passwordConfirm, ...userData } = formData;

      const result = await register(userData);

      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Błąd rejestracji');
      }
    } catch (err) {
      setError('Wystąpił błąd podczas rejestracji. Spróbuj ponownie.');
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
          backgroundImage: "url('/resources/marmurphotos/marmur_final.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#3B82F6',
        }}
      >
        <div className="absolute inset-0 bg-black/30 mix-blend-multiply" aria-hidden="true" />
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-6 py-16 flex items-center justify-center min-h-[calc(100vh-200px)]">

            <div className="w-full max-w-2xl">
              {/* Register Card */}
              <div className="bg-white rounded-2xl shadow-2xl p-8">

                {/* Header */}
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Dołącz do AuctionHub
                  </h1>
                  <p className="text-gray-600">
                    Utwórz konto i zacznij licytować
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {/* Register Form */}
                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* Username Field */}
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Nazwa użytkownika <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="np. jankowalski123"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      disabled={loading}
                      autoComplete="username"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Min. 3 znaki, tylko litery, cyfry, _ i -
                    </p>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Adres e-mail <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="twoj@email.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      disabled={loading}
                      autoComplete="email"
                    />
                  </div>

                  {/* Name Fields Row */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Imię
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Jan"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        disabled={loading}
                        autoComplete="given-name"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Nazwisko
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Kowalski"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        disabled={loading}
                        autoComplete="family-name"
                      />
                    </div>
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Numer telefonu
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+48 123 456 789"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      disabled={loading}
                      autoComplete="tel"
                    />
                  </div>

                  {/* Password Fields Row */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Hasło <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        disabled={loading}
                        autoComplete="new-password"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Min. 8 znaków
                      </p>
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Potwierdź hasło <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="passwordConfirm"
                        value={formData.passwordConfirm}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        disabled={loading}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  {/* Register Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition disabled:bg-blue-400 disabled:cursor-not-allowed"
                    style={{ backgroundColor: loading ? '#60a5fa' : '#2563eb', color: '#ffffff' }}
                  >
                    {loading ? 'Tworzenie konta...' : 'Utwórz konto'}
                  </button>
                </form>

                {/* Login Link */}
                <div className="mt-8 text-center">
                  <p className="text-gray-600">
                    Masz już konto?{' '}
                    <Link
                      to="/login"
                      className="text-blue-500 hover:text-blue-800 font-semibold transition"
                    >
                      Zaloguj się
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
