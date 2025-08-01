import { useEffect, useRef, useCallback } from 'react'
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
      amenityMarkersRef.current.forEach(marker => marker.setMap(null))
      amenityMarkersRef.current = []
      amenityCirclesRef.current.forEach(circle => circle.setMap(null))
      amenityCirclesRef.current = []
      infoWindowRef.current?.close()
      circleRef.current?.setMap(null)
    }
  }, [isGoogleMapsLoaded, properties])

  useEffect(() => {
    if (!mapInstanceRef.current) return

    // Clear previous markers and circle
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []
    circleRef.current?.setMap(null)

    // Clear map bounds
    const bounds = new google.maps.LatLngBounds()

    // Property markers
    properties.forEach((property) => {
      console.log('Creating marker for property:', {
        id: property._id,
        title: property.title,
        coordinates: property.coordinates
      });

      // Validate coordinates
      if (!property.coordinates || typeof property.coordinates.lat !== 'number' || typeof property.coordinates.lng !== 'number') {
        console.error('Invalid coordinates for property:', property);
        return;
      }

      const position = new google.maps.LatLng(
        property.coordinates.lat,
        property.coordinates.lng
      );

      const marker = new google.maps.Marker({
        position,
        map: mapInstanceRef.current!,
        title: property.title,
        animation: google.maps.Animation.DROP,
        icon: property._id === selectedId
          ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
          : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
      });

      // Add click listener
      marker.addListener('click', () => {
        console.log('Marker clicked for property:', property._id);
        onSelect(property._id);
      });

      // Store the marker reference
      markersRef.current.push(marker);

      // Extend bounds to include this location
      bounds.extend(position);
    })

    // Fit map to show all markers if there are any
    if (properties.length > 0) {
      mapInstanceRef.current!.fitBounds(bounds);
      // If only one marker, zoom out a bit
      if (properties.length === 1) {
        mapInstanceRef.current!.setZoom(15);
      }
    }

    // Amenities
    if (nearbyAmenities) {
      // Clear previous amenity markers and circles
      amenityMarkersRef.current.forEach(marker => marker.setMap(null))
      amenityMarkersRef.current = []
      amenityCirclesRef.current.forEach(circle => circle.setMap(null))
      amenityCirclesRef.current = []
      infoWindowRef.current?.close()

      // Create info window if not exists
      if (!infoWindowRef.current) {
        infoWindowRef.current = new google.maps.InfoWindow();
      }

      for (const type in nearbyAmenities) {
        nearbyAmenities[type].forEach((amenity) => {
          // Create marker
          const marker = new google.maps.Marker({
            position: amenity.location,
            map: mapInstanceRef.current!,
            title: amenity.name,
            icon: AMENITY_ICONS[type] || 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
          });

          // Create circle around amenity
          const circle = new google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.3,
            strokeWeight: 1,
            fillColor: '#FF0000',
            fillOpacity: 0.1,
            map: mapInstanceRef.current!,
            center: amenity.location,
            radius: parseFloat(amenity.distance?.replace(/[^0-9.]/g, '')) * 100 || 500, // Convert distance text to meters
          });

          // Create info window content
          const content = `
            <div class="p-2">
              <h3 class="font-bold">${amenity.name}</h3>
              <p class="text-sm">${amenity.address}</p>
              <p class="text-sm mt-1">Distance: ${amenity.distance}</p>
              <p class="text-sm">Duration: ${amenity.duration}</p>
              ${amenity.rating ? `
                <p class="text-sm mt-1">
                  Rating: ${amenity.rating} ⭐ (${amenity.userRatingsTotal} reviews)
                </p>
              ` : ''}
            </div>
          `;

          // Add click listener to marker
          marker.addListener('click', () => {
            infoWindowRef.current?.close();
            infoWindowRef.current?.setContent(content);
            infoWindowRef.current?.open(mapInstanceRef.current!, marker);
          });

          amenityMarkersRef.current.push(marker);
          amenityCirclesRef.current.push(circle);
        });
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
