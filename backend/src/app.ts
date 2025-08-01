import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import propertyRoutes from './routes/property.routes'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/properties', propertyRoutes)

export default app
