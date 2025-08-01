import axios from 'axios'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

interface LatLng {
  lat: number
  lng: number
}

export class GoogleMapsService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || ''
    if (!this.apiKey) {
      console.error('GOOGLE_MAPS_API_KEY is not set in environment variables')
    } else {
      console.log('Google Maps API Key is configured')
    }
  }

  async searchNearbyPlaces(
    location: LatLng,
    type: string,
    radius: number
  ) {
    if (!this.apiKey) {
      throw new Error('Google Maps API key is not configured')
    }

    console.log('Searching nearby places:', { location, type, radius })
    
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`
    try {
      const response = await axios.get(url, {
        params: {
          key: this.apiKey,
          location: `${location.lat},${location.lng}`,
          radius,
          type,
        },
      })

    if (response.data.status !== 'OK') {
      console.error('Google Places API error:', response.data)
      throw new Error(`Google Places API error: ${response.data.status}`)
    }

    if (!response.data.results) {
      console.error('No results in Google Places API response:', response.data)
      return []
    }

    return response.data.results
    } catch (error) {
      console.error('Error searching nearby places:', error)
      throw error
    }
  }

  async calculateDistance(origin: LatLng, destinations: LatLng[]) {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json`
    const response = await axios.get(url, {
      params: {
        key: this.apiKey,
        origins: `${origin.lat},${origin.lng}`,
        destinations: destinations.map(d => `${d.lat},${d.lng}`).join('|'),
        mode: 'driving',
      },
    })

    return response.data
  }

  async getPlaceDetails(placeId: string) {
    const url = `https://maps.googleapis.com/maps/api/place/details/json`
    const response = await axios.get(url, {
      params: {
        key: this.apiKey,
        place_id: placeId,
        fields: 'name,rating,user_ratings_total,formatted_address',
      },
    })

    return response.data.result
  }
}
