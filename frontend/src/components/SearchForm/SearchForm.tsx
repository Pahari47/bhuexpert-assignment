import { useState } from 'react'
import type { SearchFilters } from '../../types/property'

interface SearchFormProps {
  onSearch: (filters: SearchFilters) => void
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    city: '',
    minPrice: undefined,
    maxPrice: undefined,
    propertyType: '',
    minBedrooms: undefined,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: name === 'minPrice' || name === 'maxPrice' || name === 'minBedrooms'
        ? Number(value)
        : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(filters)
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input name="city" onChange={handleChange} value={filters.city}
          placeholder="City" className="border p-2 rounded" />

        <input name="minPrice" type="number" onChange={handleChange}
          placeholder="Min Price" className="border p-2 rounded" />

        <input name="maxPrice" type="number" onChange={handleChange}
          placeholder="Max Price" className="border p-2 rounded" />

        <select name="propertyType" onChange={handleChange}
          className="border p-2 rounded">
          <option value="">All Types</option>
          <option value="apartment">Apartment</option>
          <option value="flat">Flat</option>
          <option value="villa">Villa</option>
        </select>

        <input name="minBedrooms" type="number" onChange={handleChange}
          placeholder="Min Bedrooms" className="border p-2 rounded" />

        <select name="sortBy" onChange={handleChange} className="border p-2 rounded">
          <option value="listedDate">Newest</option>
          <option value="price">Price</option>
        </select>
      </div>

      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
        Search
      </button>
    </form>
  )
}

export default SearchForm
