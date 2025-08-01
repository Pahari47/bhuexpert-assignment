import { useEffect, useState, useRef, useCallback } from 'react'

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

// Debounce utility function
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | undefined

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => func(...args), wait)
  }
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
        // Cancel any previous requests
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }
        abortControllerRef.current = new AbortController()

        setLoading(true)
        setError(null)
        
        const url = `http://localhost:3000/api/properties/${propertyId}/nearby-amenities?types=${types.join(',')}&radius=3000&limit=5`
        console.log('Fetching amenities from:', url)
        const res = await fetch(url, { signal: abortControllerRef.current.signal })
        if (!res.ok) throw new Error('Failed to fetch amenities')

        const data: NearbyResponse = await res.json()
        console.log('Received amenities data:', data)
        const originCoords = data.property.coordinates
        const origin = new google.maps.LatLng(originCoords.lat, originCoords.lng)
        const parsed: Record<string, Amenity[]> = {}

        const allDestinations: { type: string; amenity: Amenity }[] = []

        for (const type of Object.keys(data.amenities)) {
          console.log(`Processing amenities of type: ${type}`, data.amenities[type])
          parsed[type] = data.amenities[type].map((item: any) => {
            const location = item.geometry?.location || item.coordinates || { lat: 0, lng: 0 }

            const amenity: Amenity = {
              name: item.name,
              type,
              address: item.vicinity || item.address || 'Unknown address',
              distance: '',
              duration: '',
              placeId: item.place_id || '',  // Ensure placeId is never undefined
              rating: item.rating,
              userRatingsTotal: item.user_ratings_total,
              location,
            }

            allDestinations.push({ type, amenity })
            return amenity
          })
        }
        
        console.log('Processed amenities:', parsed)

        // Calculate distances in batches of 25 (Google Maps API limit)
        const batchSize = 25
        const service = new google.maps.DistanceMatrixService()

        // Process destinations in batches
        for (let i = 0; i < allDestinations.length; i += batchSize) {
          const batchDestinations = allDestinations.slice(i, i + batchSize)
          const destinations = batchDestinations.map(({ amenity }) =>
            new google.maps.LatLng(amenity.location.lat, amenity.location.lng)
          )

          try {
            const result = await new Promise<google.maps.DistanceMatrixResponse>((resolve, reject) => {
              service.getDistanceMatrix(
                {
                  origins: [origin],
                  destinations,
                  travelMode: google.maps.TravelMode.DRIVING,
                  unitSystem: google.maps.UnitSystem.METRIC,
                },
                (response, status) => {
                  if (status === 'OK' && response) {
                    resolve(response)
                  } else {
                    reject(new Error(`Distance Matrix error: ${status}`))
                  }
                }
              )
            })

            if (result.rows?.[0]?.elements) {
              result.rows[0].elements.forEach((element, index) => {
                const { amenity } = batchDestinations[index]
                if (element.status === 'OK') {
                  amenity.distance = element.distance?.text || ''
                  amenity.duration = element.duration?.text || ''
                }
              })
            }
          } catch (error) {
            console.error('Error calculating distances:', error)
          }
        }

        // Get additional place details for ratings
        const placesService = new google.maps.places.PlacesService(document.createElement('div'));
        
        for (const { amenity } of allDestinations) {
          try {
            await new Promise((resolve, reject) => {
              placesService.getDetails(
                {
                  placeId: amenity.placeId,
                  fields: ['rating', 'user_ratings_total']
                },
                (result, status) => {
                  if (status === 'OK' && result) {
                    amenity.rating = result.rating;
                    amenity.userRatingsTotal = result.user_ratings_total;
                    resolve(result);
                  } else {
                    reject(new Error(`Place Details error: ${status}`));
                  }
                }
              );
            });
          } catch (error) {
            console.error('Error fetching place details:', error);
          }
        }

        setAmenities(parsed)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setLoading(false)
      }
    }

    // Debounced fetch
    const debouncedFetch = setTimeout(() => {
      fetchAmenities()
    }, 300) // 300ms delay

    // Cleanup function
    return () => {
      clearTimeout(debouncedFetch)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [propertyId, types])

  return { amenities, loading, error }
}
