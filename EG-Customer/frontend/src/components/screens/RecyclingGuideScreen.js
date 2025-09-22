import React, { useState, useEffect, Suspense } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Star, 
  Navigation,
  Filter,
  Search,
  Leaf,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const LazyMap = React.lazy(() => import('./RecyclingGuideMap'));

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom icons for different station statuses
const createCustomIcon = (status, isOpen) => {
  let color = '#22c55e'; // green for operational
  if (status === 'maintenance') color = '#f59e0b'; // yellow
  if (status === 'temporarily_closed') color = '#ef4444'; // red
  if (status === 'full') color = '#f97316'; // orange
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background-color: ${color};
      width: 25px;
      height: 25px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: white;
      font-weight: bold;
    ">${isOpen ? '✓' : '○'}</div>`,
    iconSize: [25, 25],
    iconAnchor: [12, 12]
  });
};

const CompostingScreen = () => {
  const { getString } = useLanguage();
  const { isDarkMode } = useTheme();
  
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState([7.2906, 80.6337]); // Kandy center
  const [isClient, setIsClient] = useState(false);

  // Load composting stations
  useEffect(() => {
    setIsClient(true);
    loadCompostingStations();
    getUserLocation();
  }, []);

  // Reload stations when user location changes
  useEffect(() => {
    if (userLocation) {
      loadCompostingStations();
    }
  }, [userLocation]);

  // Filter stations based on search and area
  useEffect(() => {
    let filtered = stations;

    if (searchTerm) {
      filtered = filtered.filter(station =>
        station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.location.area.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }


    setFilteredStations(filtered);
  }, [stations, searchTerm]);

  const loadCompostingStations = async () => {
    try {
      let url = '/api/composting/stations';
      
      // If user location is available, include it in the request for distance calculation
      if (userLocation) {
        url += `?lat=${userLocation.lat}&lng=${userLocation.lng}&maxDistance=50`;
      }
      
      const response = await axios.get(url);
      setStations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading composting stations:', error);
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setMapCenter([location.lat, location.lng]);
        },
        (error) => {
          // Only log error once to avoid spam
          if (error.code === error.TIMEOUT) {
            console.warn('Geolocation timeout - using default location');
          } else if (error.code === error.PERMISSION_DENIED) {
            console.warn('Geolocation permission denied - using default location');
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            console.warn('Geolocation position unavailable - using default location');
          } else {
            console.warn('Geolocation error:', error.message);
          }
          // Default to Kandy center if location access fails
          setMapCenter([7.2906, 80.6337]);
        },
        {
          timeout: 5000, // Reduced timeout to 5 seconds
          enableHighAccuracy: false,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      console.warn('Geolocation is not supported by this browser');
      setMapCenter([7.2906, 80.6337]);
    }
  };

  const getStatusColor = (status, isDarkMode) => {
    if (isDarkMode) {
      switch (status) {
        case 'operational':
          return 'bg-green-900/30 text-green-300 border border-green-800/50';
        case 'maintenance':
          return 'bg-yellow-900/30 text-yellow-300 border border-yellow-800/50';
        case 'temporarily_closed':
          return 'bg-red-900/30 text-red-300 border border-red-800/50';
        case 'full':
          return 'bg-orange-900/30 text-orange-300 border border-orange-800/50';
        default:
          return 'bg-gray-700 text-gray-300 border border-gray-600';
      }
    } else {
      switch (status) {
        case 'operational':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'maintenance':
          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'temporarily_closed':
          return 'bg-red-100 text-red-800 border-red-200';
        case 'full':
          return 'bg-orange-100 text-orange-800 border-orange-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'operational':
        return 'Operational';
      case 'maintenance':
        return 'Maintenance';
      case 'temporarily_closed':
        return 'Temporarily Closed';
      case 'full':
        return 'Full';
      default:
        return 'Unknown';
    }
  };

  const getFacilityIcon = (facility) => {
    switch (facility) {
      case 'organic_waste_drop_off':
        return '🗑️';
      case 'compost_pickup':
        return '📦';
      case 'educational_workshops':
        return '🎓';
      case 'equipment_rental':
        return '🔧';
      case 'consultation_services':
        return '💬';
      case 'community_garden':
        return '🌱';
      case 'waste_separation_guidance':
        return '♻️';
      default:
        return '📍';
    }
  };

  const getFacilityText = (facility) => {
    switch (facility) {
      case 'organic_waste_drop_off':
        return 'Organic Waste Drop-off';
      case 'compost_pickup':
        return 'Compost Pickup';
      case 'educational_workshops':
        return 'Educational Workshops';
      case 'equipment_rental':
        return 'Equipment Rental';
      case 'consultation_services':
        return 'Consultation Services';
      case 'community_garden':
        return 'Community Garden';
      case 'waste_separation_guidance':
        return 'Waste Separation Guidance';
      default:
        return facility;
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading composting stations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-3`}>
          <Leaf className={`h-8 w-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
          {getString('composting_stations')}
        </h1>
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
          {getString('composting_stations_desc')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stations.length}</p>
              <p className={`text-sm opacity-75 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{getString('total_stations')}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stations.filter(s => s.status === 'operational').length}
              </p>
              <p className={`text-sm opacity-75 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{getString('operational')}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-orange-50'}`}>
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stations.filter(s => s.isOpen).length}
              </p>
              <p className={`text-sm opacity-75 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{getString('open_now')}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stations.length > 0 ? (stations.reduce((sum, s) => sum + s.averageRating, 0) / stations.length).toFixed(1) : '0.0'}
              </p>
              <p className={`text-sm opacity-75 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{getString('avg_rating')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`rounded-xl p-6 mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search stations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
              />
            </div>

          </div>

          {/* Map Toggle */}
          <button
            onClick={() => setShowMap(!showMap)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <Navigation className="h-4 w-4" />
            {showMap ? 'Hide Map' : 'Show Map'}
          </button>
        </div>
      </div>

      {/* Interactive Map */}
      {showMap && isClient && (
        <div className={`rounded-xl mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
          <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
              <MapPin className={`h-5 w-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              Composting Stations Map
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
              Click on markers to view station details. Green markers indicate operational stations.
            </p>
          </div>
          <Suspense fallback={<div style={{height: 500}} className={`flex items-center justify-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading map...</div>}>
            <LazyMap
              mapCenter={mapCenter}
              userLocation={userLocation}
              filteredStations={filteredStations}
              createCustomIcon={createCustomIcon}
              onSelectStation={setSelectedStation}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
              getFacilityIcon={getFacilityIcon}
              getFacilityText={getFacilityText}
            />
          </Suspense>
        </div>
      )}

      {/* Stations List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredStations.map((station) => (
          <div
            key={station._id}
            className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} hover:shadow-md transition-shadow cursor-pointer`}
            onClick={() => setSelectedStation(station)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>{station.name}</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>{station.description}</p>
                <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <MapPin className="h-4 w-4" />
                  <span>{station.location.address}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(station.status, isDarkMode)}`}>
                  {getStatusText(station.status)}
                </span>
                {station.isOpen ? (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-green-900/30 text-green-300 border border-green-800/50' : 'bg-green-100 text-green-800 border border-green-200'}`}>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Open Now
                  </span>
                ) : (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-red-900/30 text-red-300 border border-red-800/50' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Closed
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {/* Operating Hours */}
              <div className={`space-y-2`}>
                <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Operating Hours:</span>
                </div>
                <div className={`ml-6 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {station.operatingHours && station.operatingHours.open && station.operatingHours.close ? (
                    <div>
                      <div className="font-medium">
                        {station.operatingHours.open} - {station.operatingHours.close}
                      </div>
                      <div className="text-xs mt-1">
                        {station.operatingHours.days && station.operatingHours.days.length > 0 
                          ? station.operatingHours.days.join(', ')
                          : 'Daily'
                        }
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium">8:00 AM - 6:00 PM</div>
                      <div className="text-xs mt-1">Monday - Sunday</div>
                      <div className="text-xs mt-1 italic text-gray-400">Default hours (contact station for exact times)</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact */}
              <div className={`flex items-center gap-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {station.contact && station.contact.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <span>{station.contact.phone}</span>
                  </div>
                )}
                {station.contact && station.contact.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span>{station.contact.email}</span>
                  </div>
                )}
              </div>

              {/* Capacity */}
              <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <Info className="h-4 w-4" />
                <span>Capacity: {station.currentLoad}/{station.capacity} kg</span>
                <div className={`flex-1 rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className={`h-2 rounded-full ${isDarkMode ? 'bg-green-400' : 'bg-green-600'}`}
                    style={{ width: `${(station.currentLoad / station.capacity) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Facilities */}
              <div className="flex flex-wrap gap-2">
                {station.facilities && station.facilities.slice(0, 3).map((facility, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center px-2 py-1 rounded text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    <span className="mr-1">{getFacilityIcon(facility)}</span>
                    {getFacilityText(facility)}
                  </span>
                ))}
                {station.facilities && station.facilities.length > 3 && (
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                    +{station.facilities.length - 3} more
                  </span>
                )}
              </div>

              {/* Distance */}
              {station.distance && (
                <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <Navigation className="h-4 w-4" />
                  <span>{station.distance} km away</span>
                </div>
              )}

              {/* Get Directions Button */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    const lat = station?.location?.coordinates?.latitude;
                    const lng = station?.location?.coordinates?.longitude;
                    if (lat && lng) {
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                    }
                  }}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    isDarkMode 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  Get Directions
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredStations.length === 0 && (
        <div className={`rounded-xl p-12 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <MapPin className={`h-16 w-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>No stations found</h3>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {searchTerm
              ? 'Try adjusting your search criteria to find composting stations.'
              : 'No composting stations are currently available.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default CompostingScreen;



