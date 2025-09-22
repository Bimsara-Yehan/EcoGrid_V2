import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  MapPin, 
  Camera, 
  X, 
  Send, 
  AlertTriangle,
  Navigation
} from 'lucide-react';
import toast from 'react-hot-toast';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Add CSS for invalid location marker and map overlays
const invalidMarkerStyle = `
  .invalid-location-marker {
    filter: hue-rotate(0deg) saturate(2) brightness(0.7);
  }
  
  .kandy-district-overlay {
    stroke-dasharray: 5, 5;
    animation: dash 20s linear infinite;
  }
  
  @keyframes dash {
    to {
      stroke-dashoffset: -100;
    }
  }
`;

// Inject the style
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = invalidMarkerStyle;
  document.head.appendChild(style);
}

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Kandy District precise boundaries
const KANDY_DISTRICT_BOUNDARY = [
  [7.15, 80.45],  // Southwest corner
  [7.15, 80.75],  // Southeast corner
  [7.35, 80.75],  // Northeast corner
  [7.35, 80.45],  // Northwest corner
  [7.15, 80.45]   // Close the polygon
];

// Kandy bounds for map display
const KANDY_BOUNDS = L.latLngBounds(L.latLng(7.0, 80.0), L.latLng(7.5, 81.0));
const KANDY_CITY_BOUNDS = L.latLngBounds(L.latLng(7.23, 80.55), L.latLng(7.35, 80.70));

// Point-in-polygon algorithm for Kandy District validation
const isPointInKandyDistrict = (lat, lng) => {
  const x = lng;
  const y = lat;
  let inside = false;
  
  for (let i = 0, j = KANDY_DISTRICT_BOUNDARY.length - 1; i < KANDY_DISTRICT_BOUNDARY.length; j = i++) {
    const xi = KANDY_DISTRICT_BOUNDARY[i][1];
    const yi = KANDY_DISTRICT_BOUNDARY[i][0];
    const xj = KANDY_DISTRICT_BOUNDARY[j][1];
    const yj = KANDY_DISTRICT_BOUNDARY[j][0];
    
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
};

const ReportScreen = () => {
  const navigate = useNavigate();
  const { getString } = useLanguage();
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    landmarks: '',
    location: {
      lat: 7.2906, // Kandy
      lng: 80.6337,
      address: 'Kandy, Sri Lanka'
    }
  });
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [mapCenter, setMapCenter] = useState({ lat: 7.2906, lng: 80.6337 });
  const [selectedLocation, setSelectedLocation] = useState({ lat: 7.2906, lng: 80.6337 });
  const [locationError, setLocationError] = useState('');
  const [isLocationValid, setIsLocationValid] = useState(true);
  
  // No file input; enforce instant camera capture only
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);

  // Camera capture refs/state
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');

  // Initialize Leaflet map when component mounts
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    const map = L.map(mapRef.current, {
      center: [mapCenter.lat, mapCenter.lng],
      zoom: 13,
      minZoom: 11,
      maxZoom: 18,
      maxBounds: KANDY_BOUNDS,
      maxBoundsViscosity: 1.0,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    map.fitBounds(KANDY_CITY_BOUNDS, { padding: [20, 20] });

    // Add Kandy District overlay to show valid reporting area
    const kandyDistrictPolygon = L.polygon(KANDY_DISTRICT_BOUNDARY, {
      color: '#10b981', // Green color
      weight: 2,
      opacity: 0.8,
      fillColor: '#10b981',
      fillOpacity: 0.2,
      className: 'kandy-district-overlay'
    }).addTo(map);

    // Add a popup to explain the overlay
    kandyDistrictPolygon.bindPopup(`
      <div style="text-align: center; font-family: Arial, sans-serif;">
        <strong style="color: #10b981;">📍 Valid Reporting Area</strong><br>
        <small style="color: #6b7280;">You can report illegal dumping within this green area</small>
      </div>
    `);

    // Draggable marker
    const marker = L.marker([selectedLocation.lat, selectedLocation.lng], {
      draggable: true,
      title: 'Illegal Dumping Location',
    }).addTo(map);

    // Click to set location
    map.on('click', async (e) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      
      // Validate location
      const isValid = isPointInKandyDistrict(lat, lng);
      setIsLocationValid(isValid);
      
      if (isValid) {
        setLocationError('');
        setSelectedLocation({ lat, lng });
        marker.setLatLng([lat, lng]);
        await reverseGeocode(lat, lng);
      } else {
        setLocationError('Location not in our municipal area');
        // Don't update location if invalid
      }
    });

    // Drag start handler for real-time validation
    marker.on('dragstart', (e) => {
      // Clear any previous error during drag
      setLocationError('');
    });

    // Drag handler for real-time validation
    marker.on('drag', (e) => {
      const { lat, lng } = e.target.getLatLng();
      const isValid = isPointInKandyDistrict(lat, lng);
      
      if (isValid) {
        setLocationError('');
        marker.setIcon(L.icon({
          iconUrl: require('leaflet/dist/images/marker-icon.png'),
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
          shadowSize: [41, 41]
        }));
      } else {
        setLocationError('Location not in our municipal area');
        // Change marker to red when outside district
        marker.setIcon(L.icon({
          iconUrl: require('leaflet/dist/images/marker-icon.png'),
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
          shadowSize: [41, 41],
          className: 'invalid-location-marker'
        }));
      }
    });

    // Drag end handler
    marker.on('dragend', async (e) => {
      const { lat, lng } = e.target.getLatLng();
      const isValid = isPointInKandyDistrict(lat, lng);
      setIsLocationValid(isValid);
      
      if (isValid) {
        setLocationError('');
        setSelectedLocation({ lat, lng });
        await reverseGeocode(lat, lng);
        // Reset marker to normal
        marker.setIcon(L.icon({
          iconUrl: require('leaflet/dist/images/marker-icon.png'),
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
          shadowSize: [41, 41]
        }));
      } else {
        setLocationError('Location not in our municipal area');
        // Snap back to last valid location or center
        marker.setLatLng([selectedLocation.lat, selectedLocation.lng]);
      }
    });

    leafletMapRef.current = map;
    markerRef.current = marker;
  }, []);

  // Cleanup camera stream on unmount or when closing
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const openCamera = async () => {
    setCameraError('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera API not supported by this browser.');
        toast.error('Camera not supported on this device/browser');
        return;
      }

      // Stop any previous stream before opening a new one
      stopStream();

      // Prefer environment camera but fall back gracefully
      const constraintsList = [
        { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } },
        { video: { facingMode: 'environment' } },
        { video: true },
      ];

      let stream = null;
      for (const c of constraintsList) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(c);
          if (stream) break;
        } catch (e) {
          // try next constraints
        }
      }
      if (!stream) throw new Error('Unable to access camera stream');

      // Show the video element first so ref is available
      setIsCameraOpen(true);
      streamRef.current = stream;

      // Attach stream on next tick
      setTimeout(async () => {
        if (videoRef.current) {
          try {
            videoRef.current.muted = true;
            videoRef.current.playsInline = true;
            videoRef.current.srcObject = streamRef.current;
            await videoRef.current.play().catch(() => {});
          } catch (_) {}
        }
      }, 0);
    } catch (e) {
      console.error('openCamera error:', e);
      setCameraError('Unable to access camera. Please allow camera permission or use the file capture.');
      toast.error('Unable to access camera');
      stopStream();
      setIsCameraOpen(false);
    }
  };

  const closeCamera = () => {
    stopStream();
    setIsCameraOpen(false);
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `report-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setSelectedImage(file);
        setImagePreview(URL.createObjectURL(blob));
        closeCamera();
      } else {
        toast.error('Failed to capture photo.');
      }
    }, 'image/jpeg', 0.9);
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      // Use Nominatim for reverse geocoding
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en', 'User-Agent': 'Ecogrid/1.0' } });
      if (res.ok) {
        const data = await res.json();
        const address = data?.display_name || 'Kandy, Sri Lanka';
        setFormData(prev => ({ ...prev, location: { lat, lng, address } }));
      } else {
        setFormData(prev => ({ ...prev, location: { lat, lng, address: 'Kandy, Sri Lanka' } }));
      }
    } catch (e) {
      setFormData(prev => ({ ...prev, location: { lat, lng, address: 'Kandy, Sri Lanka' } }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Removed file select; only camera capture is allowed

  const retakePhoto = () => {
    setSelectedImage(null);
    setImagePreview(null);
    openCamera();
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.landmarks.trim()) newErrors.landmarks = 'Landmarks are required';
    if (!selectedImage) newErrors.image = 'Please upload an image of the illegal dumping';
    if (!isLocationValid) newErrors.location = 'Please select a location within Kandy District';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const reportData = new FormData();
      reportData.append('landmarks', formData.landmarks);
      reportData.append('latitude', formData.location.lat);
      reportData.append('longitude', formData.location.lng);
      reportData.append('address', formData.location.address);
      reportData.append('image', selectedImage);
      const response = await fetch('/api/reporting', {
        method: 'POST',
        headers: { 'x-auth-token': localStorage.getItem('token') },
        body: reportData,
      });
      if (response.ok) {
        toast.success('Report submitted successfully!');
        navigate('/dashboard');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Report submission error:', error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please login to submit reports</h1>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'}`}
            >
              <Navigation className="h-5 w-5" />
            </button>
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Report illegal dumping</h1>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                {getString('reportDescription')}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map Section */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`}>
            <div className="p-4 border-b border-gray-200">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {getString('selectLocation')}
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {getString('clickOnMap')}
              </p>
              
              {/* Map Legend */}
              <div className="mt-3 flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-sm opacity-20"></div>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Valid reporting area</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Your pin location</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Invalid location</span>
                </div>
              </div>
            </div>
            <div 
              ref={mapRef}
              className="w-full h-96"
              style={{ minHeight: '400px' }}
            />
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{formData.location.address}</span>
              </div>
              {/* Location validation error */}
              {locationError && (
                <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded-md">
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{locationError}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Section */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Landmarks Field */}
              <div>
                <label htmlFor="landmarks" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Landmarks near location *
                </label>
                <textarea
                  id="landmarks"
                  name="landmarks"
                  value={formData.landmarks}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.landmarks ? 'border-red-300' : isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                  } ${isDarkMode ? 'placeholder-gray-400' : ''}`}
                  placeholder="Describe nearby landmarks (e.g., school, junction, store)"
                />
                {errors.landmarks && (
                  <p className="mt-1 text-sm text-red-600">{errors.landmarks}</p>
                )}
              </div>

              {/* Description removed per requirements */}

              {/* Severity removed per requirements */}

              {/* Image Upload */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  {getString('uploadImage')} *
                </label>

                {/* Camera controls handled below; duplicate removed */}

                {isCameraOpen && (
                  <div className="mb-3">
                    <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg border border-gray-300" />
                    <canvas ref={canvasRef} className="hidden" />
                    {cameraError && <p className="mt-2 text-sm text-red-600">{cameraError}</p>}
                  </div>
                )}
                
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-300"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        type="button"
                        onClick={retakePhoto}
                        className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Retake
                      </button>
                      <button
                        type="button"
                        onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                        className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        title="Remove"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-3">
                    {!isCameraOpen ? (
                      <button
                        type="button"
                        onClick={openCamera}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Open Camera
                      </button>
                    ) : (
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={takePhoto}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Capture Photo
                        </button>
                        <button
                          type="button"
                          onClick={closeCamera}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {errors.image && (
                  <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                )}
              </div>

              {/* Submit Button */}
              <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {getString('submitting')}...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {getString('submitReport')}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportScreen;
