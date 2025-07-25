export default function Footer(){
    return(
<footer class="bg-indigo-700 text-white py-8 shadow-xl rounded font-inter">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="space-y-3">
                    <div class="flex items-center">
                        <i class="fas fa-gavel text-blue-400 text-xl mr-2"></i>
                        <span class="text-lg font-bold">AuctionHub</span>
                    </div>
                    <p class="text-slate-300">
                        Pierwsza platforma aukcyjna z wizualizacją 3D w Polsce. 
                        Łączymy tradycję z nowoczesną technologią.
                    </p>
                    <div class="flex space-x-4">
                        <a href="#" class="text-slate-300 hover:text-blue-400 transition">
                            <i class="fab fa-facebook-f text-xl"></i>
                        </a>
                        <a href="#" class="text-slate-300 hover:text-blue-400 transition">
                            <i class="fab fa-twitter text-xl"></i>
                        </a>
                        <a href="#" class="text-slate-300 hover:text-blue-400 transition">
                            <i class="fab fa-instagram text-xl"></i>
                        </a>
                        <a href="#" class="text-slate-300 hover:text-blue-400 transition">
                            <i class="fab fa-linkedin-in text-xl"></i>
                        </a>
                    </div>
                </div>
                
                <div>
                    <h3 class="text-base font-semibold mb-2">Aukcje</h3>
                    <ul class="space-y-1">
                        <li><a href="#" class="text-slate-300 hover:text-stone-100 transition">Aktualne aukcje</a></li>
                        <li><a href="#" class="text-slate-300 hover:text-white transition">Archiwum</a></li>
                        <li><a href="#" class="text-slate-300 hover:text-white transition">Kategorie</a></li>
                    </ul>
                </div>
                
                <div>
                    <h3 class="text-base font-semibold mb-2">Dla domów aukcyjnych</h3>
                    <ul class="space-y-1">
                        <li><a href="#" class="text-slate-300 hover:text-white transition">Dołącz do nas</a></li>
                        <li><a href="#" class="text-slate-300 hover:text-white transition">Panel zarządzania</a></li>
                        <li><a href="#" class="text-slate-300 hover:text-white transition">Wsparcie techniczne</a></li>
                    </ul>
                </div>
                
                <div>
                    <h3 class="text-base font-semibold mb-2">Pomoc i kontakt</h3>
                    <ul class="space-y-1">
                        <li><a href="#" class="text-slate-300 hover:text-white transition">FAQ</a></li>
                        <li><a href="#" class="text-slate-300 hover:text-white transition">Kontakt</a></li>
                        <li><a href="#" class="text-slate-300 hover:text-white transition">Polityka prywatności</a></li>
                    </ul>
                </div>
            </div>
            
            <div class="mt-6 pt-4 flex flex-col md:flex-row justify-between items-center">
                <p class="text-slate-300 text-sm">
                    © 2025 AuctionHub. Wszystkie prawa zastrzeżone.
                </p>
                <div class="flex space-x-4 mt-2 md:mt-0">
                    <a href="#" class="text-slate-300 hover:text-white text-sm transition">Regulamin</a>
                    <a href="#" class="text-slate-300 hover:text-white text-sm transition">Prywatność</a>
                    <a href="#" class="text-slate-300 hover:text-white text-sm transition">Cookies</a>
                </div>
            </div>
        </div>
    </footer>
    )
}

