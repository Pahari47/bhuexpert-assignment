import { useEffect, useRef } from 'react'
import { useGoogleMaps } from '../../hooks/useGoogleMaps'
import type { Amenity } from '../../hooks/useNearbyAmenities'

interface Property {
  _id: string
  title: string
  coordinates: { lat: number; lng: number }
}

interface PropertyMapProps {
  properties: Property[]
  selectedId?: string
  onSelect: (id: string) => void
  nearbyAmenities?: Record<string, Amenity[]>
}

const AMENITY_ICONS: Record<string, string> = {
  school: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
  hospital: 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png',
  supermarket: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
}

const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  selectedId,
  onSelect,
  nearbyAmenities,
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const amenityMarkersRef = useRef<google.maps.Marker[]>([])
  const amenityCirclesRef = useRef<google.maps.Circle[]>([])
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const circleRef = useRef<google.maps.Circle | null>(null)
  const isGoogleMapsLoaded = useGoogleMaps()

  // Initialize map only once
  useEffect(() => {
    if (!mapRef.current || !isGoogleMapsLoaded || !properties.length) return

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: properties[0].coordinates,
        zoom: 12,
      })
    }
  }, [isGoogleMapsLoaded, properties])

  // Update property markers
  useEffect(() => {
    if (!mapInstanceRef.current || !properties.length) return

    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    const bounds = new google.maps.LatLngBounds()

    properties.forEach(property => {
      const position = new google.maps.LatLng(property.coordinates.lat, property.coordinates.lng)
      const marker = new google.maps.Marker({
        position,
        map: mapInstanceRef.current!,
        title: property.title,
        animation: google.maps.Animation.DROP,
        icon:
          property._id === selectedId
            ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
      })

      marker.addListener('click', () => onSelect(property._id))
      markersRef.current.push(marker)
      bounds.extend(position)
    })

    if (properties.length > 0) {
      mapInstanceRef.current.fitBounds(bounds)
      if (properties.length === 1) {
        mapInstanceRef.current.setZoom(15)
      }
    }
  }, [properties, selectedId])

  // Render nearby amenities and property radius
  useEffect(() => {
    if (!mapInstanceRef.current) return

    // Clear previous amenities
    amenityMarkersRef.current.forEach(marker => marker.setMap(null))
    amenityMarkersRef.current = []

    amenityCirclesRef.current.forEach(circle => circle.setMap(null))
    amenityCirclesRef.current = []

    infoWindowRef.current?.close()

    if (!infoWindowRef.current) {
      infoWindowRef.current = new google.maps.InfoWindow()
    }

    if (nearbyAmenities) {
      for (const type in nearbyAmenities) {
        nearbyAmenities[type].forEach(amenity => {
          const marker = new google.maps.Marker({
            position: amenity.location,
            map: mapInstanceRef.current!,
            title: amenity.name,
            icon: AMENITY_ICONS[type] || 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
          })

          const circle = new google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.3,
            strokeWeight: 1,
            fillColor: '#FF0000',
            fillOpacity: 0.1,
            map: mapInstanceRef.current!,
            center: amenity.location,
            radius: parseFloat(amenity.distance?.replace(/[^0-9.]/g, '')) * 100 || 500,
          })

          const content = `
            <div>
              <h3>${amenity.name}</h3>
              <p>${amenity.address}</p>
              <p>Distance: ${amenity.distance}</p>
              <p>Duration: ${amenity.duration}</p>
              ${
                amenity.rating
                  ? `<p>Rating: ${amenity.rating} ⭐ (${amenity.userRatingsTotal} reviews)</p>`
                  : ''
              }
            </div>
          `

          marker.addListener('click', () => {
            infoWindowRef.current?.close()
            infoWindowRef.current?.setContent(content)
            infoWindowRef.current?.open(mapInstanceRef.current!, marker)
          })

          amenityMarkersRef.current.push(marker)
          amenityCirclesRef.current.push(circle)
        })
      }
    }

    // Radius around selected property
    circleRef.current?.setMap(null)
    if (selectedId) {
      const selected = properties.find(p => p._id === selectedId)
      if (selected) {
        circleRef.current = new google.maps.Circle({
          strokeColor: '#1d4ed8',
          strokeOpacity: 0.5,
          strokeWeight: 2,
          fillColor: '#93c5fd',
          fillOpacity: 0.2,
          map: mapInstanceRef.current!,
          center: selected.coordinates,
          radius: 3000,
        })
      }
    }
  }, [nearbyAmenities, selectedId])

  return <div ref={mapRef} className="w-full h-[500px] rounded shadow mt-6" />
}

export default PropertyMap
