import '../styles/index.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function UserPanel() {
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
        <div style={{ minHeight: 'calc(100vh - 260px)' }} className="w-full flex items-center justify-center py-24">
          <div className="w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="col-span-1">
            <div className="bg-white rounded-xl shadow p-6 sticky top-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-indigo-200 rounded-full flex items-center justify-center text-2xl font-bold text-white">JK</div>
                <div>
                  <div className="text-lg font-bold">Jan Kowalski</div>
                  <div className="text-sm text-gray-500">Członek od 2023</div>
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
                  <h1 className="text-2xl font-bold">Jan Kowalski</h1>
                  <p className="text-sm text-slate-600">Kolekcjoner sztuki • Członek od 2023</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm">Zweryfikowany</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-sm text-slate-600">Wygrane aukcje</div>
                  <div className="text-xl font-bold">12</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-sm text-slate-600">Aktywne licytacje</div>
                  <div className="text-xl font-bold">3</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-sm text-slate-600">Obserwowane</div>
                  <div className="text-xl font-bold">28</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-sm text-slate-600">Wydane w tym miesiącu</div>
                  <div className="text-xl font-bold">8,5k zł</div>
                </div>
              </div>
            </div>

            {/* Content row: recent activity + observed list */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Ostatnie aktywności</h3>
                <ul className="space-y-3">
                  <li className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                    <div>
                      <div className="font-medium">Wazon Ming Dynasty</div>
                      <div className="text-sm text-gray-500">Twoja oferta: 2,500 zł</div>
                    </div>
                    <div className="text-slate-900 font-semibold">WYGRANA</div>
                  </li>
                  <li className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                    <div>
                      <div className="font-medium">Pierścień Vintage</div>
                      <div className="text-sm text-gray-500">Twoja oferta: 1,800 zł</div>
                    </div>
                    <div className="text-slate-900 font-semibold">PRZEGRANA</div>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Lista obserwowanych</h3>
                <ul className="space-y-3">
                  <li className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                    <div>Korona Królewska</div>
                    <div className="text-slate-900 font-semibold">12,500 zł</div>
                  </li>
                  <li className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                    <div>Zegarek Pocket</div>
                    <div className="text-slate-900 font-semibold">850 zł</div>
                  </li>
                </ul>
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
