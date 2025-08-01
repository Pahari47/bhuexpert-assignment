import { Request, Response } from 'express'
import { Property } from '../models/property.model'
import { GoogleMapsService } from '../services/googleMaps.service'
import { AmenityCache } from '../services/cache.service'

const googleService = new GoogleMapsService()
const cache = new AmenityCache()

export const getNearbyAmenities = async (req: Request, res: Response) => {
  try {
    const propertyId = req.params.id
    const { types = '', radius = '5000', limit = '5' } = req.query

    // Validate propertyId format
    if (!propertyId.match(/^[0-9a-fA-F]{24}$/)) {
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

      const nearby = await googleService.searchNearbyPlaces(
        location,
        type,
        Number(radius)
      )
      const sliced = nearby.slice(0, Number(limit))

      amenities[type] = sliced

      await cache.set(propertyId, type, sliced, 1000 * 60 * 10) // TTL: 10 min
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
