import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import TestPage from './pages/TestPage.jsx'
import MainPage from './pages/MainPage.jsx'
import Auctions from './pages/Auctions.jsx'
import AuctionView from './pages/AuctionView.jsx'
import Viewer3D from './pages/Viewer3D.jsx'

function AppRouter() {
  const path = window.location.pathname
  if (path === '/main' || path === '/' || path === '') {
    return <MainPage />
  }
  if (path === '/test') {
    return <TestPage />
  }

  if (path === '/auctions') {
    return <Auctions />
  } 

  if (path === '/auctionview') {
    return <AuctionView />
  }

  if (path === '/viewer3d' || path === '/3d') {
    return <Viewer3D />
  }

  // Fallback to MainPage for unknown routes
  return <MainPage />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <AppRouter />
  </StrictMode>,
)