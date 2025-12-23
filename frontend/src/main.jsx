import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './styles/index.css'
// import tw-elements CSS to enable theme utility classes like `bg-primary`
import 'tw-elements/css/tw-elements.min.css'
import TestPage from './pages/TestPage.jsx'
import MainPage from './pages/MainPage.jsx'
import Auctions from './pages/Auctions.jsx'
import AuctionView from './pages/AuctionView.jsx'
import AuctionDetail from './pages/AuctionDetail.jsx'
import CreateAuction from './pages/CreateAuction.jsx'
import Viewer3D from './pages/Viewer3D.jsx'
import UserPanel from './pages/UserPanel.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminUsers from './pages/admin/AdminUsers.jsx'
import AdminAuctions from './pages/admin/AdminAuctions.jsx'
import AdminBids from './pages/admin/AdminBids.jsx'
import { WebGPUCanvasProvider } from './components/WebGPUCanvasProvider.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <WebGPUCanvasProvider>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/main" element={<MainPage />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/auctions" element={<Auctions />} />
            <Route path="/auctionview" element={<AuctionView />} />
            <Route path="/auction/:id" element={<AuctionDetail />} />
            <Route path="/create-auction" element={<CreateAuction />} />
            <Route path="/viewer3d" element={<Viewer3D />} />
            <Route path="/3d" element={<Viewer3D />} />
            <Route path="/userpanel" element={<UserPanel />} />
            <Route path ="/register" element ={<RegisterPage />} />
            <Route path ="/login" element ={<LoginPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/auctions" element={<AdminAuctions />} />
            <Route path="/admin/bids" element={<AdminBids />} />

            <Route path="*" element={<MainPage />} />
          </Routes>
        </WebGPUCanvasProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
