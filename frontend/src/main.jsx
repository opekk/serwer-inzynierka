import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import TestPage from './pages/TestPage.jsx'
import MainPage from './pages/MainPage.jsx'

function AppRouter() {
  const path = window.location.pathname
  if (path === '/main' || path === '') {
    return <MainPage />
  }
  if (path === '/test') {
    return <TestPage />
  }
  return <MainPage />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <AppRouter />
  </StrictMode>,
)