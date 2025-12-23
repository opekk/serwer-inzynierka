import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import '../styles/index.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WebGPUCanvas from '../components/WebGPUCanvas'
import { auctionAPI } from '../services/api'
import { AuthContext } from '../contexts/AuthContext'

export default function AuctionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [auction, setAuction] = useState(null)
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [bidAmount, setBidAmount] = useState(0)
  const [bidding, setBidding] = useState(false)
  const [bidError, setBidError] = useState(null)
  const [bidSuccess, setBidSuccess] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState('')
  const [isAuctionActive, setIsAuctionActive] = useState(true)
  const [refreshWarning, setRefreshWarning] = useState(false)

  useEffect(() => {
    if (id) {
      fetchAuction()
      fetchBids()
    }
  }, [id])

  useEffect(() => {
    if (auction) {
      setBidAmount(auction.currentPrice + auction.bidIncrement)

      // Update auction status and time remaining every second
      const interval = setInterval(() => {
        const remaining = formatTimeRemaining(auction.endTime)
        setTimeRemaining(remaining)
        setIsAuctionActive(new Date(auction.endTime) > new Date())
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [auction])

  const fetchAuction = async () => {
    try {
      setLoading(true)
      const response = await auctionAPI.getAuctionById(id)
      if (response.success) {
        setAuction(response.data)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchBids = async () => {
    try {
      const response = await auctionAPI.getAuctionBids(id, { limit: 10 })
      if (response.success) {
        setBids(response.data)
      }
    } catch (err) {
      console.error('Error fetching bids:', err)
    }
  }

  const handleBid = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    setBidding(true)
    setBidError(null)
    setBidSuccess(false)

    try {
      console.log('Placing bid:', { auctionId: id, amount: bidAmount })
      const response = await auctionAPI.placeBid(id, bidAmount)
      console.log('Bid response:', response)

      if (response.success) {
        setBidSuccess(true)

        // Refresh auction and bids data (warn user if these error)
        try {
          await fetchAuction()
          await fetchBids()
        } catch (refreshErr) {
          console.error('Error refreshing data:', refreshErr)
          setRefreshWarning(true)
          setTimeout(() => setRefreshWarning(false), 5000)
        }

        setTimeout(() => setBidSuccess(false), 3000)
      }
    } catch (err) {
      console.error('Bid error:', err)
      setBidError(err.message || 'Błąd podczas składania oferty')
    } finally {
      setBidding(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTimeRemaining = (endTime) => {
    const now = new Date()
    const end = new Date(endTime)
    const diff = end - now

    if (diff <= 0) return 'Zakończona'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-2xl">Ładowanie aukcji...</div>
      </div>
    )
  }

  if (error || !auction) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-red-500 text-2xl">
          {error || 'Nie znaleziono aukcji'}
        </div>
      </div>
    )
  }

  const minimumBid = auction.currentPrice + auction.bidIncrement
  const isOwner = user && auction.seller && auction.seller._id === user._id
  const isBidValid = !isNaN(bidAmount) && bidAmount >= minimumBid
  const canBid = isAuctionActive && auction.status === 'active' && !isOwner

  const handleBidAmountChange = (value) => {
    const numValue = parseInt(value) || 0
    setBidAmount(numValue)
    setBidError(null) // Clear error when user changes bid
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
        <div className="max-w-7xl mx-auto px-6 py-16 pb-9 grid grid-cols-[2fr_1.3fr] gap-10 w-full">
          <div className="relative overflow-visible rounded-l-2xl rounded-r-none p-8 bg-white/30 backdrop-blur-md shadow-lg"
               style={{ borderLeftWidth: '8px', borderLeftStyle: 'solid', borderLeftColor: '#bfa873' }}>
            <div className="flex items-center justify-between pb-4 border-black-100">
              <h2 className="flex items-center gap-2 text-black font-semibold text-lg">
                Wizualizacja 3D (WebGPU)
              </h2>
              <div className="flex items-center gap-2 text-sm">
                <a href="/viewer3d" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-2 py-1 rounded-lg">
                  Pełny ekran
                </a>
              </div>
            </div>

            <div className="flex items-center justify-center p-4 bg-transparent">
              <WebGPUCanvas
                width={800}
                showControls={false}
              />
            </div>

            {auction.images && auction.images.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {auction.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${auction.title} ${idx + 1}`}
                    className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-100 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 pb-2 border-b border-gray-300">{auction.title}</h3>
            <div className="bg-white/40 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 leading-relaxed mb-6">
              <p className="mb-1">
                <span className="font-semibold text-gray-800">Numer aukcji:</span> #{auction._id.slice(-8)}
              </p>
              <p className="mb-1">
                <span className="font-semibold text-gray-800">Zakończenie:</span> {formatDate(auction.endTime)}
              </p>
              <p className="mb-1">
                <span className="font-semibold text-gray-800">Pozostało:</span>{' '}
                <span className={timeRemaining === 'Zakończona' ? 'text-red-600 font-semibold' : ''}>
                  {timeRemaining || formatTimeRemaining(auction.endTime)}
                </span>
              </p>
              <p>
                <span className="font-semibold text-gray-800">Kategoria:</span> {auction.category}
              </p>
              {auction.condition && (
                <p>
                  <span className="font-semibold text-gray-800">Stan:</span> {auction.condition}
                </p>
              )}
            </div>

            <div className="flex flex-col items-center bg-white/40 border border-gray-200 rounded-lg p-6 mb-5 shadow-inner">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Aktualna najwyższa oferta</h2>
              <p className="text-4xl font-bold text-green-600 mb-4">
                {auction.currentPrice.toLocaleString('pl-PL')} zł
              </p>
              <p className="text-gray-600 text-sm mb-2">
                Cena wywoławcza: {auction.startingPrice.toLocaleString('pl-PL')} zł
              </p>
              <p className="text-gray-600 text-sm mb-6">
                Liczba ofert: {auction.totalBids}
              </p>

              {canBid ? (
                <div className="w-full">
                  {bidSuccess && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                      Oferta złożona pomyślnie!
                    </div>
                  )}
                  {bidError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                      {bidError}
                    </div>
                  )}
                  {refreshWarning && (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4 text-sm">
                      Oferta złożona, ale dane mogą być nieaktualne. Odśwież stronę.
                    </div>
                  )}

                  <label className="block text-gray-700 text-sm font-semibold mb-1">Twoja oferta</label>
                  <div className={`flex items-center border rounded-lg overflow-hidden ${!isBidValid && bidAmount > 0 ? 'border-red-400' : 'border-gray-300'}`}>
                    <input
                      type="number"
                      min={minimumBid}
                      value={bidAmount}
                      onChange={(e) => handleBidAmountChange(e.target.value)}
                      className="flex-1 px-3 py-2 text-center text-lg font-semibold text-gray-800 focus:outline-none"
                    />
                    <span className="px-3 bg-white/40 text-gray-700 text-sm">zł</span>
                  </div>
                  {!isBidValid && bidAmount > 0 ? (
                    <p className="text-xs text-red-600 mt-2">
                      Oferta musi wynosić co najmniej {minimumBid.toLocaleString('pl-PL')} zł
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-2">
                      Minimalna oferta: {minimumBid.toLocaleString('pl-PL')} zł (wzrost o {auction.bidIncrement} zł)
                    </p>
                  )}

                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => handleBidAmountChange(minimumBid)}
                      className="flex-1 mx-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition"
                    >
                      +{auction.bidIncrement} zł
                    </button>
                    <button
                      onClick={() => handleBidAmountChange(minimumBid + auction.bidIncrement * 5)}
                      className="flex-1 mx-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition"
                    >
                      +{auction.bidIncrement * 5} zł
                    </button>
                    <button
                      onClick={() => handleBidAmountChange(minimumBid + auction.bidIncrement * 10)}
                      className="flex-1 mx-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition"
                    >
                      +{auction.bidIncrement * 10} zł
                    </button>
                  </div>

                  <button
                    onClick={handleBid}
                    disabled={bidding || !isBidValid}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg flex items-center justify-center transition"
                  >
                    {bidding ? 'LICYTUJĘ...' : isBidValid ? 'LICYTUJ TERAZ' : 'WPROWADŹ PRAWIDŁOWĄ KWOTĘ'}
                  </button>
                </div>
              ) : isOwner ? (
                <div className="w-full text-center text-gray-600 font-semibold">
                  To jest Twoja aukcja
                </div>
              ) : (
                <div className="w-full text-center text-red-600 font-semibold">
                  Aukcja zakończona
                </div>
              )}
            </div>

            {bids.length > 0 && (
              <div className="bg-white/40 border border-gray-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-800 mb-3">Ostatnie oferty</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {bids.map((bid, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="font-medium">{bid.bidder?.username || 'Użytkownik'}</span>
                      <span className="text-green-600 font-bold">
                        {bid.amount.toLocaleString('pl-PL')} zł
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-[2fr_1.3fr] gap-10 w-full pt-0">
          <div className="bg-gray-100 rounded-xl shadow-lg p-6 flex flex-col justify-between min-h-[190px]">
            <div>
              <h2 className="text-lg font-semibold border-b border-gray-300 pb-2 mb-4">
                Opis przedmiotu aukcji
              </h2>
              <div className="bg-white/40 rounded-lg p-4 border border-gray-200 text-gray-700">
                <p className="whitespace-pre-wrap">{auction.description}</p>
                {auction.technicalDetails && Object.keys(auction.technicalDetails).length > 0 && (
                  <div className="mt-3">
                    <h5 className="font-semibold mb-1">Szczegółowe dane techniczne:</h5>
                    <ul className="list-disc list-inside">
                      {Object.entries(auction.technicalDetails).map(([key, value]) => (
                        <li key={key}>
                          <span className="font-medium">{key}:</span> {value}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-100 rounded-xl shadow-lg p-6 flex flex-col min-h-[190px]">
            <div>
              <h2 className="text-lg font-semibold border-b border-gray-300 pb-2 mb-4">
                {auction.auctionHouse?.name ? 'Dom aukcyjny' : 'Sprzedawca'}
              </h2>
              <div className="bg-white/40 rounded-lg p-4 border border-gray-200 text-gray-700">
                {auction.auctionHouse?.name ? (
                  <>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {auction.auctionHouse.name}
                    </h3>
                    {auction.auctionHouse.description && (
                      <p className="text-sm mb-2">{auction.auctionHouse.description}</p>
                    )}
                    <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                      {auction.auctionHouse.location && (
                        <li>Lokalizacja: {auction.auctionHouse.location}</li>
                      )}
                      {auction.auctionHouse.contact && (
                        <li>Kontakt: {auction.auctionHouse.contact}</li>
                      )}
                      {auction.auctionHouse.website && (
                        <li>Strona: {auction.auctionHouse.website}</li>
                      )}
                    </ul>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {auction.seller?.username || 'Sprzedawca'}
                    </h3>
                    {auction.seller?.rating > 0 && (
                      <p className="text-sm text-gray-600">
                        Ocena: {auction.seller.rating.toFixed(1)} / 5.0 ({auction.seller.ratingCount} opinii)
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
