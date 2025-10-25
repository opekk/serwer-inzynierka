import '../styles/index.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function AuctionView() {
 return (
    <div className="flex flex-col">
      <Navbar />
      {/* lewy grid na 60% prawy na 40%*/}
        <div className="max-w-7xl mx-auto px-6 py-16 pb-9 grid grid-cols-[2fr_1.3fr] gap-10 w-full">
      <div className="bg-gray-100 rounded-xl shadow-lg">
      <div className="flex items-center justify-between p-4 border-black-100">
       
        <h2 className="flex items-center gap-2 text-black font-semibold text-lg">
           Wizualizacja 3D (WebGPU)
        </h2>
        
        <div className="flex items-center gap-2 text-sm">
          <a href="/viewer3d" class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-2 py-1 rounded-lg">
              Pełny ekran
            </a>
         
         <a href="/auctionview" class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-2 py-1 rounded-lg">
              Instrukcja
            </a>
        </div>
      </div>
     
     
      {/* tu macie placeholderek ma model 3d */}
      <div className="bg-gray-600 h-140">
        <div className="flex flex-col">
        
        </div>
      </div>

      
      
      
      <div className="flex items-center justify-between text-xs text-black px-4 py-2 text-lg">
        <span>Jakość renderowania: Ultra HD</span>
        
        <span>WebGPU aktywne</span>
      </div>
    </div>
     
     <div className="bg-gray-100 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 pb-2 border-b border-gray-300">Nazwa przedmiotu xasea</h3>
        <div className="bg-white/40 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 leading-relaxed mb-6">
        <p className="mb-1">
        <span className="font-semibold text-gray-800">Numer aukcji:</span> #3214156
        </p>
          <p className="mb-1">
          <span className="font-semibold text-gray-800">Zakończenie:</span> 13 styczen 2025, 19:45
          </p>
            <p>
            <span className="font-semibold text-gray-800">Kategoria:</span> Przedmioty typu spoko
            </p>
      </div>

  
    <div className="flex flex-col items-center bg-white/40 border border-gray-200 rounded-lg p-6 mb-5 shadow-inner">
    <h2 className="text-2xl font-bold text-gray-800 mb-2">Aktualna najwyższa oferta</h2>
      <p className="text-4xl font-bold text-green-600 mb-4">7 200 zł</p>
        <p className="text-gray-600 text-sm mb-6">Cena wywoławcza: 2 000 zł</p>

      <div className="w-full">
      <label className="block text-gray-700 text-sm font-semibold mb-1">Twoja oferta</label>
      <div className="flex items-center border rounded-lg overflow-hidden">
        <input type="number" defaultValue="7200" className="flex-1 px-3 py-2 text-center text-lg font-semibold text-gray-800 focus:outline-none"/>
        <span className="px-3 bg-white/40 text-gray-700 text-sm">zł</span>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Minimalna oferta: 7 200 zł (wzrost o 100 zł)
      </p>

      <div className="flex justify-between mt-4">
        <button className="flex-1 mx-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg">
          +100 zł
        </button>
          <button className="flex-1 mx-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg">
            +500 zł
          </button>
            <button className="flex-1 mx-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg">
             +1000 zł
            </button>
      </div>

      <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center transition">
        <i class="fas fa-gavel text-blue-400 text-xl mr-2"></i> LICYTUJ TERAZ
      </button>
    </div>
  </div>

     </div>
    </div>

     <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-[2fr_1.3fr] gap-10 w-full pt-0">
  <div className="bg-gray-100 rounded-xl shadow-lg p-6 flex flex-col justify-between min-h-[190px]">
    <div>
      <h2 className="text-lg font-semibold border-b border-gray-300 pb-2 mb-4">
        Opis przedmiotu aukcji
      </h2>
      <div className="bg-white/40 rounded-lg p-4 border border-gray-200 text-gray-700">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
          ullamcorper, mi vitae commodo vestibulum, urna urna vestibulum
          sapien, nec elementum purus nibh at elit. Suspendisse at nulla
          luctus, aliquam ipsum sit amet, gravida est. Integer ut mattis
          libero. Donec feugiat accumsan magna, a fringilla libero convallis
          ut.
        </p>
        <p className="mt-3">
          <h5 className="font-semibold mb-1">Szczegółowe dane techniczne:</h5>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
          ullamcorper, mi vitae commodo vestibulum, urna urna vestibulum
          sapien, nec (ewentualnie lista)
        </p>
      </div>
    </div>
  </div>

  <div className="bg-gray-100 rounded-xl shadow-lg p-6 flex flex-col min-h-[190px]">
    <div>
      <h2 className="text-lg font-semibold border-b border-gray-300 pb-2 mb-4">
        Dom aukcyjny
      </h2>
      <div className="bg-white/40 rounded-lg p-4 border border-gray-200 text-gray-700">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Nazwa Domu Aukcyjnego
        </h3>
        <p className="text-sm mb-2">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
          ullamcorper, mi vitae commodo vestibulum, urna urna vestibulum
          sapien, nec elementum purus nibh at elit. Suspendisse at nulla
          luctus, aliquam ipsum sit amet
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
          <li> Lokalizacja: Lublin, ul. Skrzetuskiego 4/121</li>
          <li> Kontakt: +48 698 963 952</li>
          <li> Strona: www.domaukcyjny1.pl</li>
        </ul>
      </div>
    </div>
  </div>
</div>

      <Footer />
    </div>
  );
}