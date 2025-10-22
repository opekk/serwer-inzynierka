import '../styles/index.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WebGPUCanvas from '../components/WebGPUCanvas'

export default function MainPage() {
  return (
    <div class="flex flex-col">
      <Navbar />
 
        <section class="bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-700 text-white">
          <div class="max-w-7xl mx-auto py-24">

            <div class="grid md:grid-cols-2 gap-8 items-center">

              <div class="space-y-6">
                <h1 class="text-5xl font-bold">
                  Przyszłość aukcji<br/>
                  <span class="text-sky-200">z wizualizacją 3D</span>
                </h1>

                <p class="text-sky-100 max-w-xl">
                  Odkryj unikalne dzieła sztuki i antyki w najnowocześniejszej platformie aukcyjnej.
                  Obejrzyj każdy przedmiot w 3D przed złożeniem oferty.
                </p>

                <div class="flex flex-wrap gap-4">
                  <a href="#" class="inline-flex items-center px-5 py-3 bg-white text-indigo-700 rounded-lg shadow hover:shadow-lg transition">
                    🔎 Przeglądaj aukcje
                  </a>
                  <a href="#" class="inline-flex items-center px-5 py-3 border border-white/60 text-white rounded-lg hover:bg-white/10 transition">
                    ▶ Zobacz demo 3D
                  </a>
                </div>
              </div>

              <div class="flex justify-end">
                <article class="w-full max-w-md bg-white/10 rounded-xl p-8 shadow-lg">
                  <div class="flex flex-col items-center text-center space-y-4">

                    <div class="w-full">
                      <div class="rounded-lg overflow-hidden border border-white/10 shadow-inner">
                        {/* Integrated WebGPU Canvas */}
                        <WebGPUCanvas 
                          width={384}
                          height={300}
                          showControls={false}
                          className="w-full"
                        />
                      </div> 
                    </div>

                    <h3 class="text-xl font-semibold">Interaktywna wizualizacja 3D</h3>
                    <p class="text-sky-200 text-sm">Obracaj, przybliżaj i poznawaj każdy szczegół przed licytacją.</p>

                    <div class="flex gap-3 mt-2">
                      <span class="text-xs bg-white/20 px-3 py-1 rounded-full">WebGPU</span>
                      <span class="text-xs bg-white/20 px-3 py-1 rounded-full">HD</span>
                      <span class="text-xs bg-white/20 px-3 py-1 rounded-full">Mobile</span>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>





      <section class="text-black bg-white">
        <div class="max-w-7xl mx-auto h-180">
        <div class="grid md:grid-cols-2 gap-8 items-center">
          <h1 class="text-4xl font-bold pt-10">
            Aukcje na żywo<br/>
            <span class="text-gray-700 font-normal text-2xl">Aktualne licytacje z wizualizacją 3D</span>
          </h1>

          <div class="text-black flex justify-end pt-10">
            <span class="text-2s bg-red-400 px-6 py-3 rounded-full">🔴12 aukcji na żywo</span>
            <a href="/auctions" 
                class="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium pl-3">
                  Zobacz wszystkie
            <span class="ml-1">→</span>
            </a>
          </div>
        </div>

          <div class="grid grid-cols-3 gap-6 p-6 pt-20">

          <div class="bg-white rounded-2xl shadow p-4 flex flex-col items-center">
          <div class="w-full h-60 bg-gray-200 rounded-lg mb-4"></div>
            <h3 class="text-lg font-semibold">Przedmiot 1</h3>
            <p class="text-gray-500 mb-4">Dom aukcyjny 1</p>
            <a href="/auctionview" class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg">
              Licytuj teraz
            </a>
          </div>  
          

        <div class="bg-white rounded-2xl shadow p-4 flex flex-col items-center">
          <div class="w-full h-60 bg-gray-200 rounded-lg mb-4"></div>
          <h3 class="text-lg font-semibold">Przedmiot 2</h3>
          <p class="text-gray-500 mb-4">Dom aukcyjny 2</p>
          <button class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg">
          Licytuj teraz
          </button>
        </div>


        <div class="bg-white rounded-2xl shadow p-4 flex flex-col items-center">
          <div class="w-full h-60 bg-gray-200 rounded-lg mb-4"></div>
          <h3 class="text-lg font-semibold">Przedmiot 3</h3>
          <p class="text-gray-500 mb-4">Dom aukcyjny 3</p>
          <button class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg">
          Licytuj teraz
          </button>
        </div>
        </div>

    </div>
    </section>

    <section class="bg-gray-800 text-white py-12">
      <div class="max-w-7xl mx-auto grid grid-cols-4 gap-8 text-center">
        <div>
        <p class="text-3xl font-bold">2456</p>
        <p class="text-gray-300">Zakończonych aukcji</p>
        </div>

        <div>
        <p class="text-3xl font-bold">12 849</p>
        <p class="text-gray-300">Aktywnych użytkowników</p>
        </div>

        <div>
        <p class="text-3xl font-bold">48</p>
        <p class="text-gray-300">Domów aukcyjnych</p>
        </div>

        <div>
        <p class="text-3xl font-bold">125M</p>
        <p class="text-gray-300">Wartość sprzedanych dzieł</p>
        </div>
      </div>
    </section>


    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto text-center px-6">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Dlaczego AuctionHub?</h2>
        <p class="text-gray-500 mb-12">Nowoczesna technologia spotyka się z tradycją aukcyjną</p>

        <div class="grid grid-cols-3 gap-8">
          <div class="bg-blue-50 rounded-2xl p-8 shadow-sm">
            <div class="flex justify-center mb-4">
            <div class="bg-blue-600 text-white text-3xl p-4 rounded-full">
              🧊
            </div>
            </div>
            <h3 class="text-lg font-semibold mb-2">Wizualizacja 3D WebGPU</h3>
            <p class="text-gray-600 text-sm">
              Pierwsza platforma aukcyjna z pełną obsługą modeli 3D w czasie rzeczywistym.
              Obejrzyj każdy przedmiot z każdej strony.
            </p>
          </div>

          <div class="bg-green-50 rounded-2xl p-8 shadow-sm">
            <div class="flex justify-center mb-4">
            <div class="bg-green-600 text-white text-3xl p-4 rounded-full">
              ⚡
            </div>
            </div>
            <h3 class="text-lg font-semibold mb-2">Licytacja w czasie rzeczywistym</h3>
            <p class="text-gray-600 text-sm">
              Natychmiastowe aktualizacje ofert dla wszystkich uczestników.
              Żadnych opóźnień, pełna transparentność.
            </p>
          </div>

          <div class="bg-purple-50 rounded-2xl p-8 shadow-sm">
            <div class="flex justify-center mb-4">
              <div class="bg-purple-600 text-white text-3xl p-4 rounded-full">
                🏛️
              </div>
            </div>
            <h3 class="text-lg font-semibold mb-2">Wiele domów aukcyjnych</h3>
            <p class="text-gray-600 text-sm">
              Wszystkie najlepsze domy aukcyjne w jednym miejscu.
              Porównuj oferty i wybieraj najlepsze okazje.
            </p>
          </div>
        </div>
      </div>
    </section>


    <Footer />
    </div>
  )
}