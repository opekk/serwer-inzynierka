import { useState } from "react";
export default function SearchBar(){
const [query, setQuery] = useState("")

const handleChange = (e) => {
    setQuery(e.target.value)
}

const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Search query: ", query)
}

return(
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2">
        <input
            type = "text"
            value={query}
            onChange={handleChange}
            placeholder="Znajdź szukany produkt..."
            className="w-full px-4 py-2 border border-gray-300 rounded-2xl
            focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
            type="submit"
            className="px-4 py-2 bg-indigo-700 text-white rounded-2xl hover:bg-blue-400 transision"
        >Szukaj</button> 
    </form>
)  
}