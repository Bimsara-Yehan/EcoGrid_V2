import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

export default function DrawControl({ 
  onCreated, 
  onEdited, 
  onDeleted,
  initialGeometry = null,
  editOnly = false
}) {
  const map = useMap()
  const drawControlRef = useRef(null)
  const featureGroupRef = useRef(null)
  
  useEffect(() => {
    // Create feature group for drawn shapes
    const featureGroup = new L.FeatureGroup()
    map.addLayer(featureGroup)
    featureGroupRef.current = featureGroup
    
    // Load initial geometry if provided
    if (initialGeometry) {
      loadInitialGeometry(initialGeometry, featureGroup)
    }
    
    // Create draw control
    const drawControl = new L.Control.Draw({
      position: 'topleft',
      draw: {
        polygon: editOnly ? false : {
          allowIntersection: false,
          drawError: {
            color: '#e1e100',
            message: '<strong>Oh snap!<strong> you can\'t draw that!'
          },
          shapeOptions: {
            color: '#ff4757',
            weight: 3,
            fillOpacity: 0.3
          }
        },
        rectangle: editOnly ? false : {
          shapeOptions: {
            color: '#2ed573',
            weight: 3,
            fillOpacity: 0.3
          }
        },
        circle: editOnly ? false : {
          shapeOptions: {
            color: '#3742fa',
            weight: 3,
            fillOpacity: 0.3
          }
        },
        polyline: false,
        marker: false,
        circlemarker: false
      },
      edit: {
        featureGroup: featureGroup,
        remove: true,
        edit: {
          selectedPathOptions: {
            color: '#ffa502',
            weight: 3
          }
        }
      }
    })
    
    map.addControl(drawControl)
    drawControlRef.current = drawControl
    
    // Event listeners
    map.on(L.Draw.Event.CREATED, handleDrawCreated)
    map.on(L.Draw.Event.EDITED, handleDrawEdited)
    map.on(L.Draw.Event.DELETED, handleDrawDeleted)
    
    // Cleanup function
    return () => {
      try {
        if (drawControlRef.current) {
          map.removeControl(drawControlRef.current)
        }
        if (featureGroupRef.current) {
          map.removeLayer(featureGroupRef.current)
        }
        map.off(L.Draw.Event.CREATED, handleDrawCreated)
        map.off(L.Draw.Event.EDITED, handleDrawEdited)
        map.off(L.Draw.Event.DELETED, handleDrawDeleted)
      } catch (error) {
        console.log('Error cleaning up draw control:', error)
      }
    }
  }, [map, initialGeometry])
  
  function handleDrawCreated(e) {
    const layer = e.layer
    featureGroupRef.current.addLayer(layer)
    
    if (onCreated) {
      onCreated(layer)
    }
  }
  
  function handleDrawEdited(e) {
    const layers = e.layers
    if (onEdited) {
      onEdited(layers)
    }
  }
  
  function handleDrawDeleted(e) {
    const layers = e.layers
    if (onDeleted) {
      onDeleted(layers)
    }
  }
  
  function loadInitialGeometry(geometry, featureGroup) {
    if (geometry.type === 'Polygon' && geometry.coordinates) {
      try {
      const latLngs = geometry.coordinates[0].map(([lng, lat]) => [lat, lng])
      const polygon = L.polygon(latLngs, {
        color: '#ff4757',
        weight: 3,
        fillOpacity: 0.3
      })
        featureGroup.addLayer(polygon)
      } catch (error) {
        console.error('Error loading initial geometry:', error)
      }
    }
  }
  
  return null
}
