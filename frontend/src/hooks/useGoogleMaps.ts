import { useEffect, useState } from 'react'

export const useGoogleMaps = () => {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if ((window as any).google) {
      setLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.onload = () => setLoaded(true)
    script.onerror = () => console.error('Failed to load Google Maps')
    document.body.appendChild(script)
  }, [])

  return loaded
}
