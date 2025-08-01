import mongoose, { Schema, Document } from 'mongoose'

interface Location {
  city: string
  state: string
  pincode: string
}

interface Coordinates {
  lat: number
  lng: number
}

export interface PropertyDocument extends Document {
  title: string
  description: string
  price: number
  location: Location
  coordinates: Coordinates  
  propertyType: string
  bedrooms: number
  bathrooms: number
  area: number
  amenities: string[]
  images: string[]
  listedDate: Date
  status: string
}

const LocationSchema = new Schema<Location>({
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
})

const PropertySchema = new Schema<PropertyDocument>(
  {
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    location: { type: LocationSchema, required: true },
    coordinates: {     
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    propertyType: { type: String, required: true },
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number },
    area: { type: Number },
    amenities: [{ type: String }],
    images: [{ type: String }],
    listedDate: { type: Date, default: Date.now },
    status: { type: String, default: 'available' },
  },
  { timestamps: true }
)

export const Property = mongoose.model<PropertyDocument>('Property', PropertySchema)
