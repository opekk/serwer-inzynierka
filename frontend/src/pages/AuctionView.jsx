import '../styles/index.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WebGPUCanvas from '../components/WebGPUCanvas';

export default function AuctionView() {
 return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* lewy grid na 60% prawy na 40%*/}
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-[2fr_1.3fr] gap-10 items-start w-full">
      <div className="bg-gray-200 rounded-xl shadow-lg">
      <div className="flex items-center justify-between p-4 border-b border-black-100">
       
        <h2 className="flex items-center gap-2 text-black font-semibold">
           Wizualizacja 3D (WebGPU)
        </h2>
        
        <div className="flex items-center gap-2 text-sm">
          <button className="bg-blue-500 text-white px-2 py-1">
            Pełny ekran
          </button>
         
          <button className="bg-blue-500 text-white px-2 py-1">
            Instrukcje
          </button>
        </div>
      </div>
     
     
      {/* tu macie placeholderek ma model 3d */}
      {/* WebGPU 3D Canvas */}
      <div className="bg-black flex items-center justify-center p-4">
        <WebGPUCanvas 
          width={800}
          height={600}
          showControls={true}
        />
      </div>

      
      
      
      <div className="flex items-center justify-between text-xs text-black px-4 py-2 border-t">
        <span>Jakość renderowania: Ultra HD</span>
        
        <span>WebGPU aktywne</span>
      </div>
    </div>
     
     <div className="bg-gray-200 rounded-xl shadow-lg h-164">
        <h1>Tu bedzie ladny panel aukcji, licytacja itd</h1>
     </div>
    </div>
      <Footer />
    </div>
  );
}