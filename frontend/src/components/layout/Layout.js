import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Chatbot from '../chatbot/Chatbot';
import Logo from '../common/Logo';
import {
  Home,
  Trash2,
  Info,
  User,
  Sun,
  Moon,
  Globe,
  LogOut,
  AlertTriangle,
  Settings,
  CheckSquare,
  Menu,
  X
} from 'lucide-react';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { currentLanguage, languages, changeLanguage, getString } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { path: '/dashboard', icon: Home, label: 'nav_dashboard' },
    { path: '/waste-collection', icon: Trash2, label: 'nav_collection' },
    { path: '/recycling-guide', icon: Info, label: 'nav_composting' },
    { path: '/tasks', icon: CheckSquare, label: 'nav_tasks' },
    { path: '/report', icon: AlertTriangle, label: 'nav_report' },
    { path: '/profile', icon: User, label: 'nav_profile' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} shadow-sm border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <Logo size={36} className="rounded-lg shadow-sm object-contain bg-white" />
                  <span className="text-xl font-bold text-green-700">EcoGrid</span>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => document.getElementById('language-dropdown').classList.toggle('hidden')}
                  className={`p-2 rounded-lg border ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-green-50'} transition-colors`}
                >
                  <Globe className="w-5 h-5" />
                </button>
                
                <div
                  id="language-dropdown"
                  className={`absolute right-0 mt-2 w-48 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border hidden z-50`}
                >
                  {Object.values(languages).map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        handleLanguageChange(lang.code);
                        document.getElementById('language-dropdown').classList.add('hidden');
                      }}
                      className={`w-full text-left px-4 py-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-green-50'} transition-colors ${
                        currentLanguage === lang.code ? 'bg-green-50 text-green-700' : ''
                      }`}
                    >
                      <span className="mr-2">{lang.flag}</span>
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg border ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-green-50'} transition-colors`}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className={`p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors`}
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar Navigation */}
        <nav className={`
          ${isDarkMode ? 'bg-gray-900' : 'bg-white'} 
          shadow-sm min-h-screen border-r ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}
          fixed lg:static inset-y-0 left-0 z-50
          w-64 transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => {
                        navigate(item.path);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors border ${
                        isActive
                          ? 'bg-green-600 text-white border-green-600'
                          : `${isDarkMode ? 'text-gray-300 hover:bg-gray-800 border-gray-800' : 'text-gray-700 hover:bg-green-50 border-gray-100'}`
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">
                        {getString(item.label)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:ml-0">
          {children}
        </main>
      </div>
      
      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Layout;

