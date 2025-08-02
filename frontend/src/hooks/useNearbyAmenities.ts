import { useEffect, useState, useRef } from 'react'

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
  amenities: Record<string, any[]>
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
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!propertyId || types.length === 0) return

    const fetchAmenities = async () => {
      try {
        // Abort any previous request
        if (
          abortControllerRef.current &&
          !abortControllerRef.current.signal.aborted
        ) {
          abortControllerRef.current.abort()
        }
        abortControllerRef.current = new AbortController()

        setLoading(true)
        setError(null)

        const url = `http://localhost:3000/api/properties/${propertyId}/nearby-amenities?types=${types.join(',')}&radius=3000&limit=5`
        console.log('Fetching amenities:', url)
        const res = await fetch(url, { signal: abortControllerRef.current.signal })

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(errorData.message || `Failed to fetch amenities: ${res.status}`)
        }

        const data: NearbyResponse = await res.json()

        const originCoords = data.property.coordinates
        const origin = new google.maps.LatLng(originCoords.lat, originCoords.lng)

        const parsed: Record<string, Amenity[]> = {}
        const allDestinations: { type: string; amenity: Amenity }[] = []

        for (const type of Object.keys(data.amenities)) {
          if (!Array.isArray(data.amenities[type])) continue

          parsed[type] = data.amenities[type]
            .map((item: any) => {
              const location = item.geometry?.location || item.coordinates
              const lat =
                typeof location?.lat === 'function' ? location.lat() : location?.lat
              const lng =
                typeof location?.lng === 'function' ? location.lng() : location?.lng

              if (typeof lat !== 'number' || typeof lng !== 'number') return null

              const amenity: Amenity = {
                name: item.name,
                type,
                address: item.vicinity || item.formatted_address || 'Unknown address',
                distance: '',
                duration: '',
                placeId: item.place_id || '',
                rating: item.rating,
                userRatingsTotal: item.user_ratings_total,
                location: { lat, lng }
              }

              allDestinations.push({ type, amenity })
              return amenity
            })
            .filter((a): a is Amenity => !!a)
        }

        const service = new google.maps.DistanceMatrixService()
        const batchSize = 25

        for (let i = 0; i < allDestinations.length; i += batchSize) {
          const batch = allDestinations.slice(i, i + batchSize)
          const destinations = batch.map(({ amenity }) =>
            new google.maps.LatLng(amenity.location.lat, amenity.location.lng)
          )

          try {
            const result = await new Promise<google.maps.DistanceMatrixResponse>(
              (resolve, reject) => {
                service.getDistanceMatrix(
                  {
                    origins: [origin],
                    destinations,
                    travelMode: google.maps.TravelMode.DRIVING,
                    unitSystem: google.maps.UnitSystem.METRIC
                  },
                  (response, status) => {
                    if (status === 'OK' && response) {
                      resolve(response)
                    } else {
                      reject(new Error(`Distance Matrix error: ${status}`))
                    }
                  }
                )
              }
            )

            if (result.rows?.[0]?.elements) {
              result.rows[0].elements.forEach((element, index) => {
                const { amenity } = batch[index]
                if (element.status === 'OK') {
                  amenity.distance = element.distance?.text || ''
                  amenity.duration = element.duration?.text || ''
                }
              })
            }
          } catch (err) {
            console.error('DistanceMatrix API error:', err)
          }
        }

        setAmenities(parsed)
        setLoading(false)
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return
        console.error('Amenity fetch error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setLoading(false)
        setAmenities({})
      }
    }

    const timeout = setTimeout(fetchAmenities, 300)

    return () => {
      clearTimeout(timeout)
      if (
        abortControllerRef.current &&
        !abortControllerRef.current.signal.aborted
      ) {
        abortControllerRef.current.abort()
      }
    }
  }, [propertyId, types])

  return { amenities, loading, error }
}
