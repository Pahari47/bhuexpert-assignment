import { Request, Response } from 'express'
import { Property } from '../models/property.model'

export const searchProperties = async (req: Request, res: Response) => {
  try {
    const {
      city,
      minPrice,
      maxPrice,
      propertyType,
      minBedrooms,
      sortBy = 'listedDate',
      page = 1,
      limit = 10,
    } = req.query

    const query: any = {}

    if (city) query['location.city'] = city
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number(minPrice)
      if (maxPrice) query.price.$lte = Number(maxPrice)
    }
    if (propertyType) query.propertyType = propertyType
    if (minBedrooms) query.bedrooms = { $gte: Number(minBedrooms) }

    const sortOptions: any = {}
    if (sortBy === 'price') sortOptions.price = 1
    else sortOptions.listedDate = -1

    const results = await Property.find(query)
      .sort(sortOptions)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))

    const total = await Property.countDocuments(query)

    res.json({
      total,
      page: Number(page),
      limit: Number(limit),
      results,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server Error' })
  }
}
