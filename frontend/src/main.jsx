import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import TestPage from './pages/TestPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <TestPage />
  </StrictMode>,
)
