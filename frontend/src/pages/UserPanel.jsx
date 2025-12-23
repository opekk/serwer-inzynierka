import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { auctionAPI, bidAPI } from '../services/api'
import { getYear } from '../utils/dateHelpers'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../styles/index.css'

export default function UserPanel() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [watchlist, setWatchlist] = useState([])
  const [recentBids, setRecentBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeBidsCount, setActiveBidsCount] = useState(0)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    fetchUserData()
  }, [isAuthenticated, navigate])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch watchlist
      const watchlistResponse = await auctionAPI.getMyWatchlist()
      if (watchlistResponse.success) {
        setWatchlist(watchlistResponse.data || [])
      }

      // Fetch recent bids
      const bidsResponse = await bidAPI.getMyBids({ limit: 10, sort: '-createdAt' })
      if (bidsResponse.success) {
        setRecentBids(bidsResponse.data || [])
      }

      // Fetch active bids count
      const activeBidsResponse = await bidAPI.getMyActiveBids()
      if (activeBidsResponse.success) {
        setActiveBidsCount(activeBidsResponse.data?.length || 0)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      setError(error.message || 'Błąd podczas pobierania danych użytkownika')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Ładowanie...</div>
      </div>
    )
  }

  // Get user initials
  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    }
    return user.username.substring(0, 2).toUpperCase()
  }

  // Get display name
  const getDisplayName = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    return user.username
  }

  // Calculate total spent (sum of won bids)
  const calculateTotalSpent = () => {
    const wonBids = recentBids.filter(bid => bid.status === 'won')
    return wonBids.reduce((sum, bid) => sum + bid.amount, 0)
  }

  return (
    <div
      className="relative flex flex-col min-h-screen"
      style={{
        backgroundImage: "url('/resources/marmurphotos/marmur_final.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#3B82F6',
      }}
    >
      <div className="absolute inset-0 bg-blue-900/25 mix-blend-multiply" aria-hidden="true" />
      <div className="relative z-10 flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 overflow-auto max-w-7xl mx-auto px-6 py-10 w-full">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        <div style={{ minHeight: 'calc(100vh - 260px)' }} className="w-full flex items-center justify-center py-24">
          <div className="w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="col-span-1">
            <div className="bg-white rounded-xl shadow p-6 sticky top-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-indigo-200 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                  {getInitials()}
                </div>
                <div>
                  <div className="text-lg font-bold">{getDisplayName()}</div>
                  <div className="text-sm text-gray-500">Członek od {getYear(user.createdAt)}</div>
                </div>
              </div>

              <nav className="mt-6 space-y-1">
                <a className="block px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-medium">Przegląd</a>
                <a className="block px-3 py-2 rounded-lg hover:bg-gray-100">Moje aukcje</a>
                <a className="block px-3 py-2 rounded-lg hover:bg-gray-100">Obserwowane</a>
                <a className="block px-3 py-2 rounded-lg hover:bg-gray-100">Wygrane</a>
                <a className="block px-3 py-2 rounded-lg hover:bg-gray-100">Płatności</a>
                <a className="block px-3 py-2 rounded-lg hover:bg-gray-100">Ustawienia</a>
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <section className="col-span-1 lg:col-span-3 space-y-6">
            {/* Header / stats (removed gradient) */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{getDisplayName()}</h1>
                  <p className="text-sm text-slate-600">
                    {user.email} • Członek od {getYear(user.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {user.isEmailVerified ? (
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm">Zweryfikowany</span>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm">Niezweryfikowany</span>
                  )}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-sm text-slate-600">Wygrane aukcje</div>
                  <div className="text-xl font-bold">{user.stats?.totalAuctionsWon || 0}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-sm text-slate-600">Aktywne licytacje</div>
                  <div className="text-xl font-bold">{loading ? '...' : activeBidsCount}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-sm text-slate-600">Obserwowane</div>
                  <div className="text-xl font-bold">{loading ? '...' : watchlist.length}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-sm text-slate-600">Łącznie wydane</div>
                  <div className="text-xl font-bold">
                    {loading ? '...' : `${calculateTotalSpent().toLocaleString('pl-PL')} zł`}
                  </div>
                </div>
              </div>
            </div>

            {/* Content row: recent activity + observed list */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Ostatnie aktywności</h3>
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Ładowanie...</div>
                ) : recentBids.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Brak aktywności</div>
                ) : (
                  <ul className="space-y-3">
                    {recentBids.slice(0, 5).map((bid) => (
                      <li key={bid._id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                        <div>
                          <div className="font-medium">{bid.auction?.title || 'Aukcja'}</div>
                          <div className="text-sm text-gray-500">
                            Twoja oferta: {bid.amount.toLocaleString('pl-PL')} zł
                          </div>
                        </div>
                        <div className={`font-semibold ${
                          bid.status === 'won'
                            ? 'text-green-600'
                            : bid.status === 'lost'
                            ? 'text-red-600'
                            : bid.isWinning
                            ? 'text-blue-600'
                            : 'text-gray-600'
                        }`}>
                          {bid.status === 'won'
                            ? 'WYGRANA'
                            : bid.status === 'lost'
                            ? 'PRZEGRANA'
                            : bid.isWinning
                            ? 'PROWADZISZ'
                            : 'PRZEBITA'}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Lista obserwowanych</h3>
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Ładowanie...</div>
                ) : watchlist.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Brak obserwowanych aukcji</div>
                ) : (
                  <ul className="space-y-3">
                    {watchlist.slice(0, 5).map((auction) => (
                      <li
                        key={auction._id}
                        className="p-3 bg-gray-50 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-100 transition"
                        onClick={() => navigate(`/auction/${auction._id}`)}
                      >
                        <div className="font-medium">{auction.title}</div>
                        <div className="text-slate-900 font-semibold">
                          {auction.currentPrice.toLocaleString('pl-PL')} zł
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        </div>
          </div>
        </div>
        </main>

        <Footer />
      </div>
    </div>
  )
}
