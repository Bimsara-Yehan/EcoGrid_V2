import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Phone, MapPin, Shield, Camera, X, Edit, Lock } from 'lucide-react';

const ProfileScreen = () => {
  const navigate = useNavigate();
  const { getString } = useLanguage();
  const { user, updateProfile } = useAuth();
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  if (!user) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">{getString('profile_title')}</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin':
        return <Shield className="h-5 w-5 text-blue-600" />;
      case 'Manager':
        return <Shield className="h-5 w-5 text-purple-600" />;
      case 'TruckDriver':
        return <Shield className="h-5 w-5 text-orange-600" />;
      case 'Incinerator':
        return <Shield className="h-5 w-5 text-red-600" />;
      default:
        return <User className="h-5 w-5 text-green-600" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Manager':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'TruckDriver':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Incinerator':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('profileImage', selectedFile);

      const response = await fetch('/api/user-profile/image', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        // Refresh the page to show the new image
        window.location.reload();
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      setIsEditingImage(false);
      setSelectedFile(null);
    }
  };

  const openImageUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-green-700">{getString('profile_title')}</h1>
      <p className="text-gray-600 mb-8">{getString('profile_desc')}</p>

      <div className="rounded-xl border border-green-100 bg-white p-8 shadow-lg">
        {/* Profile Header with Image and Basic Info */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
          {/* Profile Picture */}
          <div className="relative group">
            {user.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt="Profile"
                className="h-32 w-32 rounded-full object-cover ring-4 ring-green-200 shadow-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            {/* Fallback Avatar */}
            <div 
              className={`h-32 w-32 rounded-full flex items-center justify-center text-4xl font-bold text-white bg-gradient-to-br from-green-400 to-green-600 ring-4 ring-green-200 shadow-lg ${
                user.profileImageUrl ? 'hidden' : 'flex'
              }`}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            
            {/* Edit Image Button */}
            <button
              onClick={openImageUpload}
              className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-green-700"
              title="Change profile picture"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          {/* Basic Info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h2>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              {getRoleIcon(user.role)}
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(user.role)}`}>
                {user.role}
              </span>
            </div>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-6">
          <button
            onClick={() => navigate('/edit-profile')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </button>
          <button
            onClick={() => navigate('/change-password')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            <Lock className="h-4 w-4" />
            Change Password
          </button>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              Personal Information
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-gray-900">{user.email}</p>
                </div>
              </div>

              {user.phone && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-gray-900">{user.phone}</p>
                  </div>
                </div>
              )}

              {user.address && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="text-gray-900">{user.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Account Information
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Shield className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Account Type</p>
                  <p className="text-gray-900">{user.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="h-5 w-5 text-gray-400">📅</div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Member Since</p>
                  <p className="text-gray-900">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="h-5 w-5 text-gray-400">✅</div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Onboarding Status</p>
                  <p className="text-gray-900">
                    {user.hasCompletedOnboarding ? 'Completed' : 'Pending'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Image Upload Modal */}
      {isEditingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Update Profile Picture</h3>
              <button
                onClick={() => setIsEditingImage(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {selectedFile && (
              <div className="mb-4">
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditingImage(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleImageUpload}
                disabled={!selectedFile || isUploading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileScreen;


