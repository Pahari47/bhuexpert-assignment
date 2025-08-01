type CacheEntry = {
    data: any
    expiresAt: number
  }
  
  export class AmenityCache {
    private cache: Map<string, CacheEntry> = new Map()
  
    private getKey(propertyId: string, amenityType: string) {
      return `${propertyId}:${amenityType}`
    }
  
    async get(propertyId: string, amenityType: string): Promise<any | null> {
      const key = this.getKey(propertyId, amenityType)
      const entry = this.cache.get(key)
  
      if (!entry) return null
  
      if (Date.now() > entry.expiresAt) {
        this.cache.delete(key)
        return null
      }
  
      return entry.data
    }
  
    async set(propertyId: string, amenityType: string, data: any, ttl: number) {
      const key = this.getKey(propertyId, amenityType)
      const expiresAt = Date.now() + ttl
      this.cache.set(key, { data, expiresAt })
    }
  }
  