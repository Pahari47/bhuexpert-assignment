import React from 'react'

interface PropertyCardProps {
  property: {
    _id: string
    title: string
    price: number
    location: { city: string; state: string }
    bedrooms: number
    bathrooms: number
    area: number
    images: string[]
    listedDate: string
    propertyType: string
  }
  onShowAmenities: (id: string) => void
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onShowAmenities }) => {
  return (
    <div className="bg-white rounded shadow p-4 flex flex-col justify-between">
      <img
        src={property.images?.[0] || 'https://via.placeholder.com/400x250'}
        alt={property.title}
        className="w-full h-48 object-cover rounded"
      />

      <div className="mt-4">
        <h2 className="text-xl font-semibold">{property.title}</h2>
        <p className="text-gray-600">
          ₹{property.price.toLocaleString()} • {property.bedrooms}BHK • {property.area} sqft
        </p>
        <p className="text-gray-500">
          {property.location.city}, {property.location.state}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Type: {property.propertyType} • Listed on {new Date(property.listedDate).toLocaleDateString()}
        </p>
      </div>

      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => onShowAmenities(property._id)}
      >
        View Nearby Amenities
      </button>
    </div>
  )
}

export default PropertyCard
