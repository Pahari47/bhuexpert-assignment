import axios from 'axios'

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY!

interface LatLng {
  lat: number
  lng: number
}

export class GoogleMapsService {
  constructor(private apiKey: string = GOOGLE_API_KEY) {}

  async searchNearbyPlaces(
    location: LatLng,
    type: string,
    radius: number
  ) {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`
    const response = await axios.get(url, {
      params: {
        key: this.apiKey,
        location: `${location.lat},${location.lng}`,
        radius,
        type,
      },
    })

    return response.data.results
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
