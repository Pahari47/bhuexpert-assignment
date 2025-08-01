import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { Property } from '../src/models/property.model'

dotenv.config()

const MONGO_URI = process.env.MONGO_URI as string

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('✅ Connected to MongoDB')

    await Property.deleteMany({}) // Clear existing data

    const properties = [
      {
        title: 'Luxury Apartment in Delhi',
        description: 'Beautiful 3BHK apartment in South Delhi',
        price: 7500000,
        location: { city: 'Delhi', state: 'Delhi', pincode: '110001' },
        propertyType: 'apartment',
        bedrooms: 3,
        bathrooms: 2,
        area: 1500,
        amenities: ['Gym', 'Pool'],
        images: ['https://example.com/img1.jpg'],
        listedDate: new Date(),
        status: 'available',
        coordinates: { lat: 28.6139, lng: 77.209 },
      },
      {
        title: 'Affordable Flat in Delhi',
        description: '2BHK flat near metro station',
        price: 4800000,
        location: { city: 'Delhi', state: 'Delhi', pincode: '110092' },
        propertyType: 'flat',
        bedrooms: 2,
        bathrooms: 1,
        area: 950,
        amenities: ['Parking', 'Elevator'],
        images: ['https://example.com/img2.jpg'],
        listedDate: new Date(),
        status: 'available',
        coordinates: { lat: 28.6205, lng: 77.2966 },
      },
    ]

    await Property.insertMany(properties)
    console.log('✅ Sample properties inserted')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }
}

run()
