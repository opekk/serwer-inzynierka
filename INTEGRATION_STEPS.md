# Quick Start: WebAssembly Integration

## 🎯 What Was Done

Your Emscripten WebAssembly code has been integrated into the React frontend:

1. ✅ Created `WebGPUCanvas` React component
2. ✅ Added 3D preview to MainPage (homepage)
3. ✅ Created dedicated `/viewer3d` page with full controls
4. ✅ Set up proper file structure for static assets

## 📋 Next Steps

### 1. Copy Your WebAssembly Files

Copy these 3 files to `frontend/public/`:

```powershell
Copy-Item main_debug.js frontend/public/
Copy-Item main_debug.wasm frontend/public/
Copy-Item main_debug.data frontend/public/
```

### 2. Start the Development Server

```powershell
cd frontend
npm run dev
```

### 3. Test the Integration

Visit these URLs:
- `http://localhost:5173/` - Homepage with 3D preview
- `http://localhost:5173/viewer3d` - Full 3D viewer

## 📚 Full Documentation

See `frontend/WEBGPU_INTEGRATION.md` for complete details.

## 🎨 Where the 3D Canvas Appears

- **Homepage (`/`)**: Small 3D preview (384×300px, no controls)
- **Viewer3D (`/viewer3d`)**: Large 3D canvas (1024×768px, with model buttons)

You can add `<WebGPUCanvas>` to any page!
