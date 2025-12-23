import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auctionAPI } from '../services/api'
import { AuthContext } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../styles/index.css'

export default function CreateAuction() {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [categories, setCategories] = useState([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    startingPrice: '',
    bidIncrement: 100,
    reservePrice: '',
    buyNowPrice: '',
    startTime: new Date().toISOString().slice(0, 16),
    endTime: '',
    images: '',
    model3D: '',
    condition: '',
    auctionHouse: {
      name: '',
      location: '',
      contact: '',
      website: '',
      description: ''
    }
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchCategories()
  }, [user, navigate])

  const fetchCategories = async () => {
    try {
      const response = await auctionAPI.getCategories()
      if (response.success) {
        setCategories(response.data.map(cat => cat.name))
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('auctionHouse.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        auctionHouse: {
          ...prev.auctionHouse,
          [field]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const startingPrice = parseFloat(formData.startingPrice)

      const auctionData = {
        ...formData,
        startingPrice: startingPrice,
        currentPrice: startingPrice, // Explicitly set currentPrice to startingPrice
        bidIncrement: parseFloat(formData.bidIncrement),
        reservePrice: formData.reservePrice ? parseFloat(formData.reservePrice) : undefined,
        buyNowPrice: formData.buyNowPrice ? parseFloat(formData.buyNowPrice) : undefined,
        images: formData.images ? formData.images.split('\n').filter(url => url.trim()) : [],
        status: 'active'
      }

      const response = await auctionAPI.createAuction(auctionData)
      if (response.success) {
        setSuccess(true)
        setTimeout(() => {
          navigate(`/auction/${response.data._id}`)
        }, 2000)
      }
    } catch (err) {
      console.error('Create auction error:', err)
      setError(err.message || 'Błąd podczas tworzenia aukcji')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="relative flex flex-col min-h-screen"
      style={{
        backgroundImage: "url('/resources/marmurphotos/marmur7.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#3B82F6',
      }}
    >
      <Navbar />
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h1 className="text-4xl font-bold text-white mb-8">Utwórz Nową Aukcję</h1>

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              Aukcja została utworzona pomyślnie! Przekierowywanie...
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-md rounded-xl p-8 shadow-lg space-y-6">
            {/* Podstawowe informacje */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Podstawowe Informacje</h2>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Tytuł Aukcji *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Wprowadź tytuł aukcji"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Opis *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Szczegółowy opis przedmiotu"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Kategoria *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Wybierz kategorię</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Stan
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Wybierz stan</option>
                    <option value="Nowy">Nowy</option>
                    <option value="Bardzo dobry">Bardzo dobry</option>
                    <option value="Dobry">Dobry</option>
                    <option value="Zadowalający">Zadowalający</option>
                    <option value="Do renowacji">Do renowacji</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Ceny i Licytacja */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Ceny i Licytacja</h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Cena Wywoławcza (zł) *
                  </label>
                  <input
                    type="number"
                    name="startingPrice"
                    value={formData.startingPrice}
                    onChange={handleChange}
                    required
                    min="0"
                    step="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Minimalne Postąpienie (zł) *
                  </label>
                  <input
                    type="number"
                    name="bidIncrement"
                    value={formData.bidIncrement}
                    onChange={handleChange}
                    required
                    min="1"
                    step="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Cena Minimalna (zł)
                  </label>
                  <input
                    type="number"
                    name="reservePrice"
                    value={formData.reservePrice}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Opcjonalne"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Cena Kup Teraz (zł)
                  </label>
                  <input
                    type="number"
                    name="buyNowPrice"
                    value={formData.buyNowPrice}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Opcjonalne"
                  />
                </div>
              </div>
            </div>

            {/* Czas trwania */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Czas Trwania</h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Data Rozpoczęcia *
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Data Zakończenia *
                  </label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Media */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Media</h2>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  URL Obrazów (każdy w nowej linii)
                </label>
                <textarea
                  name="images"
                  value={formData.images}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  URL Modelu 3D
                </label>
                <input
                  type="text"
                  name="model3D"
                  value={formData.model3D}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="https://example.com/model.gltf"
                />
              </div>
            </div>

            {/* Dom Aukcyjny (Opcjonalnie) */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Dom Aukcyjny (Opcjonalnie)</h2>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Nazwa Domu Aukcyjnego
                </label>
                <input
                  type="text"
                  name="auctionHouse.name"
                  value={formData.auctionHouse.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Lokalizacja
                  </label>
                  <input
                    type="text"
                    name="auctionHouse.location"
                    value={formData.auctionHouse.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Kontakt
                  </label>
                  <input
                    type="text"
                    name="auctionHouse.contact"
                    value={formData.auctionHouse.contact}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Strona WWW
                </label>
                <input
                  type="text"
                  name="auctionHouse.website"
                  value={formData.auctionHouse.website}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Opis Domu Aukcyjnego
                </label>
                <textarea
                  name="auctionHouse.description"
                  value={formData.auctionHouse.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
              >
                {loading ? 'Tworzenie...' : 'Utwórz Aukcję'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/auctions')}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition"
              >
                Anuluj
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  )
}
