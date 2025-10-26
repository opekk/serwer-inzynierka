import '../styles/index.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SearchBar from '../components/SearchBar'

export default function Auctions() {
  return ( 
    <div class="text-black">
      <Navbar />
      <div class="max-w-7xl min-h-screen">
        <SearchBar></SearchBar>
      </div>
      <Footer />
    </div>
  )
}