import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Target, 
  Eye, 
  Award, 
  Phone, 
  Mail, 
  MapPin, 
  Leaf, 
  Recycle, 
  Globe,
  Heart,
  Star,
  CheckCircle,
  TrendingUp,
  Shield,
  Clock,
  User
} from 'lucide-react';

const AboutUsScreen = () => {
  const { getString } = useLanguage();
  const { isDarkMode } = useTheme();

  const achievements = [
    {
      icon: User,
      title: getString('total_users'),
      value: '10,000+',
      description: getString('active_community_members')
    },
    {
      icon: Recycle,
      title: getString('waste_diverted'),
      value: '500+',
      description: getString('tons_recycled')
    },
    {
      icon: Leaf,
      title: getString('carbon_reduced'),
      value: '2,500+',
      description: getString('tons_co2_reduced')
    },
    {
      icon: Award,
      title: getString('ecopoints_earned'),
      value: '1M+',
      description: getString('total_ecopoints')
    }
  ];


  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Hero Section */}
      <div className={`rounded-2xl p-8 mb-12 ${isDarkMode ? 'bg-gradient-to-br from-green-900/20 to-blue-900/20 border border-green-800/30' : 'bg-gradient-to-br from-green-50 to-blue-50 border border-green-200'}`}>
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className={`p-4 rounded-full ${isDarkMode ? 'bg-green-500/20 border border-green-500/30' : 'bg-green-100'}`}>
              <Leaf className={`w-16 h-16 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
            </div>
          </div>
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {getString('about_us_title')}
          </h1>
          <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto leading-relaxed`}>
            {getString('about_us_subtitle')}
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Mission */}
        <div className={`rounded-xl p-8 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-lg`}>
          <div className="flex items-center mb-6">
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-blue-100'}`}>
              <Target className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <h2 className={`text-2xl font-bold ml-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {getString('our_mission')}
            </h2>
          </div>
          <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {getString('mission_statement')}
          </p>
        </div>

        {/* Vision */}
        <div className={`rounded-xl p-8 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-lg`}>
          <div className="flex items-center mb-6">
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-purple-100'}`}>
              <Eye className={`w-8 h-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <h2 className={`text-2xl font-bold ml-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {getString('our_vision')}
            </h2>
          </div>
          <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {getString('vision_statement')}
          </p>
        </div>
      </div>

      {/* Achievements */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {getString('our_achievements')}
          </h2>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {getString('achievements_subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {achievements.map((achievement, index) => (
            <div key={index} className={`rounded-xl p-6 text-center ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-lg hover:shadow-xl transition-shadow duration-300`}>
              <div className={`inline-flex p-4 rounded-full mb-4 ${isDarkMode ? 'bg-green-500/20 border border-green-500/30' : 'bg-green-100'}`}>
                <achievement.icon className={`w-8 h-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {achievement.value}
              </h3>
              <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {achievement.title}
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {achievement.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {getString('our_values')}
          </h2>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {getString('values_subtitle')}
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-lg`}>
            <div className="flex items-center mb-4">
              <Heart className={`w-6 h-6 mr-3 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {getString('sustainability')}
              </h3>
            </div>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {getString('sustainability_desc')}
            </p>
          </div>
          
          <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-lg`}>
            <div className="flex items-center mb-4">
              <Heart className={`w-6 h-6 mr-3 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {getString('community')}
              </h3>
            </div>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {getString('community_desc')}
            </p>
          </div>
          
          <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-lg`}>
            <div className="flex items-center mb-4">
              <Shield className={`w-6 h-6 mr-3 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {getString('innovation')}
              </h3>
            </div>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {getString('innovation_desc')}
            </p>
          </div>
        </div>
      </div>


      {/* Contact Us */}
      <div className={`rounded-2xl p-8 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-lg`}>
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {getString('contact_us')}
          </h2>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {getString('contact_subtitle')}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-blue-100'}`}>
                <Phone className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div>
                <h3 className={`text-lg font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getString('phone')}
                </h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  +94 11 234 5678
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-green-500/20 border border-green-500/30' : 'bg-green-100'}`}>
                <Mail className={`w-6 h-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <div>
                <h3 className={`text-lg font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getString('email')}
                </h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  info@ecogrid.lk
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-purple-100'}`}>
                <MapPin className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <div>
                <h3 className={`text-lg font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getString('address')}
                </h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {getString('office_address')}
                </p>
              </div>
            </div>
          </div>
          
          {/* Office Hours */}
          <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}>
            <div className="flex items-center mb-4">
              <Clock className={`w-6 h-6 mr-3 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {getString('office_hours')}
              </h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{getString('monday_friday')}</span>
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>9:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{getString('saturday')}</span>
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>9:00 AM - 2:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{getString('sunday')}</span>
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{getString('closed')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsScreen;
