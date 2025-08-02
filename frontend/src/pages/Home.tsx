import { useState, useEffect } from 'react'
import SearchForm from '../components/SearchForm/SearchForm'
import PropertyGrid from '../components/PropertyGrid/PropertyGrid'
import PropertyMap from '../components/Map/PropertyMap'
import AmenityList from '../components/AmenityList/AmenityList'
import { useGoogleMaps } from '../hooks/useGoogleMaps'
import { useNearbyAmenities } from '../hooks/useNearbyAmenities'
import type { SearchFilters } from '../types/property'

interface Property {
  _id: string
  title: string
  price: number
  location: { city: string; state: string }
  propertyType: string
  bedrooms: number
  bathrooms: number
  area: number
  images: string[]
  listedDate: string
  coordinates: { lat: number; lng: number }
}

const Home = () => {
  const [filters, setFilters] = useState<SearchFilters>({})
  const [results, setResults] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | undefined>()

  const mapsLoaded = useGoogleMaps()
  const amenityTypes = ['school', 'hospital', 'supermarket']
  const { amenities, loading: amenitiesLoading, error: amenitiesError } = useNearbyAmenities(selectedId, amenityTypes)

  // Load all properties on mount
  useEffect(() => {
    const loadAllProperties = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch('http://localhost:3000/api/properties/search')
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }

        const data = await res.json()
        if (!data.results) {
          throw new Error('No results field in response')
        }

        setResults(data.results)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
        console.error('Initial load failed:', errorMessage)
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    loadAllProperties()
  }, [])

  const handleSearch = async (filters: SearchFilters) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value))
        }
      })

      console.log('Search params:', Object.fromEntries(params.entries()))

      const res = await fetch(`http://localhost:3000/api/properties/search?${params}`)
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()
      if (!data.results) {
        throw new Error('No results field in response')
      }

      data.results.forEach((property: Property) => {
        if (
          !property.coordinates ||
          typeof property.coordinates.lat !== 'number' ||
          typeof property.coordinates.lng !== 'number'
        ) {
          console.error('Invalid coordinates for property:', property)
        }
      })

      setResults(data.results)
      setSelectedId(undefined) // Reset selected property
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      console.error('Search failed:', errorMessage)
      setError(errorMessage)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <SearchForm onSearch={handleSearch} />

      {loading && <p className="mt-4 text-gray-500">Loading...</p>}
      {error && <p className="mt-4 text-red-500">Error: {error}</p>}

      {!loading && !error && results.length > 0 && (
        <>
          <div className="mt-4 mb-2 text-gray-700 font-medium">
            🏡 {results.length} properties found
          </div>

          <PropertyGrid
            properties={results}
            onShowAmenities={(id) => {
              if (selectedId !== id) {
                setSelectedId(id)
              }
            }}
          />

          {mapsLoaded && (
            <>
              <PropertyMap
                properties={results}
                selectedId={selectedId}
                onSelect={(id) => {
                  if (selectedId !== id) {
                    setSelectedId(id)
                  }
                }}
                nearbyAmenities={amenities}
              />
              <AmenityList amenities={amenities} />
            </>
          )}
        </>
      )}

      {!loading && !error && results.length === 0 && (
        <p className="mt-4 text-gray-500">
          No properties found. Try adjusting your search criteria.
        </p>
      )}
    </div>
  )
}

export default Home
