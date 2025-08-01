import { useEffect, useState, useRef } from 'react'

declare global {
  interface Window {
    google?: typeof google
    initMap?: () => void
  }
}

export const useGoogleMaps = () => {
  const [loaded, setLoaded] = useState(false)
  const scriptRef = useRef<HTMLScriptElement | null>(null)
  const loadingPromiseRef = useRef<Promise<void> | null>(null)

  useEffect(() => {
    const loadMaps = async () => {
      if (window.google) {
        setLoaded(true)
        return
      }

      if (!loadingPromiseRef.current) {
        loadingPromiseRef.current = new Promise((resolve, reject) => {
          // Remove any existing script
          const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
          if (existingScript) {
            existingScript.remove()
          }

          const script = document.createElement('script')
          script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`
          script.async = true
          script.defer = true
          scriptRef.current = script

          window.initMap = () => {
            setLoaded(true)
            resolve()
          }

          script.onerror = () => {
            console.error('Failed to load Google Maps')
            reject(new Error('Failed to load Google Maps'))
          }

          document.head.appendChild(script)
        })
      }

      try {
        await loadingPromiseRef.current
      } catch (error) {
        console.error('Error loading Google Maps:', error)
      }
    }

    loadMaps()

    return () => {
      // Cleanup
      if (scriptRef.current?.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current)
      }
      window.initMap = undefined
      loadingPromiseRef.current = null
    }
  }, [])

  return loaded
}
