import React, { useState } from 'react';
import LoginModal from './LoginModal';

export default function Navbar() {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    
    return(
        <>
            <nav className="bg-white font-inter border border-gray-200 rounded shadow-xl">
                <div className="max-w-8xl mx-auto px-3 sm:px-5 lg:px-8 ml-20">
                    <div className="flex items-center justify-between h-16 w-full">
                        <div className="text-slate-900 text-xl font-bold mr-8">
                            <a href="/test">AuctionHub</a>
                        </div>
                        <div className="flex flex-1 space-x-4">
                            <a href="/main" className="text-slate-500 px-4 py-2 hover:underline hover:underline-offset-6 hover:text-blue-200">Strona Główna</a>
                            <a href="#" className="text-slate-500 px-4 py-2 hover:underline hover:underline-offset-6 hover:text-blue-200">Aukcje na zywo</a>
                            <a href="#" className="text-slate-500 px-4 py-2 hover:underline hover:underline-offset-6 hover:text-blue-200">Kategorie</a>
                            <a href="#" className="text-slate-500 px-4 py-2 hover:underline hover:underline-offset-6 hover:text-blue-200">Domy Aukcyjne</a>
                            <a href="#" className="text-slate-500 px-4 py-2 hover:underline hover:underline-offset-6 hover:text-blue-200">Jak to działa?</a>
                        </div>
                        <div>
                            <button 
                                className="px-4 py-2 text-slate-900 bg-gray-100 hover:bg-blue-400 rounded-xl mr-3"   
                                onClick={() => setIsLoginModalOpen(true)}
                            >
                                Zaloguj się
                            </button>
                            <button className="px-5 py-2 text-white bg-indigo-700 hover:bg-blue-400 rounded-xl">
                                Zarejestruj się
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Login Modal */}
            {isLoginModalOpen && (
                <LoginModal onClose={() => setIsLoginModalOpen(false)} />
            )}
        </>
    );
}; 

