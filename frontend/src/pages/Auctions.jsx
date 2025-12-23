import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/index.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AuctionCard from '../components/AuctionCard'
import { auctionAPI } from '../services/api'

export default function Auctions() {
  const navigate = useNavigate()
  const [auctions, setAuctions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    category: '',
    sortBy: 'endTime',
    sortOrder: 'asc',
    page: 1,
    limit: 20
  })
  const [categories, setCategories] = useState([])
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchAuctions()
  }, [filters])

  const fetchCategories = async () => {
    try {
      const response = await auctionAPI.getCategories()
      if (response.success) {
        setCategories(response.data)
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const fetchAuctions = async () => {
    try {
      setLoading(true)
      const params = {
        ...filters,
        status: 'active'
      }
      const response = await auctionAPI.getAllAuctions(params)
      if (response.success) {
        setAuctions(response.data)
        setTotalPages(response.totalPages)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (category) => {
    setFilters(prev => ({ ...prev, category: category === prev.category ? '' : category, page: 1 }))
  }

  const handleSortChange = (sortBy) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1
    }))
  }

  const formatTimeRemaining = (endTime) => {
    const now = new Date()
    const end = new Date(endTime)
    const diff = end - now

    if (diff <= 0) return 'Zakończona'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
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
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-white mb-8">Aktywne Aukcje</h1>

          {/* Filters */}
          <div className="bg-white/30 backdrop-blur-md rounded-xl p-6 mb-8 shadow-lg">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-3">Kategorie</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => handleCategoryChange(cat.name)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      filters.category === cat.name
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/40 text-gray-800 hover:bg-white/60'
                    }`}
                  >
                    {cat.name} ({cat.count})
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <label className="text-white font-semibold">Sortuj:</label>
              <button
                onClick={() => handleSortChange('endTime')}
                className="px-4 py-2 rounded-lg bg-white/40 hover:bg-white/60 font-medium text-gray-800 transition"
              >
                Czas zakończenia {filters.sortBy === 'endTime' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => handleSortChange('currentPrice')}
                className="px-4 py-2 rounded-lg bg-white/40 hover:bg-white/60 font-medium text-gray-800 transition"
              >
                Cena {filters.sortBy === 'currentPrice' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => handleSortChange('totalBids')}
                className="px-4 py-2 rounded-lg bg-white/40 hover:bg-white/60 font-medium text-gray-800 transition"
              >
                Liczba ofert {filters.sortBy === 'totalBids' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </button>
            </div>
          </div>

          {/* Auctions Grid */}
          {loading ? (
            <div className="text-center text-white text-xl py-20">Ładowanie aukcji...</div>
          ) : error ? (
            <div className="text-center text-red-500 text-xl py-20">Błąd: {error}</div>
          ) : auctions.length === 0 ? (
            <div className="text-center text-white text-xl py-20">Brak aktywnych aukcji</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {auctions.map((auction) => (
                  <div key={auction._id} className="transform transition hover:scale-105">
                    <AuctionCard
                      image={auction.images && auction.images[0]}
                      title={auction.title}
                      description={
                        <div>
                          <p className="text-lg font-bold text-green-400 mb-2">
                            {auction.currentPrice.toLocaleString('pl-PL')} zł
                          </p>
                          <p className="text-sm text-gray-300">
                            Ofert: {auction.totalBids}
                          </p>
                          <p className="text-sm text-gray-300">
                            Czas: {formatTimeRemaining(auction.endTime)}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {auction.category}
                          </p>
                        </div>
                      }
                      onBid={() => navigate(`/auction/${auction._id}`)}
                      buttonText="Zobacz aukcję"
                    />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={filters.page === 1}
                    className="px-4 py-2 rounded-lg bg-white/40 hover:bg-white/60 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-800"
                  >
                    Poprzednia
                  </button>
                  <span className="px-4 py-2 text-white font-semibold">
                    Strona {filters.page} z {totalPages}
                  </span>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
                    disabled={filters.page === totalPages}
                    className="px-4 py-2 rounded-lg bg-white/40 hover:bg-white/60 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-800"
                  >
                    Następna
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}