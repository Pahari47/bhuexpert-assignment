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

const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  selectedId,
  onSelect,
  nearbyAmenities,
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const circleRef = useRef<google.maps.Circle | null>(null)
  const isGoogleMapsLoaded = useGoogleMaps()

  useEffect(() => {
    if (!mapRef.current || !isGoogleMapsLoaded || properties.length === 0) return

    // Init map
    mapInstanceRef.current = new google.maps.Map(mapRef.current, {
      center: properties[0].coordinates,
      zoom: 12,
    })

    return () => {
      markersRef.current.forEach(marker => marker.setMap(null))
      markersRef.current = []
      circleRef.current?.setMap(null)
    }
  }, [isGoogleMapsLoaded])

  useEffect(() => {
    if (!mapInstanceRef.current) return

    // Clear previous markers
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    // Property markers
    properties.forEach((property) => {
      const marker = new google.maps.Marker({
        position: property.coordinates,
        map: mapInstanceRef.current!,
        title: property.title,
        icon: property._id === selectedId
          ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
          : undefined,
      })
      marker.addListener('click', () => onSelect(property._id))
      markersRef.current.push(marker)
    })

    // Amenities
    if (nearbyAmenities) {
      for (const type in nearbyAmenities) {
        nearbyAmenities[type].forEach((amenity) => {
          const marker = new google.maps.Marker({
            position: amenity.location,
            map: mapInstanceRef.current!,
            title: amenity.name,
            icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
          })
          markersRef.current.push(marker)
        })
      }
    }

    // Radius circle around selected property
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
  }, [properties, selectedId, nearbyAmenities])

  return (
    <div ref={mapRef} className="w-full h-[500px] rounded shadow mt-6" />
  )
}

export default PropertyMap
