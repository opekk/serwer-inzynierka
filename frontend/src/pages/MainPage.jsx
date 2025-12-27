import { useEffect, useState } from 'react'
import '../styles/index.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WebGPUCanvas from '../components/WebGPUCanvas'
import AuctionCard from '../components/AuctionCard'
import { Link, useNavigate } from 'react-router-dom'
import { useWebGPUCanvas } from '../components/WebGPUCanvasProvider.jsx'
import { auctionAPI } from '../services/api'

export default function MainPage() {
  const navigate = useNavigate()
  const { changeModel, moduleReady } = useWebGPUCanvas()
  const [activeAuctionsCount, setActiveAuctionsCount] = useState(0)

  // Fetch active auctions count
  useEffect(() => {
    const fetchActiveAuctionsCount = async () => {
      try {
        const response = await auctionAPI.getAllAuctions({ status: 'active', limit: 1 })
        if (response.success) {
          setActiveAuctionsCount(response.total)
        }
      } catch (err) {
        console.error('Error fetching active auctions count:', err)
      }
    }
    fetchActiveAuctionsCount()
  }, [])

  // Change to default model when returning to MainPage
  useEffect(() => {
    if (moduleReady && window.Module?.change_model_to_default) {
      try {
        window.Module.change_model_to_default()
      } catch (err) {
        console.error('Failed to change to default model:', err)
      }
    }
  }, [moduleReady])

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
        backgroundImage: "url('/resources/marmurphotos/marmur_final.webp')",
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

            <div
              className="relative overflow-visible rounded-l-2xl rounded-r-none p-8 bg-white/30 backdrop-blur-md"
              style={{ borderLeftWidth: '8px', borderLeftStyle: 'solid', borderLeftColor: '#bfa873' }}
            >
              {/* prawy-gorny potem prawy-dolny corner */}
              <svg
                className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-7 h-7"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path d="M2 0 H24" stroke="#000" strokeWidth="4.8" strokeLinecap="square" />
                <path d="M24 0 V20" stroke="#000" strokeWidth="4.8" strokeLinecap="square" />
              </svg>
              <svg
                className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-7 h-7"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path d="M2 24 H24" stroke="#000" strokeWidth="4.8" strokeLinecap="square" />
                <path d="M24 2 V24" stroke="#000" strokeWidth="4.8" strokeLinecap="square" />
              </svg>
              <div className="grid md:grid-cols-2 gap-8 items-center">

                <div className="space-y-6">
                  <h1 className="text-6xl font-bold" style={{ letterSpacing: '0.02em' }}>
                    Przyszłość aukcji<br/>
                    <span className="text-slate-700 text-6xl">z wizualizacją 3D</span>
                  </h1>

                  <div className="relative max-w-xl">
                    {/* lewa klamra */}
                    <svg
                      className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-48 pointer-events-none"
                      viewBox="0 0 24 48"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path d="M16 6 H6 M6 6 V42 M6 42 H16" stroke="#ffffff" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" />
                    </svg>

                    <p className="text-slate-900 text-lg italic relative z-10">
                      Odkryj unikalne dzieła sztuki i antyki w najnowocześniejszej platformie aukcyjnej.
                      Obejrzyj każdy przedmiot w 3D przed złożeniem oferty.
                    </p>

                    {/* prawa klamra */}
                    <svg
                      className="absolute -right-1 top-1/2 -translate-y-1/2 w-12 h-48 pointer-events-none"
                      viewBox="0 0 24 48"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path d="M8 6 H18 M18 6 V42 M18 42 H8" stroke="#ffffff" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" />
                    </svg>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <Link
                      to="/auctions"
                      className="inline-flex font-bold items-center px-5 py-3 bg-white text-slate-700 rounded-lg shadow hover:shadow-lg transition"
                    >
                      Przeglądaj aukcje
                    </Link>
                    <Link
                      to="/viewer3d"
                      className="inline-flex font-bold items-center px-5 py-3 border border-white/40 text-slate-900 rounded-lg bg-white/40 hover:bg-white/5n0 transition"
                    >
                      Zobacz demo 3D
                    </Link>
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="w-full md:w-auto md:pl-4">
                    {/* Integrated WebGPU Canvas */}
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
            Aukcje na żywo:<br/>
            <span className="text-gray-700 font-normal text-2xl">Aktualne licytacje z wizualizacją 3D</span>
          </h1>

          <div className="flex justify-end pt-10 items-center gap-4">
            <div className="relative inline-flex items-center w-fit">
              <div className="absolute -top-2 -right-3 z-10 inline-flex items-center justify-center rounded-full bg-red-600 px-3 py-1.5 text-center text-xs font-bold text-white">
                {activeAuctionsCount}
              </div>
              <button
                type="button"
                className="inline-block rounded-full bg-red-500 px-8 py-2 text-sm font-medium text-white shadow transition duration-150 ease-in-out hover:bg-red-600 focus:outline-none"
              >
                Na żywo
              </button>
            </div>

            <Link
              to="/auctions"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium pl-3"
            >
              Zobacz wszystkie
              <span className="ml-1">→</span>
            </Link>
          </div>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 pt-20">
            <AuctionCard
              image="https://tecdn.b-cdn.net/img/new/standard/nature/186.jpg"
              title="Przedmiot 1"
              description="Some quick example text to build on the card title and make up the bulk of the card's content."
              onBid={() => handleLicytuj('fourareen')}
              buttonText="Licytuj teraz"
            />

            <AuctionCard
              image="https://tecdn.b-cdn.net/img/new/standard/nature/186.jpg"
              title="Przedmiot 2"
              description="Some quick example text to build on the card title and make up the bulk of the card's content."
              onBid={() => handleLicytuj('hunter')}
              buttonText="Licytuj teraz"
            />

            <AuctionCard
              image="https://tecdn.b-cdn.net/img/new/standard/nature/186.jpg"
              title="Przedmiot 3"
              description="Some quick example text to build on the card title and make up the bulk of the card's content."
              onBid={() => handleLicytuj('telephone')}
              buttonText="Licytuj teraz"
            />
          </div>

    </div>
    </section>

    <section className="bg-slate-700 text-white py-12">
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


    <section
      className="py-16 relative"
      style={{
        backgroundImage: "url('/resources/marmurphotos/marmur_final.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-blue-900/25 mix-blend-multiply" aria-hidden="true" />
      <div className="max-w-7xl mx-auto text-center px-6 relative z-10">
        <h2 className="text-4xl font-bold text-white mb-2">Dlaczego AuctionHub?</h2>
        <div className="mx-auto my-4 h-0.5 w-36 rounded-full bg-white/30 shadow-sm" aria-hidden="true" />
        <p className="text-2xl text-white/90 mb-12">Nowoczesna technologia spotyka się z tradycją aukcyjną</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/30 backdrop-blur-md border border-white/20 text-white rounded-2xl p-8 shadow-sm">
            <div className="flex justify-center mb-4">
              <div className="bg-white text-black text-3xl p-4 rounded-full shadow ring-1 ring-slate-200 ring-4 ring-sky-300/20">
                
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-black">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                </svg>

              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Wizualizacja 3D WebGPU</h3>
            <p className="text-white/90 text-s">
              Pierwsza platforma aukcyjna z pełną obsługą modeli 3D w czasie rzeczywistym.
              Obejrzyj każdy przedmiot z każdej strony.
            </p>
          </div>

          <div className="bg-white/30 backdrop-blur-md border border-white/20 text-white rounded-2xl p-8 shadow-sm">
            <div className="flex justify-center mb-4">
              <div className="bg-white text-black text-3xl p-4 rounded-full shadow ring-1 ring-slate-200 ring-4 ring-sky-300/20">
                
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-black">
                <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                </svg>

              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Licytacja w czasie rzeczywistym</h3>
            <p className="text-white/90 text-s">
              Natychmiastowe aktualizacje ofert dla wszystkich uczestników.
              Żadnych opóźnień, pełna transparentność.
            </p>
          </div>

          <div className="bg-white/30 backdrop-blur-md border border-white/20 text-white rounded-2xl p-8 shadow-sm">
            <div className="flex justify-center mb-4">
              <div className="bg-white text-black text-3xl p-4 rounded-full shadow ring-1 ring-slate-200 ring-4 ring-sky-300/20">
                
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-black">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
                </svg>

              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Wiele domów aukcyjnych</h3>
            <p className="text-white/90 text-s">
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