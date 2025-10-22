# 📊 Visual Integration Guide

## File Organization

```
serwer-inzynierka/
│
├── 📄 main_debug.js         ← Your Emscripten file (copy to frontend/public/)
├── 📄 main_debug.wasm       ← Your WebAssembly binary (copy to frontend/public/)
├── 📄 main_debug.data       ← Your data file (copy to frontend/public/)
├── 📄 main_debug.html       ← Original (NOT NEEDED - integrated into React)
│
├── 📄 copy-wasm-files.ps1   ← Helper script to copy files
├── 📄 INTEGRATION_STEPS.md  ← Quick start guide
└── 📄 INTEGRATION_SUMMARY.md ← This summary
│
└── frontend/
    ├── 📁 public/                      ← Static files served by Vite
    │   ├── main_debug.js      ✅ COPY HERE
    │   ├── main_debug.wasm    ✅ COPY HERE
    │   └── main_debug.data    ✅ COPY HERE
    │
    ├── 📁 src/
    │   ├── 📁 components/
    │   │   ├── WebGPUCanvas.jsx        ✨ NEW - Main component
    │   │   ├── Navbar.jsx              ✏️ MODIFIED - Added 3D viewer link
    │   │   └── Footer.jsx
    │   │
    │   ├── 📁 pages/
    │   │   ├── MainPage.jsx            ✏️ MODIFIED - Has 3D preview
    │   │   ├── Viewer3D.jsx            ✨ NEW - Full 3D viewer page
    │   │   ├── Auctions.jsx
    │   │   ├── AuctionView.jsx
    │   │   └── TestPage.jsx
    │   │
    │   └── main.jsx                    ✏️ MODIFIED - Added /viewer3d route
    │
    └── 📄 WEBGPU_INTEGRATION.md        ← Detailed documentation
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     User Opens Page                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              React Component Renders                        │
│              <WebGPUCanvas width={800} height={600} />      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            useEffect Hook Runs (on mount)                   │
│  1. Create canvas element with ref                          │
│  2. Adjust canvas size for DPI                              │
│  3. Set up window.Module object                             │
│  4. Load main_debug.js dynamically                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           main_debug.js Loads and Executes                  │
│  - Fetches main_debug.wasm                                  │
│  - Fetches main_debug.data                                  │
│  - Initializes WebAssembly module                           │
│  - Compiles and instantiates WASM                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         window.Module.onRuntimeInitialized Called           │
│  - React state updates: setModuleReady(true)                │
│  - React state updates: setIsLoading(false)                 │
│  - Model buttons become enabled                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 3D Scene Renders!                           │
│  - WebGPU context active                                    │
│  - Canvas shows 3D model                                    │
│  - User can interact                                        │
└─────────────────────────────────────────────────────────────┘

                  User Clicks Button
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         changeModel('cube') Function Called                 │
│  - Calls window.Module.change_model('cube')                 │
│  - C++ function executes in WebAssembly                     │
│  - New model loads and renders                              │
│  - React state updates: setCurrentModel('cube')             │
│  - Optional callback triggers: onModelChange('cube')        │
└─────────────────────────────────────────────────────────────┘
```

## Page Layouts

### 1. Main Page (/) - Hero Section with 3D Preview

```
┌───────────────────────────────────────────────────────────────┐
│  Navbar                                                       │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐          ┌──────────────────────┐      │
│  │                 │          │  ┌────────────────┐  │      │
│  │  Text Content   │          │  │                │  │      │
│  │  - Title        │          │  │  3D Canvas     │  │      │
│  │  - Description  │          │  │  (384×300)     │  │      │
│  │  - Buttons      │          │  │  No controls   │  │      │
│  │                 │          │  │                │  │      │
│  └─────────────────┘          │  └────────────────┘  │      │
│                               │                      │      │
│                               │  Interaktywna        │      │
│                               │  wizualizacja 3D     │      │
│                               │  [WebGPU][HD][Mobile]│      │
│                               └──────────────────────┘      │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### 2. Viewer 3D Page (/viewer3d) - Full Featured Viewer

```
┌───────────────────────────────────────────────────────────────┐
│  Navbar                                                       │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│              Przeglądarka 3D                                  │
│       Interaktywna wizualizacja modeli...                     │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                                                         │ │
│  │              ┌─────────────────────┐                   │ │
│  │              │                     │                   │ │
│  │              │   3D Canvas         │                   │ │
│  │              │   (1024×768)        │                   │ │
│  │              │                     │                   │ │
│  │              │                     │                   │ │
│  │              └─────────────────────┘                   │ │
│  │                                                         │ │
│  │  [fourareen] [cube] [cylinder] [plane] [pyramid]       │ │
│  │                                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ 🎮 Controls │  │ ⚡ Tech     │  │ 📦 Model    │         │
│  │ - Rotate    │  │ - WebGPU   │  │ - fourareen │         │
│  │ - Zoom      │  │ - WASM     │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                               │
│  ℹ️ Informacje techniczne                                    │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Ta przeglądarka wykorzystuje kod C++...                 │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│  Footer                                                       │
└───────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App (main.jsx)
│
├─ Route: / or /main
│  └─ MainPage.jsx
│     ├─ Navbar.jsx
│     ├─ Hero Section
│     │  └─ WebGPUCanvas (384×300, no controls)
│     └─ Footer.jsx
│
├─ Route: /viewer3d or /3d
│  └─ Viewer3D.jsx
│     ├─ Navbar.jsx
│     ├─ WebGPUCanvas (1024×768, with controls)
│     └─ Footer.jsx
│
├─ Route: /auctions
│  └─ Auctions.jsx
│
├─ Route: /auctionview
│  └─ AuctionView.jsx
│
└─ Route: /test
   └─ TestPage.jsx
```

## State Management in WebGPUCanvas

```
Component State:
┌────────────────────────────────────┐
│ isLoading: boolean                 │  Initial: true
│ - Shows loading spinner            │  After init: false
│ - Disables interactions            │
├────────────────────────────────────┤
│ error: string | null               │  Initial: null
│ - Displays error messages          │  On error: error message
│ - Shows if WASM fails to load      │
├────────────────────────────────────┤
│ moduleReady: boolean               │  Initial: false
│ - Controls button availability     │  After init: true
│ - Enables model switching          │
├────────────────────────────────────┤
│ currentModel: string               │  Initial: 'fourareen'
│ - Tracks active model              │  On change: new model name
│ - Highlights active button         │
└────────────────────────────────────┘

Refs:
┌────────────────────────────────────┐
│ canvasRef: HTMLCanvasElement       │
│ - Direct reference to canvas DOM   │
│ - Passed to Emscripten Module      │
└────────────────────────────────────┘
```

## Network Requests Timeline

```
Page Load
    │
    ├─ React bundle loads
    │      │
    │      └─ WebGPUCanvas renders
    │             │
    │             └─ useEffect triggers
    │                    │
    │                    └─ Creates <script> tag
    │
    ├─ Browser fetches: /main_debug.js
    │      ↓
    │   [main_debug.js downloads ~500KB-2MB]
    │      ↓
    │   [main_debug.js executes]
    │      │
    │      ├─ Fetches: /main_debug.wasm
    │      │      ↓
    │      │   [WASM downloads ~1-10MB]
    │      │      ↓
    │      │   [WASM compiles]
    │      │
    │      └─ Fetches: /main_debug.data
    │             ↓
    │          [Data file downloads ~1-50MB]
    │             ↓
    │          [Models/textures load]
    │
    └─ onRuntimeInitialized called
           │
           └─ 3D Scene Ready! 🎉
```

## Props Flow

```
Parent Component (e.g., MainPage.jsx)
       │
       │  <WebGPUCanvas 
       │    width={384}
       │    height={300}
       │    showControls={false}
       │    onModelChange={handleChange}
       │  />
       │
       ▼
WebGPUCanvas Component
       │
       ├─ width (number)         → Canvas CSS width
       ├─ height (number)        → Canvas CSS height  
       ├─ className (string)     → Additional CSS classes
       ├─ showControls (boolean) → Show/hide model buttons
       └─ onModelChange (func)   → Callback on model change
              │
              └─ Called with: (modelName: string) => void
```

## Browser Compatibility Check

```
User Opens Page
    │
    ├─ Does browser support WebGPU?
    │     │
    │     ├─ YES ✅
    │     │   └─ Everything works
    │     │
    │     └─ NO ❌
    │         └─ WebGPU calls fail
    │             └─ Error state shown
    │                 └─ User sees error message
    │
    └─ Check at: https://webgpu.io
```

## Quick Reference: Model Names

```
Available models in change_model():

1. fourareen   ← Default model
2. cube
3. cylinder
4. plane
5. pyramid

Usage:
  window.Module.change_model('cube')
  
Or via React:
  <WebGPUCanvas /> component handles this automatically
```

---

**Note:** All diagrams are simplified representations. Actual implementation may involve additional steps handled by React, Vite, and Emscripten.
