import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  CheckCircle, 
  RefreshCw, 
  Calendar, 
  RefreshCw as RecyclingIcon, 
  User, 
  History,
  Leaf,
  CheckSquare,
  Star,
  Clock,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

const DashboardScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const { getString } = useLanguage();
  const [stats, setStats] = useState({
    totalCollections: 0,
    totalRecycled: 0,
    currentStreak: 0,
    ecopoints: 0
  });
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchTasks();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/waste-collection/stats');
      setStats(prev => ({
        ...prev,
        ...response.data,
        ecopoints: user?.ecopoints || 0
      }));
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks?limit=5');
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const featureCards = [
    {
      icon: Calendar,
      title: getString('waste_collection'),
      description: getString('waste_collection_desc'),
      onClick: () => navigate('/waste-collection'),
      color: 'bg-blue-500'
    },
    {
      icon: RecyclingIcon,
      title: getString('recycling_guide'),
      description: getString('recycling_guide_desc'),
      onClick: () => navigate('/recycling-guide'),
      color: 'bg-green-500'
    },
    {
      icon: User,
      title: getString('profile'),
      description: getString('profile_desc'),
      onClick: () => navigate('/profile'),
      color: 'bg-purple-500'
    },
    {
      icon: History,
      title: getString('history'),
      description: getString('history_desc'),
      onClick: () => {},
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-green-50 text-green-900'}`}>
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-full ${isDarkMode ? 'bg-green-600' : 'bg-green-100'}`}>
            <Leaf className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {getString('welcome_title')}
            </h1>
            <p className="text-lg opacity-90">
              {getString('welcome_subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={CheckCircle}
          title={getString('collections')}
          value={stats.totalCollections.toString()}
          color="text-blue-600"
          bgColor={isDarkMode ? 'bg-gray-800' : 'bg-blue-50'}
        />
        <StatCard
          icon={RefreshCw}
          title={getString('recycled')}
          value={`${stats.totalRecycled}kg`}
          color="text-green-600"
          bgColor={isDarkMode ? 'bg-gray-800' : 'bg-green-50'}
        />
        <StatCard
          icon={Star}
          title="Ecopoints"
          value={stats.ecopoints.toString()}
          color="text-orange-600"
          bgColor={isDarkMode ? 'bg-gray-800' : 'bg-orange-50'}
        />
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {featureCards.map((card, index) => (
          <FeatureCard
            key={index}
            icon={card.icon}
            title={card.title}
            description={card.description}
            onClick={card.onClick}
            color={card.color}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>

      {/* Tasks */}
      <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            My Tasks
          </h2>
          <button
            onClick={() => navigate('/tasks')}
            className="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            View All
          </button>
        </div>
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No tasks assigned yet</p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskItem key={task._id} task={task} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, title, value, color, bgColor }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`rounded-xl p-6 ${bgColor} ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm opacity-75">{title}</p>
        </div>
      </div>
    </div>
  );
};

const TaskItem = ({ task }) => {
  const { isDarkMode } = useTheme();
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'assigned':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckSquare className="h-4 w-4 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`flex items-center space-x-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
      <div className="flex-shrink-0">
        {getStatusIcon(task.status)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {task.title}
        </p>
        <div className="flex items-center space-x-2 mt-1">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </span>
          <span className="text-xs text-gray-500">
            Due: {formatDate(task.dueDate)}
          </span>
          {task.ecopoints > 0 && (
            <span className="inline-flex items-center text-xs text-green-600">
              <Star className="h-3 w-3 mr-1" />
              {task.ecopoints}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, onClick, color, isDarkMode }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full p-6 rounded-xl text-left transition-all duration-200 hover:scale-105 ${
        isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
      } shadow-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm opacity-75 leading-relaxed">{description}</p>
        </div>
      </div>
    </button>
  );
};

export default DashboardScreen;

