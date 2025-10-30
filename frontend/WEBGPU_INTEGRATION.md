# WebAssembly/WebGPU Integration Guide

This document explains how to integrate your Emscripten-generated WebAssembly code into the React frontend.

## 📁 File Structure

```
frontend/
├── public/                    # Static files served by Vite
│   ├── main_debug.js         # ← Copy your Emscripten JS here
│   ├── main_debug.wasm       # ← Copy your WebAssembly binary here
│   └── main_debug.data       # ← Copy your data file here
├── src/
│   ├── components/
│   │   └── WebGPUCanvas.jsx  # ✨ NEW: React wrapper for WebGPU canvas
│   ├── pages/
│   │   ├── MainPage.jsx      # ✅ Updated: Includes 3D preview
│   │   └── Viewer3D.jsx      # ✨ NEW: Full 3D viewer page
│   └── main.jsx              # ✅ Updated: Added /viewer3d route
```

## 🚀 Setup Instructions

### Step 1: Copy WebAssembly Files

Copy your 4 Emscripten-generated files to the `frontend/public/` directory:

```powershell
# From the root of your project (serwer-inzynierka)
Copy-Item main_debug.js frontend/public/
Copy-Item main_debug.wasm frontend/public/
Copy-Item main_debug.data frontend/public/
```

> **Note:** The `main_debug.html` file is NOT needed. Its functionality has been integrated into React components.

### Step 2: Install Dependencies (if needed)

```powershell
cd frontend
npm install
```

### Step 3: Run the Development Server

```powershell
npm run dev
```

The app should start at `http://localhost:5173` (or another port if 5173 is busy).

## 🌐 Available Routes

- **`/`** or **`/main`** - Main landing page with 3D preview (no controls)
- **`/viewer3d`** or **`/3d`** - Full 3D viewer with model selection controls
- **`/auctions`** - Auctions page
- **`/auctionview`** - Auction detail view
- **`/test`** - Test page

## 🎨 Component Usage

### WebGPUCanvas Component

The `WebGPUCanvas` component wraps your Emscripten canvas and provides a React-friendly API.

#### Basic Usage

```jsx
import WebGPUCanvas from '../components/WebGPUCanvas'

function MyPage() {
  return (
    <WebGPUCanvas 
      width={800}
      height={600}
      showControls={true}
    />
  )
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | number | 800 | CSS width of the canvas in pixels |
| `height` | number | 600 | CSS height of the canvas in pixels |
| `className` | string | '' | Additional CSS classes |
| `showControls` | boolean | true | Show model selection buttons |
| `onModelChange` | function | null | Callback when model changes: `(modelName) => {}` |

#### Example with Callback

```jsx
<WebGPUCanvas 
  width={1024}
  height={768}
  showControls={true}
  onModelChange={(modelName) => {
    console.log('Switched to:', modelName)
  }}
/>
```

## 🔧 How It Works

### 1. Module Initialization

The `WebGPUCanvas` component:
- Creates a `<canvas>` element with proper DPI handling
- Initializes the global `window.Module` object expected by Emscripten
- Dynamically loads `/main_debug.js` which in turn loads `.wasm` and `.data`
- Waits for `onRuntimeInitialized` callback before enabling controls

### 2. Model Switching

The component exposes your C++ `change_model()` function through React:
- Available models: `fourareen`, `cube`, `cylinder`, `plane`, `pyramid`
- Calls `window.Module.change_model(name)` when buttons are clicked
- Updates UI state and triggers optional callback

### 3. Static File Serving

Vite automatically serves files from the `public/` folder at the root URL:
- `/main_debug.js` → `frontend/public/main_debug.js`
- `/main_debug.wasm` → `frontend/public/main_debug.wasm`
- `/main_debug.data` → `frontend/public/main_debug.data`

## ⚠️ Important Notes

### Browser Compatibility

- **WebGPU** requires a modern browser (Chrome 113+, Edge 113+, etc.)
- Firefox has experimental WebGPU support (must be enabled in about:config)
- Safari has partial support in Technology Preview

### Performance

- The canvas uses `devicePixelRatio` for sharp rendering on high-DPI displays
- This means a 1000×1000 CSS canvas might be 2000×2000 pixels on retina displays
- Adjust the size if performance is an issue

### CORS and File Loading

- Emscripten files must be served from the same origin (handled by Vite)
- In production, ensure `.wasm` and `.data` files have correct MIME types

### Module Singleton

- The Emscripten module is essentially a singleton (one instance per page)
- Avoid mounting multiple `WebGPUCanvas` components simultaneously
- If you need multiple canvases, you'll need to modify the Emscripten build

## 🐛 Troubleshooting

### "Failed to load main_debug.js"

- Ensure the file is in `frontend/public/main_debug.js`
- Check browser console for 404 errors
- Verify Vite dev server is running

### "Module.change_model not found"

- Your C++ code must export `change_model` using `EMSCRIPTEN_BINDINGS`
- Check the Emscripten build configuration
- Ensure `-s EXPORTED_FUNCTIONS` or similar flags are set correctly

### Canvas is blurry

- The component handles DPI automatically
- If still blurry, check if CSS size matches internal buffer size

### Models not rendering

- Check browser console for WebGPU errors
- Verify browser supports WebGPU: visit https://webgpu.io
- Ensure `.data` file loaded correctly (check Network tab)

## 📦 Production Build

When ready to deploy:

```powershell
npm run build
```

This creates a `dist/` folder with optimized files. The `public/` folder contents are copied to the root of `dist/`:

```
dist/
├── index.html
├── assets/
│   ├── main-[hash].js
│   └── main-[hash].css
├── main_debug.js
├── main_debug.wasm
└── main_debug.data
```

Serve the `dist/` folder with any static file server.

## 🎯 Next Steps

1. **Copy the WebAssembly files** to `frontend/public/`
2. **Test the integration** by visiting `/viewer3d`
3. **Customize the UI** to match your design system
4. **Add more controls** if needed (lighting, camera position, etc.)
5. **Integrate into auction pages** by adding `<WebGPUCanvas>` where needed

## 📝 Additional Resources

- [Emscripten Documentation](https://emscripten.org/)
- [WebGPU Fundamentals](https://webgpufundamentals.org/)
- [Vite Static Asset Handling](https://vitejs.dev/guide/assets.html)
- [React Hooks Reference](https://react.dev/reference/react)

---

**Questions?** Check the browser console for detailed error messages.
