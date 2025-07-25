export default function Navbar() {
    return(
         <nav class="bg-white font-inter border border-gray-200 rounded shadow-xl">
            <div class="max-w-8xl mx-auto px-3 sm:px-5 lg:px-8 ml-20">
                <div class="flex items-center justify-between h-16 w-full">
                    <div class="text-slate-900 text-xl font-bold mr-8">
                        <a href="">AuctionHub</a></div>
                    <div class="flex flex-1 space-x-4">
                        <a href="#" class="text-slate-500 px-4 py-2 hover:underline hover:underline-offset-6 hover:text-blue-200">Strona Główna</a>
                        <a href="#" class="text-slate-500 px-4 py-2 hover:underline hover:underline-offset-6 hover:text-blue-200">Aukcje na zywo</a>
                        <a href="#" class="text-slate-500 px-4 py-2 hover:underline hover:underline-offset-6 hover:text-blue-200">Kategorie</a>
                        <a href="#" class="text-slate-500 px-4 py-2 hover:underline hover:underline-offset-6 hover:text-blue-200">Domy Aukcyjne</a>
                        <a href="#" class="text-slate-500 px-4 py-2 hover:underline hover:underline-offset-6 hover:text-blue-200">Jak to działa?</a>
                    </div>
                    <div>
                        <button class="px-4 py-2 text-slate-900 bg-gray-100 hover:bg-blue-400 rounded-xl mr-3">Zaloguj się</button>
                        <button class="px-5 py-2 text-white bg-indigo-700 hover:bg-blue-400 rounded-xl">Zarejestruj się</button>
                    </div>
                </div>
            </div>
        </nav>
    )
};

