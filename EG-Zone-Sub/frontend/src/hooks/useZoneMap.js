import { useEffect, useState, useCallback } from 'react'
import { getZones, getCustomers, createZone } from '../api'
import L from 'leaflet'

// Color scheme for different zone types
export const ZONE_COLORS = {
  Urban: '#ff4757',      // Red
  Rural: '#2ed573',      // Green
  Suburban: '#3742fa'    // Blue
}

// Custom marker icon for customers
export const customerIcon = L.divIcon({
  className: 'custom-marker',
  html: '<div style="background-color: #ff6b35; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6]
})

// Kandy bounds
export const KANDY_BOUNDS = [
  [7.2, 80.55], // Southwest corner
  [7.4, 80.75]  // Northeast corner
]

// KANDY center coordinates
export const KANDY_CENTER = [7.2906, 80.6337]


export const useZoneMap = (options = {}) => {
  const {
    enableZoneCreation = false,
    enableCustomerDisplay = true,
    onZoneCreated = null,
    onZoneUpdated = null
  } = options

  const [zones, setZones] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hoveredCustomer, setHoveredCustomer] = useState(null)

  // Load zones and customers
  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const promises = [getZones()]
      if (enableCustomerDisplay) {
        promises.push(getCustomers())
      }
      
      const results = await Promise.all(promises)
      const zonesData = results[0] || []
      console.log('useZoneMap - Raw zones data:', zonesData)
      console.log('useZoneMap - Zones with geometry:', zonesData.filter(z => z.geometry?.coordinates))
      
      setZones(zonesData)
      if (enableCustomerDisplay) {
        setCustomers(results[1] || [])
      }
    } catch (e) {
      setError('Failed to load data')
      console.error('Error loading data:', e)
      
      // If we have existing zones data, keep it instead of clearing
      if (zones.length > 0) {
        console.log('Keeping existing zones data due to API error')
      }
    } finally {
      setLoading(false)
    }
  }, [enableCustomerDisplay, zones.length])

  // Create a new zone
  const createNewZone = useCallback(async (zoneData) => {
    try {
      const res = await createZone(zoneData)
      if (res?.zone) {
        setZones(prev => [...prev, res.zone])
        if (onZoneCreated) {
          onZoneCreated(res.zone)
        }
        return res.zone
      } else {
        // Refresh zones if no zone returned
        await loadData()
        return null
      }
    } catch (e) {
      setError('Failed to create zone')
      console.error('Error creating zone:', e)
      throw e
    }
  }, [onZoneCreated, loadData])

  // Handle zone creation from drawn geometry
  const handleZoneCreation = useCallback(async (layer, zoneData = {}) => {
    let ring = layer.getLatLngs()[0].map(({ lat, lng }) => [lng, lat])
    // Ensure closed linear ring per GeoJSON spec
    if (ring.length && (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])) {
      ring = [...ring, ring[0]]
    }
    
    const payload = {
      name: zoneData.name || `Zone ${Date.now()}`,
      type: zoneData.type || 'Urban',
      description: zoneData.description || '',
      geometry: { type: 'Polygon', coordinates: [ring] }
    }
    
    return await createNewZone(payload)
  }, [createNewZone])

  // Update zones
  const updateZones = useCallback((newZones) => {
    setZones(newZones)
  }, [])

  // Update customers
  const updateCustomers = useCallback((newCustomers) => {
    setCustomers(newCustomers)
  }, [])

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    // State
    zones,
    customers,
    loading,
    error,
    hoveredCustomer,
    
    // Actions
    loadData,
    createNewZone,
    handleZoneCreation,
    updateZones,
    updateCustomers,
    setHoveredCustomer,
    
    // Constants
    ZONE_COLORS,
    customerIcon,
    MAP_CENTER: KANDY_CENTER,
    MAP_BOUNDS: KANDY_BOUNDS
    
  }
}
