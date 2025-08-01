import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import propertyRoutes from './routes/property.routes'
import { errorHandler } from './middleware/errorHandler'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// Test route for environment variables
app.get('/api/test-env', (req, res) => {
  const hasGoogleKey = !!process.env.GOOGLE_MAPS_API_KEY
  res.json({
    environment: process.env.NODE_ENV,
    hasGoogleMapsKey: hasGoogleKey,
    googleKeyLength: process.env.GOOGLE_MAPS_API_KEY?.length || 0
  })
})

app.use('/api/properties', propertyRoutes)

app.use(errorHandler)

export default app
