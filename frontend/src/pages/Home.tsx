import { useState } from 'react'
import SearchForm from '../components/SearchForm/SearchForm'
import type { SearchFilters } from '../types/property'

const Home = () => {
  const [filters, setFilters] = useState<SearchFilters>({})
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (filters: SearchFilters) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value))
        }
      })

      const res = await fetch(`http://localhost:3000/api/properties/search?${params}`)
      const data = await res.json()
      setResults(data.results)
      setLoading(false)
    } catch (error) {
      console.error('Search failed:', error)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <SearchForm onSearch={handleSearch} />
      {loading && <p className="mt-4 text-gray-500">Loading...</p>}
      {!loading && results.length > 0 && (
        <div className="mt-4">🏡 {results.length} properties found</div>
      )}
    </div>
  )
}

export default Home
