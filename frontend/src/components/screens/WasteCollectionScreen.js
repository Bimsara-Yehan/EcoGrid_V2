import React, { useState, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Calendar, 
  Clock, 
  Trash2, 
  Filter,
  Search,
  Plus,
  RefreshCw,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Send,
  FileText
} from 'lucide-react';

const WasteCollectionScreen = () => {
  const { getString } = useLanguage();
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dayFilter, setDayFilter] = useState('all');
  
  // Special collection request form state
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({
    wasteType: '',
    quantity: '',
    preferredDate: '',
    preferredTime: '',
    description: ''
  });

  // Ref for scrolling to special request section
  const specialRequestRef = useRef(null);

  // Function to scroll to special request section and show form
  const handleAddScheduleClick = () => {
    setShowRequestForm(true);
    // Scroll to the special request section with smooth behavior
    setTimeout(() => {
      specialRequestRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100); // Small delay to ensure form is rendered
  };

  // Fixed weekly schedule - same type collected every week on the same day
  // Status will be updated by truck drivers when they complete collection
  const weeklySchedule = [
    { id: 1, day: 'Monday', time: '08:00 - 12:00', type: 'Plastic', status: 'inactive', collectionStatus: 'pending' },
    { id: 2, day: 'Tuesday', time: '08:00 - 12:00', type: 'Glass', status: 'inactive', collectionStatus: 'pending' },
    { id: 3, day: 'Wednesday', time: '08:00 - 12:00', type: 'Kitchen Waste', status: 'inactive', collectionStatus: 'pending' },
    { id: 4, day: 'Thursday', time: '08:00 - 12:00', type: 'Polythene', status: 'inactive', collectionStatus: 'pending' },
    { id: 5, day: 'Friday', time: '08:00 - 12:00', type: 'Mixed Collection', status: 'inactive', collectionStatus: 'pending' },
    { id: 6, day: 'Saturday', time: '09:00 - 13:00', type: 'Bulk Items', status: 'inactive', collectionStatus: 'pending' },
    { id: 7, day: 'Sunday', time: 'No Collection', type: 'Rest Day', status: 'inactive', collectionStatus: 'no_collection' }
  ];

  const wasteTypes = [
    { value: 'all', label: 'All Types', color: 'bg-gray-100 text-gray-800' },
    { value: 'Plastic', label: 'Plastic', color: 'bg-blue-100 text-blue-800' },
    { value: 'Polythene', label: 'Polythene', color: 'bg-green-100 text-green-800' },
    { value: 'Kitchen Waste', label: 'Kitchen Waste', color: 'bg-orange-100 text-orange-800' },
    { value: 'Glass', label: 'Glass', color: 'bg-purple-100 text-purple-800' },
    { value: 'Mixed Collection', label: 'Mixed Collection', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Bulk Items', label: 'Bulk Items', color: 'bg-red-100 text-red-800' },
    { value: 'Rest Day', label: 'Rest Day', color: 'bg-gray-100 text-gray-600' }
  ];

  const daysOfWeek = [
    { value: 'all', label: 'All Days' },
    { value: 'Monday', label: 'Monday' },
    { value: 'Tuesday', label: 'Tuesday' },
    { value: 'Wednesday', label: 'Wednesday' },
    { value: 'Thursday', label: 'Thursday' },
    { value: 'Friday', label: 'Friday' },
    { value: 'Saturday', label: 'Saturday' },
    { value: 'Sunday', label: 'Sunday' }
  ];

  const getTypeColor = (type) => {
    const typeConfig = wasteTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.color : 'bg-gray-100 text-gray-800';
  };

  const filteredSchedule = weeklySchedule.filter(item => {
    const matchesSearch = item.day.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.time.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesDay = dayFilter === 'all' || item.day === dayFilter;
    return matchesSearch && matchesType && matchesDay;
  });

  const getStatusColor = (status) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const getCollectionStatusColor = (collectionStatus) => {
    switch (collectionStatus) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'no_collection':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'missed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getCollectionStatusText = (collectionStatus) => {
    switch (collectionStatus) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      case 'no_collection':
        return 'No Collection';
      case 'missed':
        return 'Missed';
      default:
        return 'Unknown';
    }
  };

  const handleRequestFormChange = (e) => {
    const { name, value } = e.target;
    setRequestForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/special-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(requestForm)
      });

      const data = await response.json();

      if (data.success) {
        alert('Special collection request submitted successfully! We will contact you within 24 hours.');
        setRequestForm({
          wasteType: '',
          quantity: '',
          preferredDate: '',
          preferredTime: '',
          description: ''
        });
        setShowRequestForm(false);
      } else {
        alert(`Error: ${data.error?.message || 'Failed to submit request'}`);
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Failed to submit request. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-2xl sm:text-3xl font-bold flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <Trash2 className={`h-6 w-6 sm:h-8 sm:w-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
          <span className="truncate">Weekly Waste Collection Schedule</span>
        </h1>
        <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Fixed weekly schedule - same waste type collected every week on the same day</p>
        
        {/* Collection Status Info */}
        <div className={`mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <AlertCircle className={`h-5 w-5 mt-0.5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <h3 className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>Collection Status System</h3>
              <p className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                Collection status is updated in real-time by truck drivers. Status resets to "Pending" at the start of each week.
                <br />
                <span className="font-medium">Status Legend:</span> 
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ml-2 mr-1 ${isDarkMode ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-800/50' : 'bg-yellow-100 text-yellow-800'}`}>Pending</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mr-1 ${isDarkMode ? 'bg-blue-900/30 text-blue-300 border border-blue-800/50' : 'bg-blue-100 text-blue-800'}`}>In Progress</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mr-1 ${isDarkMode ? 'bg-green-900/30 text-green-300 border border-green-800/50' : 'bg-green-100 text-green-800'}`}>Completed</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isDarkMode ? 'bg-red-900/30 text-red-300 border border-red-800/50' : 'bg-red-100 text-red-800'}`}>Missed</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-sm transition-all duration-200 hover:shadow-md`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-blue-50'}`}>
              <Calendar className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{weeklySchedule.length}</p>
              <p className={`text-sm opacity-75 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Weekly Schedule</p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-sm transition-all duration-200 hover:shadow-md`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-green-50'}`}>
              <Clock className={`w-6 h-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{weeklySchedule.filter(s => s.collectionStatus === 'completed').length}</p>
              <p className={`text-sm opacity-75 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Completed Today</p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-sm transition-all duration-200 hover:shadow-md`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-orange-50'}`}>
              <Trash2 className={`w-6 h-6 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{wasteTypes.length - 1}</p>
              <p className={`text-sm opacity-75 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Waste Types</p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-sm transition-all duration-200 hover:shadow-md`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-purple-50'}`}>
              <RefreshCw className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>7</p>
              <p className={`text-sm opacity-75 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Days Covered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`rounded-xl p-6 mb-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-sm transition-all duration-200`}>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search schedules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            </div>

            {/* Day Filter */}
            <div className="relative">
              <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <select
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value)}
                className={`pl-10 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                {daysOfWeek.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="relative">
              <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className={`pl-10 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                {wasteTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Add Schedule Button */}
          <button 
            onClick={handleAddScheduleClick}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors ${isDarkMode ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-offset-gray-800' : 'bg-green-600 hover:bg-green-700 text-white focus:ring-offset-white'}`}
          >
            <Plus className="h-4 w-4" />
            Add Schedule
          </button>
        </div>
      </div>

      {/* Schedule Table */}
      <div className={`rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-sm transition-all duration-200`}>
        <div className="overflow-x-auto">
          <table className={`min-w-full ${isDarkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}`}>
            <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Day
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Time
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Type
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Collection Status
                </th>
              </tr>
            </thead>
            <tbody className={`${isDarkMode ? 'bg-gray-800 divide-y divide-gray-700' : 'bg-white divide-y divide-gray-200'}`}>
              {filteredSchedule.map((schedule) => (
                <tr key={schedule.id} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{schedule.day}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{schedule.time}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(schedule.type)}`}>
                      <Trash2 className="h-3 w-3 mr-1" />
                      {schedule.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getCollectionStatusColor(schedule.collectionStatus)}`}>
                      {getCollectionStatusText(schedule.collectionStatus)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredSchedule.length === 0 && (
        <div className={`rounded-xl p-12 text-center ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-sm transition-all duration-200`}>
          <Trash2 className={`h-16 w-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
          <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No schedules found</h3>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {searchTerm || typeFilter !== 'all' || dayFilter !== 'all'
              ? 'Try adjusting your filters to see more schedules.'
              : 'No waste collection schedules have been set up yet.'}
          </p>
        </div>
      )}

      {/* Special Collection Request Section */}
      <div ref={specialRequestRef} className="mt-12">
        <div className={`rounded-xl p-8 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-sm transition-all duration-200`}>
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className={`h-12 w-12 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Need Special Collection?</h2>
            <p className={`max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Have large items, bulk waste, or need collection outside regular schedule? 
              Request a special collection service and we'll arrange pickup at your convenience.
            </p>
          </div>

          {!showRequestForm ? (
            <div className="text-center">
              <button
                onClick={() => setShowRequestForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors text-lg font-medium"
              >
                <Plus className="h-5 w-5" />
                Request Special Collection
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitRequest} className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Waste Type */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Waste Type *
                  </label>
                  <select
                    name="wasteType"
                    value={requestForm.wasteType}
                    onChange={handleRequestFormChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="">Select waste type</option>
                    <option value="bulk_items">Bulk Items (Furniture, Appliances)</option>
                    <option value="construction_waste">Construction Waste</option>
                    <option value="hazardous_waste">Hazardous Waste</option>
                    <option value="electronic_waste">Electronic Waste</option>
                    <option value="garden_waste">Garden Waste</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Estimated Quantity *
                  </label>
                  <select
                    name="quantity"
                    value={requestForm.quantity}
                    onChange={handleRequestFormChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="">Select quantity</option>
                    <option value="small">Small (1-2 bags)</option>
                    <option value="medium">Medium (3-5 bags)</option>
                    <option value="large">Large (6-10 bags)</option>
                    <option value="bulk">Bulk (More than 10 bags)</option>
                  </select>
                </div>

                {/* Preferred Date */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    name="preferredDate"
                    value={requestForm.preferredDate}
                    onChange={handleRequestFormChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                {/* Preferred Time */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Preferred Time *
                  </label>
                  <select
                    name="preferredTime"
                    value={requestForm.preferredTime}
                    onChange={handleRequestFormChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="">Select time slot</option>
                    <option value="morning">Morning (8:00 AM - 12:00 PM)</option>
                    <option value="afternoon">Afternoon (12:00 PM - 4:00 PM)</option>
                    <option value="evening">Evening (4:00 PM - 6:00 PM)</option>
                  </select>
                </div>


                {/* Description */}
                <div className="sm:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <FileText className={`inline h-4 w-4 mr-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    Additional Details
                  </label>
                  <textarea
                    name="description"
                    value={requestForm.description}
                    onChange={handleRequestFormChange}
                    rows={3}
                    placeholder="Describe the waste items, special handling requirements, or any other relevant information..."
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                  />
                </div>

              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end mt-8">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className={`px-6 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700 focus:ring-gray-500 focus:ring-offset-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 focus:ring-offset-white'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${isDarkMode ? 'bg-orange-600 hover:bg-orange-700 text-white focus:ring-orange-500 focus:ring-offset-gray-800' : 'bg-orange-600 hover:bg-orange-700 text-white focus:ring-orange-500 focus:ring-offset-white'}`}
                >
                  <Send className="h-4 w-4" />
                  Submit Request
                </button>
              </div>
            </form>
          )}

          {/* Contact Information */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Immediate Assistance?</h3>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>+94 11 234 5678</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>collections@ecogrid.lk</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>24/7 Emergency Service</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasteCollectionScreen;



