import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
    Users, 
    Truck, 
    Trash2, 
    BarChart3, 
    Settings, 
    Calendar,
    MapPin,
    Clock,
    AlertTriangle,
    CheckCircle,
    CheckSquare
} from 'lucide-react';

const AdminDashboardScreen = () => {
    const navigate = useNavigate();
    const { getString } = useLanguage();
    const { isDarkMode } = useTheme();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeCollections: 0,
        completedToday: 0,
        pendingApprovals: 0
    });

    const [recentCollections, setRecentCollections] = useState([]);
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        // Simulate fetching admin data
        setStats({
            totalUsers: 1247,
            activeCollections: 23,
            completedToday: 156,
            pendingApprovals: 8
        });

        setRecentCollections([
            {
                id: 1,
                userId: 'User123',
                wasteType: 'RECYCLABLES',
                scheduledDate: '2024-01-15',
                status: 'IN_PROGRESS',
                location: 'Downtown Area'
            },
            {
                id: 2,
                userId: 'User456',
                wasteType: 'ORGANIC',
                scheduledDate: '2024-01-15',
                status: 'COMPLETED',
                location: 'Suburban District'
            },
            {
                id: 3,
                userId: 'User789',
                wasteType: 'ELECTRONICS',
                scheduledDate: '2024-01-16',
                status: 'SCHEDULED',
                location: 'Industrial Zone'
            }
        ]);

        // Get user role from context or localStorage
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData && userData.role) {
            setUserRole(userData.role);
        }
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED': return 'text-green-600 bg-green-100';
            case 'IN_PROGRESS': return 'text-blue-600 bg-blue-100';
            case 'SCHEDULED': return 'text-yellow-600 bg-yellow-100';
            case 'CANCELLED': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getWasteTypeIcon = (wasteType) => {
        const icons = {
            'GENERAL_WASTE': '🗑️',
            'RECYCLABLES': '♻️',
            'ORGANIC': '🌱',
            'HAZARDOUS': '⚠️',
            'ELECTRONICS': '📱',
            'PAPER': '📄',
            'GLASS': '🥃',
            'METAL': '🥫'
        };
        return icons[wasteType] || '🗑️';
    };

    return (
        <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {userRole === 'Admin' && getString('adminDashboard')}
                        {userRole === 'Manager' && getString('managementDashboard')}
                        {userRole === 'TruckDriver' && getString('driverDashboard')}
                    </h1>
                    <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                        {getString('adminDashboardWelcome')}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{getString('totalUsers')}</p>
                                <p className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.totalUsers}</p>
                            </div>
                        </div>
                    </div>

                    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Truck className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{getString('activeCollections')}</p>
                                <p className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.activeCollections}</p>
                            </div>
                        </div>
                    </div>

                    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{getString('completedToday')}</p>
                                <p className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.completedToday}</p>
                            </div>
                        </div>
                    </div>

                    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                        <div className="flex items-center">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <AlertTriangle className="h-6 w-6 text-orange-600" />
                            </div>
                            <div className="ml-4">
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{getString('pendingApprovals')}</p>
                                <p className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.pendingApprovals}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{getString('quickActions')}</h3>
                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                                <Calendar className="h-4 w-4 mr-2" />
                                {getString('scheduleCollection')}
                            </button>
                            <button 
                                onClick={() => navigate('/admin-users')}
                                className={`w-full flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${isDarkMode ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}
                            >
                                <Users className="h-4 w-4 mr-2" />
                                {getString('manageUsers')}
                            </button>
                            <button 
                                onClick={() => navigate('/admin-tasks')}
                                className={`w-full flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${isDarkMode ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}
                            >
                                <CheckSquare className="h-4 w-4 mr-2" />
                                Manage Tasks
                            </button>
                                                         <button 
                                 onClick={() => navigate('/reports-dashboard')}
                                 className={`w-full flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${isDarkMode ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}
                             >
                                 <BarChart3 className="h-4 w-4 mr-2" />
                                 {getString('viewReports')}
                             </button>
                        </div>
                    </div>

                    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{getString('todaysSchedule')}</h3>
                        <div className="space-y-3">
                            <div className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <div className="flex items-center">
                                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>09:00 AM</span>
                                </div>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                    {getString('downtownRoute')}
                                </span>
                            </div>
                            <div className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <div className="flex items-center">
                                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>02:00 PM</span>
                                </div>
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                    {getString('suburbanRoute')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{getString('systemStatus')}</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{getString('database')}</span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {getString('online')}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{getString('apiServices')}</span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {getString('online')}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{getString('notifications')}</span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {getString('online')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Collections */}
                <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
                    <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{getString('recentCollections')}</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                                <tr>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                        {getString('user')}
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                        {getString('wasteType')}
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                        {getString('date')}
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                        {getString('status')}
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                        {getString('location')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                                {recentCollections.map((collection) => (
                                    <tr key={collection.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {collection.userId}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            <div className="flex items-center">
                                                <span className="mr-2">{getWasteTypeIcon(collection.wasteType)}</span>
                                                {collection.wasteType.replace('_', ' ')}
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {new Date(collection.scheduledDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(collection.status)}`}>
                                                {collection.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            <div className="flex items-center">
                                                <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                                                {collection.location}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardScreen;

