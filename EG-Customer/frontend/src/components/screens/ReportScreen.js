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

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Kandy bounds
const KANDY_BOUNDS = L.latLngBounds(L.latLng(7.0, 80.0), L.latLng(7.5, 81.0));
const KANDY_CITY_BOUNDS = L.latLngBounds(L.latLng(7.23, 80.55), L.latLng(7.35, 80.70));

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

    // Draggable marker
    const marker = L.marker([selectedLocation.lat, selectedLocation.lng], {
      draggable: true,
      title: 'Illegal Dumping Location',
    }).addTo(map);

    // Click to set location
    map.on('click', async (e) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      setSelectedLocation({ lat, lng });
      marker.setLatLng([lat, lng]);
      await reverseGeocode(lat, lng);
    });

    // Drag end handler
    marker.on('dragend', async (e) => {
      const { lat, lng } = e.target.getLatLng();
      setSelectedLocation({ lat, lng });
      await reverseGeocode(lat, lng);
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
