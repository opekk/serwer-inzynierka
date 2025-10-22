# Fix Vite/TailwindCSS Crash

## The Problem

The crash is caused by TailwindCSS v4 (which uses Rust/native bindings) having compatibility issues with certain Node.js versions.

```
thread '<unnamed>' panicked at ... Node-API symbol has not been loaded
```

## Solutions

### Option 1: Downgrade to TailwindCSS v3 (Recommended)

```powershell
cd frontend
npm uninstall tailwindcss @tailwindcss/vite
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init
```

Then update `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
})
```

### Option 2: Update Node.js

TailwindCSS v4 requires Node.js 18.17+ or 20.3+

Check your version:
```powershell
node --version
```

If outdated, download from: https://nodejs.org/

### Option 3: Use Emscripten Server Instead

The easiest solution - just use Python's HTTP server:

```powershell
# In project root
python -m http.server 8000
```

Then visit: http://localhost:8000/main_debug.html

### Option 4: Remove TailwindCSS v4

```powershell
cd frontend
npm uninstall tailwindcss @tailwindcss/vite
npm install
npm run dev
```

The app will work but lose Tailwind styling.

## Quick Test

After applying any fix:

```powershell
cd frontend
npm run dev
```

Should start without crashing.
