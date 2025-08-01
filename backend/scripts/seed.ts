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
        title: 'Premium Apartment near AIIMS',
        description: 'Luxurious 3BHK near AIIMS and Green Park Metro',
        price: 8500000,
        location: { city: 'Delhi', state: 'Delhi', pincode: '110029' },
        propertyType: 'apartment',
        bedrooms: 3,
        bathrooms: 2,
        area: 1800,
        amenities: ['Gym', 'Pool', '24x7 Security'],
        images: ['https://example.com/img1.jpg'],
        listedDate: new Date(),
        status: 'available',
        coordinates: { lat: 28.5672, lng: 77.2100 }, // Near AIIMS Delhi
      },
      {
        title: 'Modern Flat in Indiranagar',
        description: 'Stylish 3BHK in prime Bangalore location',
        price: 9000000,
        location: { city: 'Bangalore', state: 'Karnataka', pincode: '560038' },
        propertyType: 'apartment',
        bedrooms: 3,
        bathrooms: 2,
        area: 1600,
        amenities: ['Gym', 'Garden', 'Clubhouse'],
        images: ['https://example.com/img2.jpg'],
        listedDate: new Date(),
        status: 'available',
        coordinates: { lat: 12.9716, lng: 77.6441 }, // Indiranagar Bangalore
      },
      {
        title: 'Family Home in Powai',
        description: 'Spacious 4BHK with lake view',
        price: 15000000,
        location: { city: 'Mumbai', state: 'Maharashtra', pincode: '400076' },
        propertyType: 'apartment',
        bedrooms: 4,
        bathrooms: 3,
        area: 2200,
        amenities: ['Swimming Pool', 'Kids Play Area', 'Tennis Court'],
        images: ['https://example.com/img3.jpg'],
        listedDate: new Date(),
        status: 'available',
        coordinates: { lat: 19.1136, lng: 72.9053 }, // Powai Mumbai
      },
      {
        title: 'Luxury Villa in Jubilee Hills',
        description: 'Premium 4BHK villa with modern amenities',
        price: 12500000,
        location: { city: 'Hyderabad', state: 'Telangana', pincode: '500033' },
        propertyType: 'villa',
        bedrooms: 4,
        bathrooms: 4,
        area: 3000,
        amenities: ['Private Garden', 'Swimming Pool', 'Home Theater'],
        images: ['https://example.com/img4.jpg'],
        listedDate: new Date(),
        status: 'available',
        coordinates: { lat: 17.4272, lng: 78.4098 }, // Jubilee Hills Hyderabad
      },
      {
        title: 'Premium Flat in Salt Lake',
        description: '3BHK apartment near Sector V Tech Hub',
        price: 6500000,
        location: { city: 'Kolkata', state: 'West Bengal', pincode: '700091' },
        propertyType: 'apartment',
        bedrooms: 3,
        bathrooms: 2,
        area: 1400,
        amenities: ['Gym', 'Community Hall', 'Children\'s Play Area'],
        images: ['https://example.com/img5.jpg'],
        listedDate: new Date(),
        status: 'available',
        coordinates: { lat: 22.5791, lng: 88.4320 }, // Salt Lake Kolkata
      },
      {
        title: 'Modern Apartment in Aundh',
        description: '3BHK with premium amenities',
        price: 7800000,
        location: { city: 'Pune', state: 'Maharashtra', pincode: '411007' },
        propertyType: 'apartment',
        bedrooms: 3,
        bathrooms: 2,
        area: 1650,
        amenities: ['Gym', 'Jogging Track', 'Clubhouse'],
        images: ['https://example.com/img6.jpg'],
        listedDate: new Date(),
        status: 'available',
        coordinates: { lat: 18.5589, lng: 73.8077 }, // Aundh Pune
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
