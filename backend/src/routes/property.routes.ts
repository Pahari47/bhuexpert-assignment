import express from 'express'
import { searchProperties } from '../controllers/property.controller'
import { getNearbyAmenities } from '../controllers/amenity.controller'

const router = express.Router()

router.get('/search', searchProperties)
router.get('/:id/nearby-amenities', getNearbyAmenities)

export default router
