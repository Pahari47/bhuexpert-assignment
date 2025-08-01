import express from 'express'
import { searchProperties } from '../controllers/property.controller'

const router = express.Router()

router.get('/search', searchProperties)

export default router
