import { useEffect, useState } from 'react'

export interface Amenity {
  name: string
  type: string
  address: string
  distance: string
  duration: string
  placeId: string
  rating?: number
  userRatingsTotal?: number
  location: { lat: number; lng: number }
}

interface NearbyResponse {
  property: {
    id: string
    title: string
    coordinates: { lat: number; lng: number }
  }
  amenities: Record<string, Amenity[]>
  searchRadius: number
  timestamp: string
}

export const useNearbyAmenities = (
  propertyId: string | undefined,
  types: string[] = []
) => {
  const [amenities, setAmenities] = useState<Record<string, Amenity[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!propertyId || types.length === 0) return

    const fetchAmenities = async () => {
      try {
        setLoading(true)
        const url = `http://localhost:3000/api/properties/${propertyId}/nearby-amenities?types=${types.join(',')}&radius=3000&limit=5`
        const res = await fetch(url)
        if (!res.ok) throw new Error('Failed to fetch amenities')

        const data: NearbyResponse = await res.json()
        const parsed: Record<string, Amenity[]> = {}

        for (const type of Object.keys(data.amenities)) {
          parsed[type] = data.amenities[type].map((item: any) => ({
            name: item.name,
            type,
            address: item.vicinity || item.address,
            distance: '', // to be added from Distance Matrix later
            duration: '',
            placeId: item.place_id,
            rating: item.rating,
            userRatingsTotal: item.user_ratings_total,
            location: item.geometry?.location || item.coordinates || { lat: 0, lng: 0 },
          }))
        }

        setAmenities(parsed)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setLoading(false)
      }
    }

    fetchAmenities()
  }, [propertyId, types])

  return { amenities, loading, error }
}
