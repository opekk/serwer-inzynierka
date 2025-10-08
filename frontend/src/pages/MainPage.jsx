import '../styles/index.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

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
          <div class="rounded-lg overflow-hidden border border-white/10 shadow-inner"
               style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.02))' }}>
            <div class="w-full h-50 bg-gradient-to-br from-indigo-600/20 to-purple-600/10 flex items-center justify-center text-white">
              <span class="">3D model jakis tu</span>
            </div>
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
        <div class="max-w-7xl mx-auto h-200">
        <div class="grid md:grid-cols-2 gap-8 items-center">
          <h1 class="text-4xl font-bold pt-10">
                  Aukcje na żywo<br/>
                  <span class="text-gray-700 font-normal text-2xl">Aktualne licytacje z wizualizacją 3D</span>
                </h1>

          <div class="text-black flex justify-end pt-10">
            <span class="text-2s bg-red-400 px-6 py-3 rounded-full">🔴12 aukcji na żywo</span>
            <h1>Prawa kolumna</h1>
          </div>
          

        </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}