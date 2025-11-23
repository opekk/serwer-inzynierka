import '../styles/index.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WebGPUCanvas from '../components/WebGPUCanvas'
import { Link, useNavigate } from 'react-router-dom'
import { useWebGPUCanvas } from '../components/WebGPUCanvasProvider.jsx'

export default function MainPage() {
  const navigate = useNavigate()
  const { changeModel } = useWebGPUCanvas()

  

  const handleLicytuj = (modelName) => {
    // Navigate immediately to avoid waiting for large model load.
    navigate('/auctionview')
    // Defer the actual model switch so routing transition is not delayed.
    setTimeout(() => {
      try {
        const ok = typeof changeModel === 'function' ? changeModel(modelName) : false
        if (!ok && typeof window !== 'undefined' && window.Module?.change_model) {
          window.Module.change_model(modelName)
        }
      } catch (err) {
        console.error('Deferred model change failed:', err)
      }
    }, 0)
  }
  return (
    <div
      className="relative flex flex-col min-h-screen"
      style={{
        backgroundImage: "url('/resources/marmurphotos/marmur1l.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#3B82F6',
      }}
    >
      
      <div className="absolute inset-0 bg-blue-900/30 mix-blend-multiply" aria-hidden="true" />
      <div className="relative z-10">
        <Navbar />
 
        <section className="bg-transparent text-slate-900">
          <div className="max-w-7xl mx-auto py-24">

            <div className="rounded-2xl p-8 bg-white/30 backdrop-blur-md border border-white/20">
              <div className="grid md:grid-cols-2 gap-8 items-center">

                <div className="space-y-6">
                  <h1 className="text-5xl font-bold">
                    Przyszłość aukcji<br/>
                    <span className="text-slate-700">z wizualizacją 3D</span>
                  </h1>

                  <p className="text-slate-900 max-w-xl">
                    Odkryj unikalne dzieła sztuki i antyki w najnowocześniejszej platformie aukcyjnej.
                    Obejrzyj każdy przedmiot w 3D przed złożeniem oferty.
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <Link
                      to="/auctions"
                      className="inline-flex items-center px-5 py-3 bg-white text-slate-700 rounded-lg shadow hover:shadow-lg transition"
                    >
                      Przeglądaj aukcje
                    </Link>
                    <Link
                      to="/viewer3d"
                      className="inline-flex items-center px-5 py-3 border border-white/40 text-slate-900 rounded-lg bg-white/10 hover:bg-white/20 transition"
                    >
                      Zobacz demo 3D
                    </Link>
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="w-full md:w-auto md:pl-4">
                    {/* Integrated WebGPU Canvas — większa ramka i lepsze wyrównanie */}
                    <WebGPUCanvas
                      width={640}
                      showControls={false}
                      className="rounded-xl shadow-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        





      <section className="text-black bg-white">
        <div className="max-w-7xl mx-auto h-180">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <h1 className="text-4xl font-bold pt-10">
            Aukcje na żywo<br/>
            <span className="text-gray-700 font-normal text-2xl">Aktualne licytacje z wizualizacją 3D</span>
          </h1>

          <div className="text-black flex justify-end pt-10">
            <span className="text-2s bg-red-400 px-6 py-3 rounded-full">🔴12 aukcji na żywo</span>
            <Link
              to="/auctions"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium pl-3"
            >
              Zobacz wszystkie
              <span className="ml-1">→</span>
            </Link>
          </div>
        </div>

          <div className="grid grid-cols-3 gap-6 p-6 pt-20">

          <div className="bg-white rounded-2xl shadow p-4 flex flex-col items-center">
          <div className="w-full h-60 bg-gray-200 rounded-lg mb-4"></div>
            <h3 className="text-lg font-semibold">Przedmiot 1</h3>
            <p className="text-gray-500 mb-4">Dom aukcyjny 1</p>
            <button
              onClick={() => handleLicytuj('fourareen')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg"
            >
              Licytuj teraz
            </button>
          </div>  
          

        <div className="bg-white rounded-2xl shadow p-4 flex flex-col items-center">
          <div className="w-full h-60 bg-gray-200 rounded-lg mb-4"></div>
          <h3 className="text-lg font-semibold">Przedmiot 2</h3>
          <p className="text-gray-500 mb-4">Dom aukcyjny 2</p>
          <button
            onClick={() => handleLicytuj('hunter')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg"
          >
            Licytuj teraz
          </button>
        </div>


        <div className="bg-white rounded-2xl shadow p-4 flex flex-col items-center">
          <div className="w-full h-60 bg-gray-200 rounded-lg mb-4"></div>
          <h3 className="text-lg font-semibold">Przedmiot 3</h3>
          <p className="text-gray-500 mb-4">Dom aukcyjny 3</p>
          <button
            onClick={() => handleLicytuj('snow')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg"
          >
            Licytuj teraz
          </button>
        </div>
        </div>

    </div>
    </section>

    <section className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto grid grid-cols-4 gap-8 text-center">
        <div>
        <p className="text-3xl font-bold">2456</p>
        <p className="text-gray-300">Zakończonych aukcji</p>
        </div>

        <div>
        <p className="text-3xl font-bold">12 849</p>
        <p className="text-gray-300">Aktywnych użytkowników</p>
        </div>

        <div>
        <p className="text-3xl font-bold">48</p>
        <p className="text-gray-300">Domów aukcyjnych</p>
        </div>

        <div>
        <p className="text-3xl font-bold">125M</p>
        <p className="text-gray-300">Wartość sprzedanych dzieł</p>
        </div>
      </div>
    </section>


    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto text-center px-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Dlaczego AuctionHub?</h2>
        <p className="text-gray-500 mb-12">Nowoczesna technologia spotyka się z tradycją aukcyjną</p>

        <div className="grid grid-cols-3 gap-8">
          <div className="bg-blue-50 rounded-2xl p-8 shadow-sm">
            <div className="flex justify-center mb-4">
            <div className="bg-blue-600 text-white text-3xl p-4 rounded-full">
              🧊
            </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Wizualizacja 3D WebGPU</h3>
            <p className="text-gray-600 text-sm">
              Pierwsza platforma aukcyjna z pełną obsługą modeli 3D w czasie rzeczywistym.
              Obejrzyj każdy przedmiot z każdej strony.
            </p>
          </div>

          <div className="bg-green-50 rounded-2xl p-8 shadow-sm">
            <div className="flex justify-center mb-4">
            <div className="bg-green-600 text-white text-3xl p-4 rounded-full">
              ⚡
            </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Licytacja w czasie rzeczywistym</h3>
            <p className="text-gray-600 text-sm">
              Natychmiastowe aktualizacje ofert dla wszystkich uczestników.
              Żadnych opóźnień, pełna transparentność.
            </p>
          </div>

          <div className="bg-purple-50 rounded-2xl p-8 shadow-sm">
            <div className="flex justify-center mb-4">
              <div className="bg-purple-600 text-white text-3xl p-4 rounded-full">
                🏛️
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Wiele domów aukcyjnych</h3>
            <p className="text-gray-600 text-sm">
              Wszystkie najlepsze domy aukcyjne w jednym miejscu.
              Porównuj oferty i wybieraj najlepsze okazje.
            </p>
          </div>
        </div>
      </div>
    </section>


    <Footer />
    </div>
    </div>
  )
}