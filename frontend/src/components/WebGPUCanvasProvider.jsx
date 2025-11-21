/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const MODEL_NAMES = ['fourareen', 'cube', 'cylinder', 'plane', 'pyramid']
const DEFAULT_PRESENTATION_OPTIONS = {
  width: 800,
  height: 600,
  className: '',
  showControls: true
}

const WebGPUCanvasContext = createContext(null)

function scheduleMicrotask(fn) {
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(fn)
    return
  }

  Promise.resolve()
    .then(fn)
    .catch((err) => console.error('WebGPU microtask error:', err))
}

function ensureGlobalState() {
  if (typeof window === 'undefined') {
    return {
      scriptAppended: false,
      moduleReady: false
    }
  }

  if (!window.__sharedWebGPUState) {
    window.__sharedWebGPUState = {
      scriptAppended: false,
      moduleReady: false
    }
  }

  return window.__sharedWebGPUState
}

function getNormalizedOptions(options = {}) {
  const widthProvided = typeof options.width === 'number' && !Number.isNaN(options.width)
  const heightProvided = typeof options.height === 'number' && !Number.isNaN(options.height)
  const explicitStretch = options.stretchToContainer === true

  let width = widthProvided ? options.width : undefined

  if (!width && heightProvided) {
    width = (options.height * 4) / 3
  }

  if (!width) {
    width = DEFAULT_PRESENTATION_OPTIONS.width
  }

  width = Math.max(1, Math.round(width))
  const height = Math.max(1, Math.round((width * 3) / 4))

  return {
    width,
    height,
    className: options.className ?? DEFAULT_PRESENTATION_OPTIONS.className,
    showControls:
      typeof options.showControls === 'boolean'
        ? options.showControls
        : DEFAULT_PRESENTATION_OPTIONS.showControls,
    stretchToContainer: explicitStretch || !(widthProvided || heightProvided)
  }
}

function optionsEqual(a, b) {
  return (
    a.width === b.width &&
    a.height === b.height &&
    a.className === b.className &&
    a.showControls === b.showControls &&
    a.stretchToContainer === b.stretchToContainer
  )
}

function applyCanvasSizing(canvas, cssWidth, cssHeight, intrinsicWidth, intrinsicHeight) {
  if (!canvas || typeof window === 'undefined') {
    return
  }

  if (typeof cssWidth === 'number') {
    canvas.style.width = `${cssWidth}px`
  }
  if (typeof cssHeight === 'number') {
    canvas.style.height = `${cssHeight}px`
  }
  canvas.style.maxWidth = '100%'

  if (intrinsicWidth && intrinsicHeight) {
    if (canvas.width !== intrinsicWidth) {
      canvas.width = intrinsicWidth
    }
    if (canvas.height !== intrinsicHeight) {
      canvas.height = intrinsicHeight
    }
  }
}

function SharedWebGPUCanvas({
  options,
  isLoading,
  setIsLoading,
  error,
  setError,
  moduleReady,
  setModuleReady
}) {
  const canvasRef = useRef(null)
  const initRef = useRef(false)
  const { width, height, className } = options

  const syncCanvasSizing = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    const intrinsicWidth = Math.max(1, Math.round(width * dpr))
    const intrinsicHeight = Math.max(1, Math.round(height * dpr))

    applyCanvasSizing(canvas, width, height, intrinsicWidth, intrinsicHeight)

    if (
      moduleReady &&
      typeof window !== 'undefined' &&
      window.Module &&
      typeof window.Module.resize_canvas === 'function'
    ) {
      try {
        window.Module.resize_canvas(intrinsicWidth, intrinsicHeight)
      } catch (err) {
        console.error('Module.resize_canvas failed:', err)
      }
    }
  }, [width, height, moduleReady])

  useEffect(() => {
    syncCanvasSizing()
  }, [syncCanvasSizing])

  useEffect(() => {
    if (moduleReady) {
      syncCanvasSizing()
    }
  }, [moduleReady, syncCanvasSizing])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleResize = () => {
      syncCanvasSizing()
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [syncCanvasSizing])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const canvas = canvasRef.current
    if (!canvas || initRef.current) {
      return
    }

    initRef.current = true
    setIsLoading(true)
    setError(null)

    const globalState = ensureGlobalState()

    if (globalState.moduleReady && window.Module && typeof window.Module.change_model === 'function') {
      window.Module.canvas = canvas
      syncCanvasSizing()
      setModuleReady(true)
      setIsLoading(false)
      return
    }

    const moduleConfig = window.Module || {}
    const previousRuntimeInit = moduleConfig.onRuntimeInitialized
    const previousAbort = moduleConfig.onAbort

    // Database / IDBFS
    const DB_NAME = 'models.db'
    moduleConfig.preRun = moduleConfig.preRun || []
    moduleConfig.preRun.push(() => {
      try {
        const FSRef = (typeof globalThis !== 'undefined' && globalThis.FS) || (typeof window !== 'undefined' && window.FS)
        const IDBFSRef = (typeof globalThis !== 'undefined' && globalThis.IDBFS) || (typeof window !== 'undefined' && window.IDBFS)
        if (FSRef && IDBFSRef) {
          if (!FSRef.analyzePath('/database').exists) {
            FSRef.mkdir('/database')
          }
          // IDBFS mount (will persist between sessions)
          FSRef.mount(IDBFSRef, {}, '/database')

          // Mount a persistent cache for fetched resources so EMSCRIPTEN_FETCH_PERSIST_FILE
          // writes survive reloads. Ensure the mount point exists first.
          try {
            if (!FSRef.analyzePath('/resources_cache').exists) {
              FSRef.mkdir('/resources_cache')
            }
            FSRef.mount(IDBFSRef, {}, '/resources_cache')
          } catch (mountErr) {
            console.warn('Failed to mount IDBFS at /resources_cache:', mountErr)
          }

          // Ensure common asset directories exist in VFS for persisted fetches
          try {
            if (!FSRef.analyzePath('/public').exists) {
              FSRef.mkdir('/public')
            }
            if (!FSRef.analyzePath('/public/resources').exists) {
              if (typeof FSRef.mkdirTree === 'function') {
                FSRef.mkdirTree('/public/resources')
              } else {
                FSRef.mkdir('/public/resources')
              }
            }
            if (!FSRef.analyzePath('/resources').exists) {
              FSRef.mkdir('/resources')
            }
          } catch (dirErr) {
            console.warn('Failed to ensure VFS asset directories:', dirErr)
          }
        }
      } catch (err) {
        console.error('IDBFS mount failed:', err)
      }
    })

    moduleConfig.canvas = canvas
    moduleConfig.onRuntimeInitialized = () => {
      previousRuntimeInit?.()

      // Configure resource base for Emscripten-side fetches, e.g. emscripten_fetch("resources/...")
      try {
        const basePrefix = (import.meta.env.BASE_URL || '/').toString()
        const normalized = basePrefix.endsWith('/') ? basePrefix : basePrefix + '/'
        const resourceBasePath = `${normalized}resources/` // e.g. "/resources/" or "/app/resources/"
        // Always expose resource base for C++ via Module property
        window.Module = window.Module || {}
        window.Module.resource_base = resourceBasePath
        if (typeof window.Module.set_resource_base === 'function') {
          window.Module.set_resource_base(resourceBasePath)
        } else {
          console.warn('Module.set_resource_base is not available')
        }
        console.log('[WebGPU] Resource base prepared:', resourceBasePath)
      } catch (e) {
        console.warn('[WebGPU] Failed to configure resource base:', e)
      }

      const finalizeReady = () => {
        // Pre-size canvas without invoking WASM-side resize yet.
        try {
          const canvas = canvasRef.current
          if (canvas) {
            const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
            const intrinsicWidth = Math.max(1, Math.round(width * dpr))
            const intrinsicHeight = Math.max(1, Math.round(height * dpr))
            applyCanvasSizing(canvas, width, height, intrinsicWidth, intrinsicHeight)
          }
        } catch (err) {
          console.warn('Canvas pre-size failed:', err)
        }

        // Mark module ready and clear loading
        const gs = ensureGlobalState()
        gs.moduleReady = true
        setModuleReady(true)
        setIsLoading(false)
        setError(null)

        // Delay WASM-side resize to avoid overlapping async model load
        setTimeout(() => {
          try {
            syncCanvasSizing()
          } catch (err) {
            console.warn('Deferred resize failed:', err)
          }
        }, 1000)
      }

      // Sync IDBFS and seed database if needed before signaling ready
      try {
        const FSRef = (typeof globalThis !== 'undefined' && globalThis.FS) || (typeof window !== 'undefined' && window.FS)
        if (FSRef) {
          FSRef.syncfs(true, () => {
            try {
              const destPath = `/database/${DB_NAME}`
              const seedPath = `/seed/${DB_NAME}`
              const destExists = FSRef.analyzePath(destPath).exists
              const seedExists = FSRef.analyzePath(seedPath).exists

              const writeAndPersist = (data, done) => {
                try {
                  FSRef.writeFile(destPath, data)
                  FSRef.syncfs(false, () => {
                    console.log(`[WebGPU] Seeded database ${DB_NAME} to IDBFS.`)
                    done?.()
                  })
                } catch (e) {
                  console.error('Writing seeded DB failed:', e)
                  done?.()
                }
              }

              if (!destExists) {
                if (seedExists) {
                  // Embedded via --preload-file
                  const data = FSRef.readFile(seedPath)
                  writeAndPersist(data, finalizeReady)
                } else {
                  // Fallback fetch from /seed/ served publicly
                  fetch(`/seed/${DB_NAME}`)
                    .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(r.statusText))))
                    .then((buf) => writeAndPersist(new Uint8Array(buf), finalizeReady))
                    .catch((err) => {
                      console.warn(`[WebGPU] No seed database found at /seed/${DB_NAME}:`, err)
                      finalizeReady()
                    })
                }
              } else {
                console.log(`[WebGPU] Existing database found: ${destPath}`)
                finalizeReady()
              }
            } catch (seedErr) {
              console.error('Database seed logic error:', seedErr)
              finalizeReady()
            }
          })
        } else {
          finalizeReady()
        }
      } catch (syncErr) {
        console.error('IDBFS sync/seed failed:', syncErr)
        finalizeReady()
      }
    }
    moduleConfig.onAbort = (what) => {
      previousAbort?.(what)
      console.error('Emscripten abort:', what)
      globalState.moduleReady = false
      setModuleReady(false)
      setError('WebAssembly initialization failed')
      setIsLoading(false)
    }
    moduleConfig.print = moduleConfig.print || ((text) => console.log('WASM:', text))
    moduleConfig.printErr = moduleConfig.printErr || ((text) => console.error('WASM Error:', text))

    window.Module = moduleConfig

    if (!globalState.scriptAppended) {
      const script = document.createElement('script')
      script.src = '/main.js'
      script.async = true
      script.onerror = () => {
        console.error('Failed to load main.js')
        setError('Failed to load WebAssembly runtime')
        setIsLoading(false)
      }

      document.body.appendChild(script)
      globalState.scriptAppended = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setError, setIsLoading, setModuleReady, syncCanvasSizing])

  const rootClassName = ['webgpu-canvas-container', className].filter(Boolean).join(' ')

  return (
    <div className={rootClassName}>
      <div className="relative">
        <canvas
          ref={canvasRef}
          tabIndex="-1"
          onContextMenu={(e) => e.preventDefault()}
          // was: className="block bg-black rounded-lg shadow-lg"
          className="block bg-transparent rounded-lg shadow-lg"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            maxWidth: '100%',
            // ensure inline transparency even if classes change
            backgroundColor: 'transparent'
          }}
        />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
            <div className="text-white text-center">
              <div className="mb-2">
                {moduleReady ? 'Loading model…' : 'Initializing 3D viewer…'}
              </div>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 rounded-lg">
            <div className="text-red-600 bg-white px-4 py-2 rounded-lg shadow">
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Model switcher removed (demo only). */}
    </div>
  )
}

export function WebGPUCanvasProvider({ children }) {
  const fallbackRef = useRef(null)
  const [hostNode, setHostNode] = useState(null)
  const [activeSlot, setActiveSlot] = useState(() => ({
    slotId: null,
    container: null,
    options: getNormalizedOptions(),
    onModelChange: null
  }))
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [moduleReady, setModuleReady] = useState(false)
  const [currentModel, setCurrentModel] = useState('fourareen')

  const currentModelRef = useRef('fourareen')
  useEffect(() => {
    currentModelRef.current = currentModel
  }, [currentModel])

  const onModelChangeRef = useRef(null)

  useEffect(() => {
    if (!fallbackRef.current) {
      return
    }

    setActiveSlot((prev) => {
      if (prev.container) {
        return prev
      }

      return {
        ...prev,
        container: fallbackRef.current
      }
    })
  }, [])

  const notifyModelChange = useCallback((modelName) => {
    const handler = onModelChangeRef.current
    if (typeof handler === 'function') {
      try {
        handler(modelName)
      } catch (err) {
        console.error('WebGPU onModelChange handler error:', err)
      }
    }
  }, [])

  const attachSlot = useCallback(
    (slotId, container, options) => {
      if (!container) {
        return
      }

      const normalized = getNormalizedOptions(options)
      const callback = typeof options.onModelChange === 'function' ? options.onModelChange : null
      onModelChangeRef.current = callback
      const requestedModel = typeof options.model === 'string' ? options.model : null

      setActiveSlot((prev) => {
        const replacingAnotherSlot = prev.slotId && prev.slotId !== slotId
        if (replacingAnotherSlot) {
          console.warn('Shared WebGPU canvas slot reassigned to a new component instance.')
        }

        const sameSlot = prev.slotId === slotId
        const sameContainer = prev.container === container
        const callbackChanged = prev.onModelChange !== callback

        if (sameSlot && sameContainer && optionsEqual(prev.options, normalized) && !callbackChanged) {
          return prev
        }

        if (callback && (prev.slotId !== slotId || callbackChanged)) {
          scheduleMicrotask(() => notifyModelChange(currentModelRef.current))
        }

        const next = {
          slotId,
          container,
          options: normalized,
          onModelChange: callback
        }

        if (requestedModel && requestedModel !== currentModelRef.current) {
          // Show loading overlay while switching models
          setIsLoading(true)
          scheduleMicrotask(() => {
            if (window.Module && typeof window.Module.change_model === 'function') {
              try {
                window.Module.change_model(requestedModel)
                currentModelRef.current = requestedModel
              } catch (err) {
                console.error('Auto model change failed:', err)
              } finally {
                // Heuristic: keep overlay visible briefly to cover black frame
                setTimeout(() => setIsLoading(false), 1000)
              }
            } else {
              setIsLoading(false)
            }
          })
        }

        return next
      })
    },
    [notifyModelChange]
  )

  const detachSlot = useCallback((slotId) => {
    setActiveSlot((prev) => {
      if (prev.slotId !== slotId) {
        return prev
      }

      onModelChangeRef.current = null

      return {
        slotId: null,
        container: fallbackRef.current,
        options: getNormalizedOptions(),
        onModelChange: null
      }
    })
  }, [])

  const changeModel = useCallback(
    (modelName) => {
      if (!moduleReady) {
        console.warn('WebGPU module not ready yet.')
        return false
      }

      if (!window.Module || typeof window.Module.change_model !== 'function') {
        console.error('Module.change_model not available')
        setError('WebAssembly module missing required function')
        return false
      }

      try {
        window.Module.change_model(modelName)
        setCurrentModel(modelName)
        currentModelRef.current = modelName
        setError(null)
        notifyModelChange(modelName)
        return true
      } catch (err) {
        console.error('Error changing model:', err)
        setError('Failed to change model')
        return false
      }
    },
    [moduleReady, notifyModelChange]
  )

  const publicApi = useMemo(
    () => ({
      moduleReady,
      isLoading,
      error,
      currentModel,
      changeModel,
      modelNames: MODEL_NAMES
    }),
    [moduleReady, isLoading, error, currentModel, changeModel]
  )

  const contextValue = useMemo(
    () => ({
      attachSlot,
      detachSlot,
      publicApi
    }),
    [attachSlot, detachSlot, publicApi]
  )

  const activeContainer = activeSlot.container
  const presentationOptions = activeSlot.options || getNormalizedOptions()

  useEffect(() => {
    const host = hostNode
    const fallback = fallbackRef.current
    const target = activeContainer || fallback
    if (!host || !target) {
      return
    }

    if (host.parentNode !== target) {
      target.appendChild(host)
    }
  }, [hostNode, activeContainer])

  return (
    <WebGPUCanvasContext.Provider value={contextValue}>
      {children}
      <div ref={fallbackRef} style={{ display: 'none' }}>
        <div ref={setHostNode} />
      </div>
      {hostNode
        ? createPortal(
            <SharedWebGPUCanvas
              options={presentationOptions}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              error={error}
              setError={setError}
              moduleReady={moduleReady}
              setModuleReady={setModuleReady}
            />,
            hostNode
          )
        : null}
    </WebGPUCanvasContext.Provider>
  )
}

export function useWebGPUCanvasInternal() {
  const context = useContext(WebGPUCanvasContext)
  if (!context) {
    throw new Error('WebGPU canvas components must be wrapped in WebGPUCanvasProvider')
  }

  return context
}

export function useWebGPUCanvas() {
  const context = useWebGPUCanvasInternal()
  return context.publicApi
}
