import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { adminAPI } from '../../services/adminApi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function AdminAuctions() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    status: '',
    category: '',
    featured: '',
    includeDeleted: 'false',
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
    fetchAuctions();
  }, [user, navigate, filters]);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllAuctions(filters);
      if (response.success) {
        setAuctions(response.data);
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

  const handleForceClose = async (auctionId, title) => {
    if (!confirm(`Czy na pewno chcesz wymusić zamknięcie aukcji "${title}"?`)) return;

    try {
      const response = await adminAPI.forceCloseAuction(auctionId);
      if (response.success) {
        alert('Aukcja została zamknięta');
        fetchAuctions();
      }
    } catch (err) {
      alert('Błąd: ' + err.message);
    }
  };

  const handleHardDelete = async (auctionId, title) => {
    if (!confirm(`UWAGA! Czy na pewno chcesz TRWALE usunąć aukcję "${title}"? Ta operacja jest nieodwracalna i usunie również wszystkie powiązane oferty!`)) return;

    try {
      const response = await adminAPI.hardDeleteAuction(auctionId);
      if (response.success) {
        alert('Aukcja została trwale usunięta');
        fetchAuctions();
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
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto py-8 px-4 w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Zarządzanie Aukcjami</h1>
            <p className="text-gray-600 mt-2">Łącznie: {pagination.total} aukcji</p>
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
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <input
              type="text"
              placeholder="Szukaj..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Wszystkie statusy</option>
              <option value="draft">Draft</option>
              <option value="active">Aktywne</option>
              <option value="completed">Zakończone</option>
              <option value="cancelled">Anulowane</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Wszystkie kategorie</option>
              <option value="Sztuka">Sztuka</option>
              <option value="Antyki">Antyki</option>
              <option value="Biżuteria">Biżuteria</option>
              <option value="Monety i Banknoty">Monety i Banknoty</option>
              <option value="Książki">Książki</option>
              <option value="Inne">Inne</option>
            </select>

            <select
              value={filters.featured}
              onChange={(e) => handleFilterChange('featured', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Wszystkie</option>
              <option value="true">Polecane</option>
              <option value="false">Niepolecane</option>
            </select>

            <select
              value={filters.includeDeleted}
              onChange={(e) => handleFilterChange('includeDeleted', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="false">Bez usuniętych</option>
              <option value="true">Z usuniętymi</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="createdAt">Data utworzenia</option>
              <option value="endTime">Data zakończenia</option>
              <option value="currentPrice">Cena aktualna</option>
              <option value="totalBids">Liczba ofert</option>
            </select>
          </div>
        </div>

        {/* Auctions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Ładowanie...</div>
          ) : auctions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Brak aukcji</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aukcja</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sprzedawca</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cena</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Oferty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zakończenie</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Akcje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {auctions.map((auction) => (
                    <tr key={auction._id} className={`hover:bg-gray-50 ${auction.isDeleted ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="font-semibold text-gray-900 truncate">{auction.title}</div>
                          <div className="text-sm text-gray-500">{auction.category}</div>
                          {auction.featured && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">⭐ Polecane</span>}
                          {auction.isDeleted && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full ml-2">🗑️ Usunięte</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{auction.seller?.username || 'N/A'}</div>
                          <div className="text-gray-500">{auction.seller?.email || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          auction.status === 'active' ? 'bg-green-100 text-green-800' :
                          auction.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          auction.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {auction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-bold text-green-600">{auction.currentPrice.toLocaleString('pl-PL')} zł</div>
                          <div className="text-gray-500">Start: {auction.startingPrice.toLocaleString('pl-PL')} zł</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{auction.totalBids}</div>
                          <div className="text-xs text-gray-500">Wyświetleń: {auction.views}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{formatDate(auction.endTime)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <Link
                            to={`/auction/${auction._id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                          >
                            Podgląd
                          </Link>
                          {auction.status === 'active' && (
                            <button
                              onClick={() => handleForceClose(auction._id, auction.title)}
                              className="text-orange-600 hover:text-orange-800 font-medium text-sm text-left"
                            >
                              Zamknij
                            </button>
                          )}
                          <button
                            onClick={() => handleHardDelete(auction._id, auction.title)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm text-left"
                          >
                            Usuń trwale
                          </button>
                        </div>
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
