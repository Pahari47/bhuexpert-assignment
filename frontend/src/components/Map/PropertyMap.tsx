import { useEffect, useRef } from 'react'
import { useGoogleMaps } from '../../hooks/useGoogleMaps'

interface Property {
  _id: string
  title: string
  coordinates: { lat: number; lng: number }
}

interface PropertyMapProps {
  properties: Property[]
  selectedId?: string
  onSelect: (id: string) => void
}

const PropertyMap: React.FC<PropertyMapProps> = ({ properties, selectedId, onSelect }) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const isGoogleMapsLoaded = useGoogleMaps()

  useEffect(() => {
    if (!mapRef.current || !isGoogleMapsLoaded) return

    mapInstanceRef.current = new google.maps.Map(mapRef.current, {
      center: { lat: properties[0]?.coordinates.lat || 28.6, lng: properties[0]?.coordinates.lng || 77.2 },
      zoom: 12,
    })

    markersRef.current = properties.map((property) => {
      const marker = new google.maps.Marker({
        position: property.coordinates,
        map: mapInstanceRef.current!,
        title: property.title,
        icon: property._id === selectedId
          ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
          : undefined,
      })

      marker.addListener('click', () => onSelect(property._id))
      return marker
    })

    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null))
    }
  }, [properties, selectedId])

  return (
    <div ref={mapRef} className="w-full h-[500px] rounded shadow mt-6" />
  )
}

export default PropertyMap
