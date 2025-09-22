import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const OnboardingScreen = () => {
  const { getString } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-green-700 mb-2">
          {getString('onboarding_title')}
        </h1>
        <p className="text-gray-600">
          {getString('onboarding_subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl border border-green-100 bg-white hover:shadow-md transition-shadow">
          <h2 className="font-semibold text-green-700 mb-1">{getString('onboarding_step1_title')}</h2>
          <p className="text-sm text-gray-600">{getString('onboarding_step1_desc')}</p>
        </div>
        <div className="p-6 rounded-xl border border-green-100 bg-white hover:shadow-md transition-shadow">
          <h2 className="font-semibold text-green-700 mb-1">{getString('onboarding_step2_title')}</h2>
          <p className="text-sm text-gray-600">{getString('onboarding_step2_desc')}</p>
        </div>
        <div className="p-6 rounded-xl border border-green-100 bg-white hover:shadow-md transition-shadow">
          <h2 className="font-semibold text-green-700 mb-1">{getString('onboarding_step3_title')}</h2>
          <p className="text-sm text-gray-600">{getString('onboarding_step3_desc')}</p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-green-700 mb-4">Choose Your Access Type</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Regular User Access */}
          <div className="text-center">
            <a
              href="/signup"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors shadow-sm"
            >
              {getString('get_started')} - Regular User
            </a>
            <p className="mt-2 text-sm text-gray-600">
              Schedule waste collections and access recycling guides
            </p>
          </div>
          
          {/* Admin Access */}
          <div className="text-center">
            <a
              href="/admin-login"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              Admin Access
            </a>
            <p className="mt-2 text-sm text-gray-600">
              For administrators, managers, and truck drivers
            </p>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-green-600 hover:text-green-700 font-medium">
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;


