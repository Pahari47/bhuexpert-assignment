import type { Amenity } from '../../hooks/useNearbyAmenities'

interface AmenityListProps {
  amenities: Record<string, Amenity[]>
}

const AmenityList: React.FC<AmenityListProps> = ({ amenities }) => {
  const hasAmenities = Object.keys(amenities).length > 0
  console.log('AmenityList received amenities:', amenities)

  if (!hasAmenities) {
    console.log('No amenities to display')
    return <div className="mt-8 text-gray-500">No nearby amenities found</div>
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Nearby Amenities</h2>
      {Object.entries(amenities).map(([type, places]) => (
        <div key={type} className="mb-6">
          <h3 className="text-lg font-medium text-blue-700 capitalize mb-2">
            {type}
          </h3>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {places.map((place) => (
              <li key={place.placeId} className="border rounded p-3 shadow bg-white">
                <h4 className="font-semibold text-gray-900">{place.name}</h4>
                <p className="text-sm text-gray-700">{place.address}</p>
                {place.distance && place.duration && (
                  <p className="text-sm text-gray-600">
                    📍 {place.distance} – {place.duration}
                  </p>
                )}
                {place.rating && (
                  <p className="text-sm text-yellow-600">
                    ⭐ {place.rating} ({place.userRatingsTotal} reviews)
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default AmenityList
