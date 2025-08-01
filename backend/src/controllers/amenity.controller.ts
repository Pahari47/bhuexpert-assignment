import { Request, Response } from 'express'
import { Property } from '../models/property.model'
import { GoogleMapsService } from '../services/googleMaps.service'
import { AmenityCache } from '../services/cache.service'

const googleService = new GoogleMapsService()
const cache = new AmenityCache()

export const getNearbyAmenities = async (req: Request, res: Response) => {
  try {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      console.error('GOOGLE_MAPS_API_KEY is not set in environment')
      return res.status(500).json({ message: 'Google Maps API is not configured' })
    }

    const propertyId = req.params.id
    const { types = '', radius = '5000', limit = '5' } = req.query
    
    console.log('Environment check:', {
      hasApiKey: !!process.env.GOOGLE_MAPS_API_KEY,
      keyLength: process.env.GOOGLE_MAPS_API_KEY?.length
    })

    console.log('Fetching amenities for property:', propertyId)
    console.log('Query parameters:', { types, radius, limit })

    // Validate propertyId format
    if (!propertyId.match(/^[0-9a-fA-F]{24}$/)) {
      console.error('Invalid property ID format:', propertyId)
      return res.status(400).json({ message: 'Invalid property ID format' })
    }

    const property = await Property.findById(propertyId)
    if (!property) {
      return res.status(404).json({ message: 'Property not found' })
    }

    const location = property.coordinates
    const amenityTypes = (types as string).split(',')

    const amenities: Record<string, any[]> = {}

    for (const type of amenityTypes) {
      const cached = await cache.get(propertyId, type)
      if (cached) {
        amenities[type] = cached
        continue
      }

      try {
        const nearby = await googleService.searchNearbyPlaces(
          location,
          type,
          Number(radius)
        )
        const sliced = nearby.slice(0, Number(limit))
        
        if (sliced.length === 0) {
          console.log(`No ${type} found near location:`, location)
        } else {
          console.log(`Found ${sliced.length} ${type}(s) near location:`, location)
        }

        amenities[type] = sliced
        await cache.set(propertyId, type, sliced, 1000 * 60 * 10) // TTL: 10 min
      } catch (error) {
        console.error(`Error fetching ${type}:`, error)
        amenities[type] = []
      }
    }

    res.json({
      property: {
        id: property._id,
        title: property.title,
        coordinates: location,
      },
      amenities,
      searchRadius: radius,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to fetch amenities' })
  }
}
