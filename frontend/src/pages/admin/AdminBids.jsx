import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { adminAPI } from '../../services/adminApi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function AdminBids() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    auctionId: '',
    bidderId: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchBids();
  }, [user, navigate, filters]);

  const fetchBids = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllBids(filters);
      if (response.success) {
        setBids(response.data);
        setPagination({
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          total: response.total
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleCancelBid = async (bidId, amount) => {
    const reason = prompt('Podaj powód anulowania oferty:');
    if (!reason) return;

    if (!confirm(`Czy na pewno chcesz anulować ofertę ${amount} zł?\nPowód: ${reason}`)) return;

    try {
      const response = await adminAPI.cancelBid(bidId, reason);
      if (response.success) {
        alert('Oferta została anulowana');
        fetchBids();
      }
    } catch (err) {
      alert('Błąd: ' + err.message);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto py-8 px-4 w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Zarządzanie Ofertami</h1>
            <p className="text-gray-600 mt-2">Łącznie: {pagination.total} ofert</p>
          </div>
          <Link to="/admin" className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold">
            ← Powrót do Dashboard
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Wszystkie statusy</option>
              <option value="active">Aktywne</option>
              <option value="outbid">Przebite</option>
              <option value="won">Wygrane</option>
              <option value="lost">Przegrane</option>
              <option value="cancelled">Anulowane</option>
            </select>

            <input
              type="text"
              placeholder="ID Aukcji"
              value={filters.auctionId}
              onChange={(e) => handleFilterChange('auctionId', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />

            <input
              type="text"
              placeholder="ID Użytkownika"
              value={filters.bidderId}
              onChange={(e) => handleFilterChange('bidderId', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />

            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="createdAt">Data</option>
              <option value="amount">Kwota</option>
            </select>
          </div>
        </div>

        {/* Bids Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Ładowanie...</div>
          ) : bids.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Brak ofert</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aukcja</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Licytujący</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kwota</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP / User Agent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Akcje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bids.map((bid) => (
                    <tr key={bid._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-xs font-mono text-gray-500">{bid._id.slice(-8)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="font-semibold text-gray-900 truncate">
                            {bid.auction?.title || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Aktualna: {bid.auction?.currentPrice?.toLocaleString('pl-PL') || 'N/A'} zł
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{bid.bidder?.username || 'N/A'}</div>
                          <div className="text-gray-500">{bid.bidder?.email || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-lg font-bold text-green-600">
                          {bid.amount.toLocaleString('pl-PL')} zł
                        </div>
                        {bid.previousBid && (
                          <div className="text-xs text-gray-500">
                            Poprz: {bid.previousBid.toLocaleString('pl-PL')} zł
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            bid.status === 'active' ? 'bg-green-100 text-green-800' :
                            bid.status === 'outbid' ? 'bg-yellow-100 text-yellow-800' :
                            bid.status === 'won' ? 'bg-blue-100 text-blue-800' :
                            bid.status === 'lost' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {bid.status}
                          </span>
                          {bid.isWinning && (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                              🏆 Wygrywa
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{formatDate(bid.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-600 max-w-xs">
                          <div className="truncate">IP: {bid.ipAddress || 'N/A'}</div>
                          <div className="truncate">UA: {bid.userAgent?.substring(0, 30) || 'N/A'}...</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {(bid.status === 'active' || bid.isWinning) && (
                          <button
                            onClick={() => handleCancelBid(bid._id, bid.amount)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                          >
                            Anuluj
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => handleFilterChange('page', filters.page - 1)}
              disabled={filters.page === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50"
            >
              ← Poprzednia
            </button>
            <span className="px-4 py-2 bg-white border border-gray-300 rounded-lg">
              Strona {pagination.currentPage} z {pagination.totalPages}
            </span>
            <button
              onClick={() => handleFilterChange('page', filters.page + 1)}
              disabled={filters.page === pagination.totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50"
            >
              Następna →
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
