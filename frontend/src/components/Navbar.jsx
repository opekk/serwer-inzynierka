import { Link } from 'react-router-dom'

export default function Navbar() {
    return (
        <nav className="bg-white font-inter border border-gray-200 rounded shadow-xl">
            <div className="max-w-8xl mx-auto px-3 sm:px-5 lg:px-8 ml-20">
                <div className="flex items-center justify-between h-16 w-full">
                    <div className="text-slate-900 text-xl font-bold mr-8">
                        <Link to="/">AuctionHub</Link>
                    </div>
                    <div className="flex flex-1 space-x-4">
                        <Link
                            to="/main"
                            className="text-slate-500 px-4 py-2 hover:underline hover:underline-offset-6 hover:text-blue-200"
                        >
                            Strona Główna
                        </Link>
                        <Link
                            to="/auctions"
                            className="text-slate-500 px-4 py-2 hover:underline hover:underline-offset-6 hover:text-blue-200"
                        >
                            Aukcje na zywo
                        </Link>
                        <Link
                            to="/viewer3d"
                            className="text-slate-500 px-4 py-2 hover:underline hover:underline-offset-6 hover:text-blue-200"
                        >
                            Przeglądarka 3D
                        </Link>
                        <a
                            href="#"
                            className="text-slate-500 px-4 py-2 hover:underline hover:underline-offset-6 hover:text-blue-200"
                        >
                            Kategorie
                        </a>
                        <a
                            href="#"
                            className="text-slate-500 px-4 py-2 hover:underline hover:underline-offset-6 hover:text-blue-200"
                        >
                            Domy Aukcyjne
                        </a>
                    </div>
                    <div>
                        <button className="px-4 py-2 text-slate-900 bg-gray-100 hover:bg-blue-400 rounded-xl mr-3">
                            Zaloguj się
                        </button>
                        <button className="px-5 py-2 text-white bg-indigo-700 hover:bg-blue-400 rounded-xl">
                            Zarejestruj się
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}

