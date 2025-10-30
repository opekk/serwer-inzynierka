# ✅ Integration Checklist

Use this checklist to ensure everything is set up correctly.

## 📦 Step 1: Copy WebAssembly Files

- [ ] Copy `main_debug.js` to `frontend/public/main_debug.js`
- [ ] Copy `main_debug.wasm` to `frontend/public/main_debug.wasm`
- [ ] Copy `main_debug.data` to `frontend/public/main_debug.data`

**Quick command:**
```powershell
.\copy-wasm-files.ps1
```

## 🔍 Step 2: Verify Files

- [ ] Check that `frontend/public/` directory exists
- [ ] Confirm all 3 files are present in `frontend/public/`
- [ ] File sizes look reasonable (not 0 bytes)

## 📥 Step 3: Install Dependencies

```powershell
cd frontend
npm install
```

- [ ] No errors during installation
- [ ] `node_modules` directory created
- [ ] React and Vite are installed

## 🚀 Step 4: Start Development Server

```powershell
npm run dev
```

- [ ] Server starts without errors
- [ ] Port number shown (usually 5173)
- [ ] No compilation errors in terminal

## 🌐 Step 5: Test in Browser

### Homepage Test
1. [ ] Open `http://localhost:5173/` in browser
2. [ ] Page loads without errors
3. [ ] 3D canvas appears in hero section
4. [ ] Loading spinner shows then disappears
5. [ ] 3D model is visible and renders
6. [ ] No console errors (check F12 Developer Tools)

### Viewer 3D Test
1. [ ] Click "Przeglądarka 3D" in navbar OR visit `http://localhost:5173/viewer3d`
2. [ ] Full-size canvas loads
3. [ ] Model control buttons appear below canvas
4. [ ] Click each model button:
   - [ ] fourareen
   - [ ] cube
   - [ ] cylinder
   - [ ] plane
   - [ ] pyramid
5. [ ] Each model loads and displays correctly
6. [ ] Active button is highlighted
7. [ ] No console errors

## 🔧 Step 6: Verify Functionality

### Canvas Interaction
- [ ] Canvas background is black (not gray/white)
- [ ] Can interact with 3D scene (mouse/touch)
- [ ] Canvas is sharp (not blurry) on your display
- [ ] Canvas resizes properly when window resizes

### Navigation
- [ ] "Przeglądarka 3D" link in navbar works
- [ ] Can navigate between pages
- [ ] 3D canvas doesn't break other pages

### Network
Open browser DevTools (F12) → Network tab:
- [ ] `main_debug.js` loads successfully (Status: 200)
- [ ] `main_debug.wasm` loads successfully (Status: 200)
- [ ] `main_debug.data` loads successfully (Status: 200)
- [ ] No 404 errors

### Console
Open browser DevTools (F12) → Console tab:
- [ ] "Emscripten runtime initialized" message appears
- [ ] "WebGPU/WebAssembly ready" message appears
- [ ] No red error messages
- [ ] "Model changed to: [name]" appears when clicking buttons

## 🎨 Step 7: Visual Verification

### Main Page (`/`)
- [ ] 3D canvas fits in white card
- [ ] Canvas is centered
- [ ] No model control buttons visible
- [ ] Text and layout look correct

### Viewer 3D Page (`/viewer3d`)
- [ ] Large canvas displays prominently
- [ ] Model buttons are below canvas
- [ ] Three info cards display correctly
- [ ] Blue info box at bottom visible
- [ ] Page layout is clean and professional

## 🐛 Troubleshooting Checks

If something doesn't work, check:

### Files Not Loading
- [ ] WebAssembly files are in correct location: `frontend/public/`
- [ ] File names are exact: `main_debug.js`, not `main-debug.js`
- [ ] Dev server is running (`npm run dev`)
- [ ] No firewall blocking localhost

### Canvas Not Rendering
- [ ] Browser supports WebGPU (visit https://webgpu.io)
- [ ] Try Chrome 113+ or Edge 113+
- [ ] Check console for WebGPU errors
- [ ] Verify `.wasm` and `.data` files loaded

### Buttons Not Working
- [ ] Console shows "Emscripten runtime initialized"
- [ ] Console shows "WebGPU/WebAssembly ready"
- [ ] `Module.change_model` function exists
- [ ] No JavaScript errors in console

### Blurry Canvas
- [ ] Component uses `devicePixelRatio` (already implemented)
- [ ] CSS size matches expected dimensions
- [ ] Try different zoom level (Ctrl + 0)

## 📊 Success Indicators

You'll know it's working when:

✅ No red errors in browser console
✅ Canvas shows 3D model with black background
✅ Model buttons change the displayed model
✅ Console logs "Model changed to: [name]" on button clicks
✅ Canvas is sharp and clear
✅ Can interact with 3D scene

## 🎉 Final Verification

- [ ] All checkboxes above are complete
- [ ] Homepage shows 3D preview
- [ ] Viewer 3D page has full functionality
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Ready to continue development!

---

## 📝 Notes

If you encounter issues, check these files for detailed help:
- `INTEGRATION_SUMMARY.md` - Complete overview
- `frontend/WEBGPU_INTEGRATION.md` - Technical documentation
- `VISUAL_GUIDE.md` - Diagrams and visual explanations

**Browser DevTools (F12) is your friend!** Check Console and Network tabs for detailed error information.

---

**Status:** 
- [ ] Not Started
- [ ] In Progress
- [ ] ✅ Complete and Working!
