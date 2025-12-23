import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { adminAPI } from '../../services/adminApi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function AdminUsers() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    role: '',
    isActive: '',
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
    fetchUsers();
  }, [user, navigate, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers(filters);
      if (response.success) {
        setUsers(response.data);
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

  const handleToggleBan = async (userId, username, isActive) => {
    if (!confirm(`Czy na pewno chcesz ${isActive ? 'zablokować' : 'odblokować'} użytkownika ${username}?`)) return;

    try {
      const response = await adminAPI.toggleUserBan(userId);
      if (response.success) {
        alert(response.message);
        fetchUsers();
      }
    } catch (err) {
      alert('Błąd: ' + err.message);
    }
  };

  const handleDelete = async (userId, username) => {
    if (!confirm(`Czy na pewno chcesz usunąć użytkownika ${username}? To spowoduje dezaktywację konta i usunięcie wszystkich aukcji.`)) return;

    try {
      const response = await adminAPI.deleteUser(userId);
      if (response.success) {
        alert('Użytkownik usunięty');
        fetchUsers();
      }
    } catch (err) {
      alert('Błąd: ' + err.message);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = {
      username: formData.get('username'),
      email: formData.get('email'),
      role: formData.get('role'),
      isActive: formData.get('isActive') === 'true',
      isEmailVerified: formData.get('isEmailVerified') === 'true'
    };

    try {
      const response = await adminAPI.updateUser(selectedUser._id, userData);
      if (response.success) {
        alert('Użytkownik zaktualizowany');
        setShowEditModal(false);
        fetchUsers();
      }
    } catch (err) {
      alert('Błąd: ' + err.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto py-8 px-4 w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Zarządzanie Użytkownikami</h1>
            <p className="text-gray-600 mt-2">Łącznie: {pagination.total} użytkowników</p>
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Szukaj po nazwie lub email..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />

            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Wszystkie role</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <select
              value={filters.isActive}
              onChange={(e) => handleFilterChange('isActive', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Wszystkie statusy</option>
              <option value="true">Aktywni</option>
              <option value="false">Zablokowani</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="createdAt">Data rejestracji</option>
              <option value="username">Nazwa</option>
              <option value="email">Email</option>
            </select>

            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="desc">Malejąco</option>
              <option value="asc">Rosnąco</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Ładowanie...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Brak użytkowników</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Użytkownik</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rola</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statystyki</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{u.username}</div>
                        <div className="text-sm text-gray-500">ID: {u._id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{u.email}</div>
                      <div className="text-sm text-gray-500">
                        {u.isEmailVerified ? '✅ Zweryfikowany' : '❌ Nie zweryfikowany'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {u.isActive ? 'Aktywny' : 'Zablokowany'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>Aukcji: {u.stats?.totalAuctionsCreated || 0}</div>
                      <div>Ofert: {u.stats?.totalBidsPlaced || 0}</div>
                      <div>Sprzedanych: {u.stats?.totalItemsSold || 0}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setSelectedUser(u); setShowEditModal(true); }}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          Edytuj
                        </button>
                        <button
                          onClick={() => handleToggleBan(u._id, u.username, u.isActive)}
                          className={`${u.isActive ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'} font-medium text-sm`}
                        >
                          {u.isActive ? 'Zablokuj' : 'Odblokuj'}
                        </button>
                        <button
                          onClick={() => handleDelete(u._id, u.username)}
                          className="text-red-600 hover:text-red-800 font-medium text-sm"
                        >
                          Usuń
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Edytuj Użytkownika</h2>
            <form onSubmit={handleEditUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Nazwa użytkownika</label>
                  <input
                    type="text"
                    name="username"
                    defaultValue={selectedUser.username}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={selectedUser.email}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Rola</label>
                  <select
                    name="role"
                    defaultValue={selectedUser.role}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Status</label>
                  <select
                    name="isActive"
                    defaultValue={selectedUser.isActive.toString()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="true">Aktywny</option>
                    <option value="false">Zablokowany</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Email Zweryfikowany</label>
                  <select
                    name="isEmailVerified"
                    defaultValue={selectedUser.isEmailVerified.toString()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="true">Tak</option>
                    <option value="false">Nie</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
                >
                  Zapisz
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold"
                >
                  Anuluj
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
