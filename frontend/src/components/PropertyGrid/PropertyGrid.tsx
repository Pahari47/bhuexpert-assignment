import PropertyCard from '../PropertyCard/PropertyCard'

interface PropertyGridProps {
  properties: any[]
  onShowAmenities: (id: string) => void
}

const PropertyGrid: React.FC<PropertyGridProps> = ({ properties, onShowAmenities }) => {
  if (!properties.length) {
    return <p className="text-center text-gray-500 mt-4">No properties found.</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
      {properties.map((prop) => (
        <PropertyCard
          key={prop._id}
          property={prop}
          onShowAmenities={onShowAmenities}
        />
      ))}
    </div>
  )
}

export default PropertyGrid
