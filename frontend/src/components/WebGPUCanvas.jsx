import { useEffect, useRef, useState } from 'react'

/**
 * WebGPUCanvas Component
 * 
 * Integrates Emscripten-generated WebAssembly/WebGPU code into React.
 * 
 * Props:
 * - width: CSS width of the canvas (default: 800)
 * - height: CSS height of the canvas (default: 600)
 * - className: Additional CSS classes
 * - showControls: Whether to show model selection buttons (default: true)
 * - onModelChange: Callback when model changes (optional)
 */
export default function WebGPUCanvas({ 
  width = 800, 
  height = 600, 
  className = '',
  showControls = true,
  onModelChange = null
}) {
  const canvasRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [moduleReady, setModuleReady] = useState(false)
  const [currentModel, setCurrentModel] = useState('fourareen')
  
  const modelNames = ['fourareen', 'cube', 'cylinder', 'plane', 'pyramid']

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Prevent multiple initializations
    if (window.Module && window.Module.canvas) {
      console.warn('Module already initialized')
      return
    }

    // Adjust canvas for device pixel ratio
    const adjustCanvasForDPR = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
    }

    adjustCanvasForDPR()

    // Initialize Emscripten Module
    window.Module = {
      canvas: canvas,
      onRuntimeInitialized: () => {
        console.log('Emscripten runtime initialized')
        
        // Check if change_model function exists
        if (typeof window.Module.change_model !== 'function') {
          console.error('Module.change_model not found')
          setError('WebAssembly module missing required function')
          setIsLoading(false)
          return
        }

        setModuleReady(true)
        setIsLoading(false)
        console.log('WebGPU/WebAssembly ready')
      },
      onAbort: (what) => {
        console.error('Emscripten abort:', what)
        setError('WebAssembly initialization failed')
        setIsLoading(false)
      },
      print: (text) => {
        console.log('WASM:', text)
      },
      printErr: (text) => {
        console.error('WASM Error:', text)
      }
    }

    // Load the Emscripten-generated JavaScript
    const script = document.createElement('script')
    script.src = '/main_debug.js'
    script.async = true
    script.onerror = () => {
      console.error('Failed to load main_debug.js')
      setError('Failed to load WebAssembly runtime')
      setIsLoading(false)
    }

    document.body.appendChild(script)

    // Handle window resize
    const handleResize = () => {
      adjustCanvasForDPR()
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      // Note: Emscripten modules are hard to fully clean up
      // Consider this component as a singleton in your app
    }
  }, [width, height])

  const changeModel = (modelName) => {
    if (!moduleReady || !window.Module || typeof window.Module.change_model !== 'function') {
      console.error('Module not ready or change_model not available')
      return
    }

    try {
      window.Module.change_model(modelName)
      setCurrentModel(modelName)
      console.log('Model changed to:', modelName)
      
      if (onModelChange) {
        onModelChange(modelName)
      }
    } catch (e) {
      console.error('Error changing model:', e)
      setError('Failed to change model')
    }
  }

  return (
    <div className={`webgpu-canvas-container ${className}`}>
      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          tabIndex="-1"
          onContextMenu={(e) => e.preventDefault()}
          className="block bg-black rounded-lg shadow-lg"
          style={{ 
            width: width + 'px', 
            height: height + 'px',
            maxWidth: '100%'
          }}
        />
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
            <div className="text-white text-center">
              <div className="mb-2">Loading 3D viewer...</div>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 rounded-lg">
            <div className="text-red-600 bg-white px-4 py-2 rounded-lg shadow">
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Model controls */}
      {showControls && moduleReady && (
        <div className="mt-4 text-center space-x-2">
          {modelNames.map((name) => (
            <button
              key={name}
              onClick={() => changeModel(name)}
              disabled={!moduleReady || currentModel === name}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentModel === name
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
