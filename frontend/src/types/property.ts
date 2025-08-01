export interface SearchFilters {
  city?: string
  minPrice?: number
  maxPrice?: number
  propertyType?: string
  minBedrooms?: number
  page?: number
  limit?: number
  sortBy?: 'price' | 'listedDate'
}
