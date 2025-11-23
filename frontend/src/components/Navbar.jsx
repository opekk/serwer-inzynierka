import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)

    const toggleMenu = () => {
        if (!isMenuOpen) {
            setIsMenuOpen(true)
            setTimeout(() => setIsAnimating(true), 10)
        } else {
            setIsAnimating(false)
            setTimeout(() => setIsMenuOpen(false), 300)
        }
    }

    // Zamknij menu przy zmianie rozmiaru okna
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMenuOpen(false)
                setIsAnimating(false)
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <nav className="bg-white font-inter border border-gray-200 rounded shadow-xl transition-all duration-300">
            <div className="max-w-8xl mx-auto px-3 sm:px-5 lg:px-8 lg:ml-20 transition-all duration-300">
                <div className="flex items-center justify-between h-16 w-full">
                    {/* Logo */}
                    <div className="text-slate-900 text-lg sm:text-xl font-bold transition-all duration-300">
                        <Link to="/" className="hover:text-blue-500 transition-colors duration-200">
                            AuctionHub
                        </Link>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden lg:flex flex-1 space-x-2 xl:space-x-4 ml-8 transition-all duration-300">
                        <Link
                            to="/main"
                            className="text-slate-500 px-2 xl:px-4 py-2 hover:underline hover:underline-offset-6 hover:text-blue-400 transition-all duration-200"
                        >
                            Strona Główna
                        </Link>
                        <Link
                            to="/auctions"
                            className="text-slate-500 px-2 xl:px-4 py-2 hover:underline hover:underline-offset-6 hover:text-blue-400 transition-all duration-200"
                        >
                            Aukcje na żywo
                        </Link>
                        <Link
                            to="/viewer3d"
                            className="text-slate-500 px-2 xl:px-4 py-2 hover:underline hover:underline-offset-6 hover:text-blue-400 transition-all duration-200"
                        >
                            Przeglądarka 3D
                        </Link>
                        <a
                            href="#"
                            className="text-slate-500 px-2 xl:px-4 py-2 hover:underline hover:underline-offset-6 hover:text-blue-400 transition-all duration-200"
                        >
                            Kategorie
                        </a>
                        <a
                            href="#"
                            className="text-slate-500 px-2 xl:px-4 py-2 hover:underline hover:underline-offset-6 hover:text-blue-400 transition-all duration-200"
                        >
                            Domy Aukcyjne
                        </a>
                    </div>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden lg:flex items-center space-x-2 xl:space-x-3 transition-all duration-300">
                        <Link to="/login" className="px-3 xl:px-4 py-2 text-slate-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 hover:scale-105">
                            Zaloguj się
                        </Link>
                        <Link to="/register" className="px-4 xl:px-5 py-2 text-white bg-indigo-700 hover:bg-indigo-800 rounded-xl transition-all duration-200 hover:scale-105">
                            Zarejestruj się
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden">
                        <button
                            onClick={toggleMenu}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-all duration-200"
                            aria-expanded={isMenuOpen}
                        >
                            <span className="sr-only">Otwórz menu</span>
                            <div className="relative w-6 h-6">
                                <svg 
                                    className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${!isMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-180'}`} 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                <svg 
                                    className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${isMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'}`} 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu with smooth animation */}
                <div 
                    className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
                        isMenuOpen ? 'block' : 'hidden'
                    }`}
                >
                    <div 
                        className={`transform transition-all duration-300 ease-in-out ${
                            isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
                        }`}
                    >
                        <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
                            <Link
                                to="/main"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 hover:translate-x-1"
                                onClick={() => toggleMenu()}
                            >
                                Strona Główna
                            </Link>
                            <Link
                                to="/auctions"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 hover:translate-x-1"
                                onClick={() => toggleMenu()}
                            >
                                Aukcje na żywo
                            </Link>
                            <Link
                                to="/viewer3d"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 hover:translate-x-1"
                                onClick={() => toggleMenu()}
                            >
                                Przeglądarka 3D
                            </Link>
                            <a
                                href="#"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 hover:translate-x-1"
                                onClick={() => toggleMenu()}
                            >
                                Kategorie
                            </a>
                            <a
                                href="#"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 hover:translate-x-1"
                                onClick={() => toggleMenu()}
                            >
                                Domy Aukcyjne
                            </a>
                        </div>
                        <div className="pt-4 pb-3 border-t border-gray-200">
                            <div className="px-2 space-y-2">
                                <Link to="/login" onClick={() => toggleMenu()} className="block w-full text-center px-4 py-2 text-slate-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 hover:scale-[1.02]">
                                    Zaloguj się
                                </Link>
                                <Link to="/register" onClick={() => toggleMenu()} className="block w-full mt-2 text-center px-5 py-2 text-white bg-indigo-700 hover:bg-indigo-800 rounded-xl transition-all duration-200 hover:scale-[1.02]">
                                    Zarejestruj się
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}