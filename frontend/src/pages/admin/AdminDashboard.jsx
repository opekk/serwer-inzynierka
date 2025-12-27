import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { adminAPI } from '../../services/adminApi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cleanupLoading, setCleanupLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, healthData] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getSystemHealth()
      ]);

      if (statsData.success) setStats(statsData.data);
      if (healthData.success) setHealth(healthData.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async () => {
    if (!confirm('Czy na pewno chcesz uruchomić czyszczenie systemu?')) return;

    try {
      setCleanupLoading(true);
      const response = await adminAPI.runSystemCleanup();
      if (response.success) {
        alert(`Czyszczenie zakończone:\n- Zamkniętych aukcji: ${response.data.expiredAuctionsClosed}\n- Usuniętych bidów: ${response.data.orphanedBidsRemoved}\n- Nieaktywnych użytkowników: ${response.data.inactiveUsersFound}`);
        fetchData();
      }
    } catch (err) {
      alert('Błąd podczas czyszczenia: ' + err.message);
    } finally {
      setCleanupLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-2xl">Ładowanie...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto py-8 px-4 w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Panel Administratora</h1>
            <p className="text-gray-600 mt-2">Witaj, {user?.username}</p>
          </div>
          <button
            onClick={handleCleanup}
            disabled={cleanupLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold"
          >
            {cleanupLoading ? 'Czyszczenie...' : '🧹 Wyczyść System'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* System Health */}
        {health && (
          <div className={`p-4 rounded-lg mb-6 ${
            health.status === 'healthy' ? 'bg-green-100 border border-green-400' :
            health.status === 'degraded' ? 'bg-yellow-100 border border-yellow-400' :
            'bg-red-100 border border-red-400'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">
                  Status systemu: {health.status === 'healthy' ? '✅ Zdrowy' : health.status === 'degraded' ? '⚠️ Degradowany' : '❌ Problemy'}
                </h3>
                <p className="text-sm">
                  Uptime: {Math.floor(health.uptime / 3600)}h {Math.floor((health.uptime % 3600) / 60)}m
                  {health.checks.stuckAuctions > 0 && ` | Zablokowanych aukcji: ${health.checks.stuckAuctions}`}
                </p>
              </div>
              <div className="text-sm text-gray-600">
                {new Date(health.timestamp).toLocaleString('pl-PL')}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link to="/admin/users" className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg text-center">
            <div className="text-3xl mb-2">👥</div>
            <div className="font-semibold">Użytkownicy</div>
          </Link>
          <Link to="/admin/auctions" className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg text-center">
            <div className="text-3xl mb-2">🔨</div>
            <div className="font-semibold">Aukcje</div>
          </Link>
          <Link to="/admin/bids" className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg text-center">
            <div className="text-3xl mb-2">💰</div>
            <div className="font-semibold">Oferty</div>
          </Link>
        </div>

        {/* Statistics Overview */}
        {stats?.overview && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-500 text-sm font-semibold mb-2">Użytkownicy</div>
              <div className="text-3xl font-bold text-gray-900">{stats.overview.totalUsers}</div>
              <div className="text-sm text-gray-600 mt-2">
                Aktywni: {stats.overview.activeUsers} | Nowi (7 dni): {stats.overview.recentUsers}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-500 text-sm font-semibold mb-2">Aukcje</div>
              <div className="text-3xl font-bold text-gray-900">{stats.overview.totalAuctions}</div>
              <div className="text-sm text-gray-600 mt-2">
                Aktywne: {stats.overview.activeAuctions} | Zakończone: {stats.overview.completedAuctions}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-500 text-sm font-semibold mb-2">Oferty</div>
              <div className="text-3xl font-bold text-gray-900">{stats.overview.totalBids}</div>
              <div className="text-sm text-gray-600 mt-2">
                Średnia cena: {Math.round(stats.overview.averagePrice || 0)} zł
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-500 text-sm font-semibold mb-2">Wartość transakcji</div>
              <div className="text-3xl font-bold text-green-600">
                {Math.round(stats.overview.totalRevenue || 0).toLocaleString('pl-PL')} zł
              </div>
              <div className="text-sm text-gray-600 mt-2">
                Całkowity obrót
              </div>
            </div>
          </div>
        )}

        {/* Top Sellers */}
        {stats?.topSellers && stats.topSellers.length > 0 && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Top Sprzedawcy</h2>
            </div>
            <div className="p-6">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-600 text-sm">
                    <th className="pb-3">Użytkownik</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3 text-right">Sprzedanych</th>
                    <th className="pb-3 text-right">Aukcji</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topSellers.map((seller, idx) => (
                    <tr key={seller._id} className="border-t border-gray-100">
                      <td className="py-3 font-semibold">{idx + 1}. {seller.username}</td>
                      <td className="py-3 text-gray-600">{seller.email}</td>
                      <td className="py-3 text-right font-semibold text-green-600">
                        {seller.stats.totalItemsSold}
                      </td>
                      <td className="py-3 text-right text-gray-600">
                        {seller.stats.totalAuctionsCreated}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Category Statistics */}
        {stats?.categoryStats && stats.categoryStats.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Statystyki Kategorii</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {stats.categoryStats.map(cat => (
                  <div key={cat._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="font-semibold text-gray-900">{cat._id}</div>
                    <div className="text-2xl font-bold text-blue-600 mt-2">{cat.count}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Aktywne: {cat.activeCount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
