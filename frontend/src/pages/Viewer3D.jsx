import '../styles/index.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WebGPUCanvas from '../components/WebGPUCanvas'
import { useState } from 'react'

export default function Viewer3D() {
  const [selectedModel, setSelectedModel] = useState('fourareen')

  const handleModelChange = (modelName) => {
    setSelectedModel(modelName)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto py-12 px-4 w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Przeglądarka 3D
          </h1>
          <p className="text-gray-600">
            Interaktywna wizualizacja modeli z użyciem WebGPU/WebAssembly
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex justify-center mb-6">
            <WebGPUCanvas
              width={1024}
              showControls={true}
              onModelChange={handleModelChange}
            />
          </div>
        </div>

        {/* Info section */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🎮 Sterowanie
            </h3>
            <ul className="text-gray-600 text-sm space-y-1">
              <li>• Obracanie: przeciągnij myszą</li>
              <li>• Przybliżanie: scroll</li>
              <li>• Prawy przycisk: kontekst</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ⚡ Technologia
            </h3>
            <ul className="text-gray-600 text-sm space-y-1">
              <li>• WebGPU rendering</li>
              <li>• WebAssembly (C++)</li>
              <li>• Emscripten toolchain</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              📦 Aktualny model
            </h3>
            <p className="text-gray-600 text-sm">
              Załadowano: <span className="font-mono font-semibold text-indigo-600">{selectedModel}</span>
            </p>
          </div>
        </div>

        {/* Technical info */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-indigo-900 mb-3">
            ℹ️ Informacje techniczne
          </h3>
          <div className="text-indigo-800 text-sm space-y-2">
            <p>
              Ta przeglądarka wykorzystuje kod C++ skompilowany do WebAssembly przy użyciu Emscripten.
              Rendering odbywa się za pomocą WebGPU dla maksymalnej wydajności.
            </p>
            <p className="font-medium">
              Pliki źródłowe: main_debug.js, main_debug.wasm, main_debug.data
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
