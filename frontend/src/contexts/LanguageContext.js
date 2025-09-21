import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Language definitions
export const languages = {
  en: {
    code: 'en',
    name: 'English',
    flag: '🇺🇸'
  },
  si: {
    code: 'si',
    name: 'සිංහල',
    flag: '🇱🇰'
  },
  ta: {
    code: 'ta',
    name: 'தமிழ்',
    flag: '🇱🇰'
  }
};

// Localized strings
const localizedStrings = {
  en: {
    // Navigation
    nav_dashboard: 'Dashboard',
    nav_collection: 'Collection',
    nav_composting: 'Composting',
    nav_tasks: 'Tasks',
    nav_report: 'Report',
    nav_profile: 'Profile',
    nav_preferences: 'Preferences',
    
    // Common
    welcome_title: 'Welcome to EcoGrid',
    welcome_subtitle: 'Your sustainable waste management companion',
    collections: 'Collections',
    recycled: 'Recycled',
    waste_collection: 'Waste Collection',
    waste_collection_desc: 'Schedule and manage waste pickups',
    recycling_guide: 'Recycling Guide',
    recycling_guide_desc: 'Learn about proper recycling',
    profile: 'Profile',
    profile_desc: 'Manage your account settings',
    history: 'History',
    history_desc: 'View past collections',
    
    // Waste Collection
    waste_collection_title: 'Waste Collection',
    collection_overview_title: 'Collection Overview',
    collection_overview_desc: 'Manage your scheduled waste pickups and track completed collections',
    upcoming_collections: 'Upcoming Collections',
    recent_collections: 'Recent Collections',
    schedule_collection_title: 'Schedule Collection',
    select_date: 'Select Date',
    waste_type: 'Waste Type',
    schedule_button: 'Schedule',
    cancel_button: 'Cancel',
    
    // Waste Types
    waste_type_general: 'General Waste',
    waste_type_recyclables: 'Recyclables',
    waste_type_organic: 'Organic',
    waste_type_hazardous: 'Hazardous',
    waste_type_electronics: 'Electronics',
    
    // Time
    tomorrow: 'Tomorrow',
    friday: 'Friday',
    next_monday: 'Next Monday',
    yesterday: 'Yesterday',
    last_week: 'Last Week',
    am: 'AM',
    pm: 'PM',
    
    // Notes
    paper_plastic_glass: 'Paper, plastic, and glass items',
    food_waste_garden: 'Food waste and garden trimmings',
    old_phones_laptops: 'Old phones, laptops, and electronics',
    paint_and_chemicals: 'Paint and chemical waste',
    
    // Icons
    icon_check: 'Check',
    icon_info: 'Information',
    
    // Auth
    login: 'Login',
    email: 'Email',
    password: 'Password',
    continue_label: 'Continue',
    dont_have_account: "Don't have an account?",
    signup: 'Sign Up',
    
    // Onboarding
    onboarding_title: 'Welcome to EcoGrid',
    onboarding_subtitle: 'Let\'s get you started with sustainable waste management',
    onboarding_step1_title: 'Choose Your Language',
    onboarding_step1_desc: 'Select your preferred language for the app',
    onboarding_step2_title: 'Set Your Preferences',
    onboarding_step2_desc: 'Customize your experience',
    onboarding_step3_title: 'Complete Setup',
    onboarding_step3_desc: 'You\'re all set to start!',
    next: 'Next',
    previous: 'Previous',
    get_started: 'Get Started',
    
    // Profile
    profile_title: 'Profile',
    edit_profile: 'Edit Profile',
    preferences: 'Preferences',
    notifications: 'Notifications',
    dark_mode: 'Dark Mode',
    language: 'Language',
    logout: 'Logout',
    save: 'Save',
    cancel: 'Cancel',
    
    // Recycling Guide
    recycling_guide_title: 'Recycling Guide',
    search_placeholder: 'Search recycling tips...',
    categories: 'Categories',
    tips: 'Tips',
    learn_more: 'Learn More',
    
    // Stats
    total_collections: 'Total Collections',
    total_recycled: 'Total Recycled',
    current_streak: 'Current Streak',
    monthly_stats: 'Monthly Statistics',
    
    // Admin Dashboard
    adminDashboard: 'Admin Dashboard',
    managementDashboard: 'Management Dashboard',
    driverDashboard: 'Driver Dashboard',
    adminDashboardWelcome: 'Welcome back! Here\'s what\'s happening with waste management today.',
    totalUsers: 'Total Users',
    activeCollections: 'Active Collections',
    completedToday: 'Completed Today',
    pendingApprovals: 'Pending Approvals',
    quickActions: 'Quick Actions',
    scheduleCollection: 'Schedule Collection',
    manageUsers: 'Manage Users',
    viewReports: 'View Reports',
    todaysSchedule: 'Today\'s Schedule',
    downtownRoute: 'Downtown Route',
    suburbanRoute: 'Suburban Route',
    systemStatus: 'System Status',
    database: 'Database',
    apiServices: 'API Services',
    online: 'Online',
    recentCollections: 'Recent Collections',
    user: 'User',
    date: 'Date',
    status: 'Status',
    location: 'Location',
    
    // Edit Profile
    editProfileDescription: 'Update your personal information and profile picture',
    changeProfilePicture: 'Change profile picture',
    changePhoto: 'Change Photo',
    removeNewPhoto: 'Remove New Photo',
    fullName: 'Full Name',
    emailAddress: 'Email Address',
    phoneNumber: 'Phone Number',
    address: 'Address',
    enterFullName: 'Enter your full name',
    enterEmailAddress: 'Enter your email address',
    enterPhoneNumberOptional: 'Enter your phone number (optional)',
    enterAddressOptional: 'Enter your address (optional)',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    enterCurrentPassword: 'Enter current password',
    enterNewPasswordMin6: 'Enter new password (min 6 characters)',
    updatePassword: 'Update Password',
    saveChanges: 'Save Changes',
    saving: 'Saving',
    
    // Report Feature
    nav_report: 'Report',
    reportIllegalDumping: 'Report Illegal Dumping',
    reportDescription: 'Help keep Kandy clean by reporting illegal waste disposal',
    selectLocation: 'Select Location',
    clickOnMap: 'Click on the map to pin the exact location',
    reportTitle: 'Report Title',
    enterReportTitle: 'Enter a descriptive title for your report',
    description: 'Description',
    describeIllegalDumping: 'Describe what you found and any additional details',
    severity: 'Severity Level',
    lowSeverity: 'Low - Minor littering',
    mediumSeverity: 'Medium - Moderate waste accumulation',
    highSeverity: 'High - Large waste piles',
    criticalSeverity: 'Critical - Hazardous materials',
    uploadImage: 'Upload Image',
    clickToUpload: 'Click to upload image',
    maxFileSize: 'Maximum file size: 5MB',
    submitReport: 'Submit Report',
    submitting: 'Submitting',
    
    // Reports Dashboard
    reportsDashboard: 'Reports Dashboard',
    manageIllegalDumpingReports: 'Manage illegal dumping reports and track resolution progress',
    totalReports: 'Total Reports',
    pendingReports: 'Pending Reports',
    criticalReports: 'Critical Reports',
    resolvedToday: 'Resolved Today',
    searchReports: 'Search reports...',
    allStatuses: 'All Statuses',
    allSeverities: 'All Severities',
    pending: 'Pending',
    underReview: 'Under Review',
    inProgress: 'In Progress',
    resolved: 'Resolved',
    rejected: 'Rejected',
    report: 'Report',
    reporter: 'Reporter',
    location: 'Location',
    severity: 'Severity',
    status: 'Status',
    date: 'Date',
    actions: 'Actions',
    noReportsFound: 'No reports found',
    showing: 'Showing',
    of: 'of',
    reports: 'reports',
    previous: 'Previous',
    next: 'Next',
    
    // Report Feature
    reportTitle: 'Report Illegal Dumping',
    reportDescription: 'Help keep Kandy clean by reporting illegal waste disposal',
    selectLocation: 'Select Location',
    uploadImage: 'Upload Image',
    description: 'Description',
    enterDescription: 'Enter a detailed description of the illegal dumping...',
    submitReport: 'Submit Report',
    reportSubmitted: 'Report submitted successfully!',
    locationRequired: 'Please select a location on the map',
    imageRequired: 'Please upload an image of the illegal dumping',
    descriptionRequired: 'Please provide a description',
    kandyArea: 'Kandy Area',
    clickToPin: 'Click on the map to pin the location',
    dragToMove: 'Drag to move the map',
    zoomInOut: 'Use mouse wheel to zoom in/out'
  },
  
  si: {
    // Navigation
    nav_dashboard: 'උපකරණ පුවරුව',
    nav_collection: 'එකතු කිරීම',
    nav_composting: 'කොම්පෝස්ට්',
    nav_tasks: 'කාර්යයන්',
    nav_report: 'වාර්තාව',
    nav_profile: 'පැතිකඩ',
    nav_preferences: 'අභිප්‍රේත',
    
    // Common
    welcome_title: 'EcoGrid වෙත සාදරයෙන් පිළිගනිමු',
    welcome_subtitle: 'ඔබගේ තිරසාර අපද්‍රව්‍ය කළමනාකරණ සහයකා',
    collections: 'එකතු කිරීම්',
    recycled: 'නැවත භාවිතයට',
    waste_collection: 'අපද්‍රව්‍ය එකතු කිරීම',
    waste_collection_desc: 'අපද්‍රව්‍ය එකතු කිරීම් සැලසුම් කර කළමනාකරණය කරන්න',
    recycling_guide: 'නැවත භාවිතය මාර්ගෝපදේශ',
    recycling_guide_desc: 'නිසි නැවත භාවිතය ගැන ඉගෙන ගන්න',
    profile: 'පැතිකඩ',
    profile_desc: 'ඔබගේ ගිණුම් සැකසුම් කළමනාකරණය කරන්න',
    history: 'ඉතිහාසය',
    history_desc: 'කලින් එකතු කිරීම් බලන්න',
    
    // Waste Collection
    waste_collection_title: 'අපද්‍රව්‍ය එකතු කිරීම',
    collection_overview_title: 'එකතු කිරීම් දළ විශ්ලේෂණය',
    collection_overview_desc: 'ඔබගේ සැලසුම් කර ඇති අපද්‍රව්‍ය එකතු කිරීම් කළමනාකරණය කර සම්පූර්ණ කර ඇති එකතු කිරීම් ගණනය කරන්න',
    upcoming_collections: 'ඉදිරි එකතු කිරීම්',
    recent_collections: 'මෑත එකතු කිරීම්',
    schedule_collection_title: 'එකතු කිරීම් සැලසුම් කරන්න',
    select_date: 'දිනය තෝරන්න',
    waste_type: 'අපද්‍රව්‍ය වර්ගය',
    schedule_button: 'සැලසුම් කරන්න',
    cancel_button: 'අවලංගු කරන්න',
    
    // Waste Types
    waste_type_general: 'සාමාන්‍ය අපද්‍රව්‍ය',
    waste_type_recyclables: 'නැවත භාවිතයට',
    waste_type_organic: 'ජෛව අපද්‍රව්‍ය',
    waste_type_hazardous: 'අනතුරුදායක අපද්‍රව්‍ය',
    waste_type_electronics: 'ඉලෙක්ට්‍රොනික අපද්‍රව්‍ය',
    
    // Time
    tomorrow: 'හෙට',
    friday: 'සිකුරාදා',
    next_monday: 'ඉදිරි සඳුදා',
    yesterday: 'ඊයේ',
    last_week: 'පසුගිය සතිය',
    am: 'පෙ.ව',
    pm: 'ප.ව',
    
    // Notes
    paper_plastic_glass: 'කඩදාසි, ප්ලාස්ටික සහ වීදුරු භාණ්ඩ',
    food_waste_garden: 'ආහාර අපද්‍රව්‍ය සහ උද්‍යාන කප්පාදු',
    old_phones_laptops: 'පරණ දුරකථන, ලැප්ටොප් සහ ඉලෙක්ට්‍රොනික භාණ්ඩ',
    paint_and_chemicals: 'තීන්ත සහ රසායනික අපද්‍රව්‍ය',
    
    // Icons
    icon_check: 'පරීක්ෂා කරන්න',
    icon_info: 'තොරතුරු',
    
    // Auth
    login: 'පිවිසෙන්න',
    email: 'විද්‍යුත් තැපෑල',
    password: 'මුරපදය',
    continue_label: 'ඉදිරියට',
    dont_have_account: 'ගිණුමක් නැද්ද?',
    signup: 'ලියාපදිංචි වන්න',
    
    // Onboarding
    onboarding_title: 'EcoGrid වෙත සාදරයෙන් පිළිගනිමු',
    onboarding_subtitle: 'ඔබව තිරසාර අපද්‍රව්‍ය කළමනාකරණය සඳහා ආරම්භ කරමු',
    onboarding_step1_title: 'ඔබගේ භාෂාව තෝරන්න',
    onboarding_step1_desc: 'යෙදුම සඳහා ඔබගේ ප්‍රියතම භාෂාව තෝරන්න',
    onboarding_step2_title: 'ඔබගේ අභිප්‍රේත සකස් කරන්න',
    onboarding_step2_desc: 'ඔබගේ அனுபவத்தை தனிப்பயனாக்குங்கள்',
    onboarding_step3_title: 'සැකසුම සම්පූර්ණ කරන්න',
    onboarding_step3_desc: 'ආරම්භ කිරීමට සූදානම්!',
    next: 'ඉදිරියට',
    previous: 'ආපසු',
    get_started: 'ආරම්භ කරන්න',
    
    // Profile
    profile_title: 'පැතිකඩ',
    edit_profile: 'පැතිකඩ සංස්කරණය කරන්න',
    preferences: 'අභිප්‍රේත',
    notifications: 'දැනුම්දීම්',
    dark_mode: 'අඳුරු ප්‍රකාරය',
    language: 'භාෂාව',
    logout: 'පිටවීම',
    save: 'සුරැකින්න',
    cancel: 'අවලංගු කරන්න',
    
    // Recycling Guide
    recycling_guide_title: 'නැවත භාවිතය මාර්ගෝපදේශ',
    search_placeholder: 'නැවත භාවිතය උපදේශන සොයන්න...',
    categories: 'වර්ග',
    tips: 'උපදේශන',
    learn_more: 'තවත් දැනගන්න',
    
    // Stats
    total_collections: 'මුළු එකතු කිරීම්',
    total_recycled: 'මුළු නැවත භාවිතයට',
    current_streak: 'වර්තමාන අඛණ්ඩතාව',
    monthly_stats: 'මාසික සංඛ්‍යාලේඛන',
    
    // Admin Dashboard
    adminDashboard: 'පරිපාලක උපකරණ පුවරුව',
    managementDashboard: 'කළමනාකරණ උපකරණ පුවරුව',
    driverDashboard: 'රියැදුරු උපකරණ පුවරුව',
    adminDashboardWelcome: 'නැවත සාදරයෙන් පිළිගනිමු! අද අපද්‍රව්‍ය කළමනාකරණය සම්බන්ධයෙන් සිදුවන්නේ මෙයයි.',
    totalUsers: 'මුළු පරිශීලකයින්',
    activeCollections: 'සක්‍රිය එකතු කිරීම්',
    completedToday: 'අද සම්පූර්ණ කරන ලද',
    pendingApprovals: 'පොරොත්තු අනුමත කිරීම්',
    quickActions: 'ක්ෂණික ක්‍රියා',
    scheduleCollection: 'එකතු කිරීම් සැලසුම් කරන්න',
    manageUsers: 'පරිශීලකයින් කළමනාකරණය කරන්න',
    viewReports: 'වාර්තා බලන්න',
    todaysSchedule: 'අදගේ කාලසටහන',
    downtownRoute: 'නගර මධ්‍යම මාර්ගය',
    suburbanRoute: 'උපනගර මාර්ගය',
    systemStatus: 'පද්ධති තත්වය',
    database: 'දත්ත ගබඩාව',
    apiServices: 'API සේවා',
    online: 'අන්තර්ජාලයේ',
    recentCollections: 'මෑත එකතු කිරීම්',
    user: 'පරිශීලකයා',
    date: 'දිනය',
    status: 'තත්වය',
    location: 'ස්ථානය',
    
    // Edit Profile
    editProfileDescription: 'ඔබගේ පුද්ගලික තොරතුරු සහ පැතිකඩ රූපය යාවත්කාලීන කරන්න',
    changeProfilePicture: 'පැතිකඩ රූපය වෙනස් කරන්න',
    changePhoto: 'ඡායාරූපය වෙනස් කරන්න',
    removeNewPhoto: 'නව ඡායාරූපය ඉවත් කරන්න',
    fullName: 'සම්පූර්ණ නම',
    emailAddress: 'විද්‍යුත් තැපෑල',
    phoneNumber: 'දුරකථන අංකය',
    address: 'ලිපිනය',
    enterFullName: 'ඔබගේ සම්පූර්ණ නම ඇතුළත් කරන්න',
    enterEmailAddress: 'ඔබගේ විද්‍යුත් තැපෑල ඇතුළත් කරන්න',
    enterPhoneNumberOptional: 'ඔබගේ දුරකථන අංකය ඇතුළත් කරන්න (විකල්ප)',
    enterAddressOptional: 'ඔබගේ ලිපිනය ඇතුළත් කරන්න (විකල්ප)',
    changePassword: 'මුරපදය වෙනස් කරන්න',
    currentPassword: 'වර්තමාන මුරපදය',
    newPassword: 'නව මුරපදය',
    confirmNewPassword: 'නව මුරපදය තහවුරු කරන්න',
    enterCurrentPassword: 'වර්තමාන මුරපදය ඇතුළත් කරන්න',
    enterNewPasswordMin6: 'නව මුරපදය ඇතුළත් කරන්න (අවම අකුරු 6)',
    updatePassword: 'මුරපදය යාවත්කාලීන කරන්න',
    saveChanges: 'වෙනස්කම් සුරැකින්න',
    saving: 'සුරැකෙමින්',
    
    // Report Feature
    nav_report: 'වාර්තා කරන්න',
    reportIllegalDumping: 'නීතිවිරෝධී අපද්‍රව්‍ය එකතු කිරීම වාර්තා කරන්න',
    reportDescription: 'නීතිවිරෝධී අපද්‍රව්‍ය බැහැර කිරීම වාර්තා කිරීමෙන් මහනුවර පිරිසිදුව තබා ගැනීමට උදව් කරන්න',
    selectLocation: 'ස්ථානය තෝරන්න',
    clickOnMap: 'නිවැරදි ස්ථානය සටහන් කිරීමට සිතියම මත ක්ලික් කරන්න',
    reportTitle: 'වාර්තා මාතෘකාව',
    enterReportTitle: 'ඔබගේ වාර්තාව සඳහා විස්තරාත්මක මාතෘකාවක් ඇතුළත් කරන්න',
    description: 'විස්තර',
    describeIllegalDumping: 'ඔබ සොයාගත් දේ විස්තර කර අමතර විස්තර ඇතුළත් කරන්න',
    severity: 'දරුණු තත්වය',
    lowSeverity: 'අඩු - කුඩා කසළ එකතු කිරීම',
    mediumSeverity: 'මධ්‍යම - මධ්‍යස්ථ අපද්‍රව්‍ය එකතුව',
    highSeverity: 'ඉහළ - විශාල අපද්‍රව්‍ය ගොනු',
    criticalSeverity: 'විශ්වාසනීය - අනතුරුදායක ද්‍රව්‍ය',
    uploadImage: 'රූපය උඩුගත කරන්න',
    clickToUpload: 'රූපය උඩුගත කිරීමට ක්ලික් කරන්න',
    maxFileSize: 'උපරිම ගොනු ප්‍රමාණය: 5MB',
    submitReport: 'වාර්තාව ඉදිරිපත් කරන්න',
    submitting: 'ඉදිරිපත් කරමින්',
    
    // Reports Dashboard
    reportsDashboard: 'වාර්තා උපකරණ පුවරුව',
    manageIllegalDumpingReports: 'නීතිවිරෝධී අපද්‍රව්‍ය එකතු කිරීම් වාර්තා කළමනාකරණය කර විසඳුම් ප්‍රගතිය ගණනය කරන්න',
    totalReports: 'මුළු වාර්තා',
    pendingReports: 'පොරොත්තු වාර්තා',
    criticalReports: 'විශ්වාසනීය වාර්තා',
    resolvedToday: 'අද විසඳන ලද',
    searchReports: 'වාර්තා සොයන්න...',
    allStatuses: 'සියලුම තත්වයන්',
    allSeverities: 'සියලුම දරුණු තත්වයන්',
    pending: 'පොරොත්තු',
    underReview: 'සමාලෝචනය යටතේ',
    inProgress: 'ප්‍රගතියෙහි',
    resolved: 'විසඳන ලද',
    rejected: 'ප්‍රතික්ෂේප කරන ලද',
    report: 'වාර්තාව',
    reporter: 'වාර්තාකරු',
    location: 'ස්ථානය',
    severity: 'දරුණු තත්වය',
    status: 'තත්වය',
    date: 'දිනය',
    actions: 'ක්‍රියා',
    noReportsFound: 'වාර්තා හමු නොවීය',
    showing: 'පෙන්වමින්',
    of: 'ය',
    reports: 'වාර්තා',
    previous: 'පෙර',
    next: 'ඊළඟ',
    
    // Report Feature
    reportTitle: 'නීති විරෝධී අපද්‍රව්‍ය බැහැර කිරීම වාර්තා කරන්න',
    reportDescription: 'නීති විරෝධී අපද්‍රව්‍ය බැහැර කිරීම වාර්තා කිරීමෙන් මහනුවර පිරිසිදුව තබා ගැනීමට උදව් කරන්න',
    selectLocation: 'ස්ථානය තෝරන්න',
    uploadImage: 'රූපය උඩුගත කරන්න',
    description: 'විස්තර',
    enterDescription: 'නීති විරෝධී අපද්‍රව්‍ය බැහැර කිරීම පිළිබඳ විස්තරාත්මක විස්තරයක් ඇතුළත් කරන්න...',
    submitReport: 'වාර්තාව ඉදිරිපත් කරන්න',
    reportSubmitted: 'වාර්තාව සාර්ථකව ඉදිරිපත් කරන ලදී!',
    locationRequired: 'කරුණාකර සිතියමේ ස්ථානයක් තෝරන්න',
    imageRequired: 'කරුණාකර නීති විරෝධී අපද්‍රව්‍ය බැහැර කිරීමේ රූපයක් උඩුගත කරන්න',
    descriptionRequired: 'කරුණාකර විස්තරයක් සපයන්න',
    kandyArea: 'මහනුවර ප්‍රදේශය',
    clickToPin: 'ස්ථානය සටහන් කිරීමට සිතියම මත ක්ලික් කරන්න',
    dragToMove: 'සිතියම ගෙනයාමට ඇද දමන්න',
    zoomInOut: 'විශාලනය කිරීමට/කුඩා කිරීමට මූසික රෝදය භාවිතා කරන්න'
  },
  
  ta: {
    // Navigation
    nav_dashboard: 'டாஷ்போர்டு',
    nav_collection: 'சேகரிப்பு',
    nav_composting: 'குப்பை உரம்',
    nav_tasks: 'பணிகள்',
    nav_report: 'அறிக்கை',
    nav_profile: 'சுயவிவரம்',
    nav_preferences: 'விருப்பங்கள்',
    
    // Common
    welcome_title: 'EcoGrid க்கு வரவேற்கிறோம்',
    welcome_subtitle: 'உங்கள் நிலைத்த கழிவு மேலாண்மை துணையாளர்',
    collections: 'சேகரிப்புகள்',
    recycled: 'மறுசுழற்சி',
    waste_collection: 'கழிவு சேகரிப்பு',
    waste_collection_desc: 'கழிவு எடுப்புகளை திட்டமிட்டு மேலாண்மை செய்யுங்கள்',
    recycling_guide: 'மறுசுழற்சி வழிகாட்டி',
    recycling_guide_desc: 'சரியான மறுசுழற்சி பற்றி அறியுங்கள்',
    profile: 'சுயவிவரம்',
    profile_desc: 'உங்கள் கணக்கு அமைப்புகளை மேலாண்மை செய்யுங்கள்',
    history: 'வரலாறு',
    history_desc: 'கடந்த சேகரிப்புகளை பாருங்கள்',
    
    // Waste Collection
    waste_collection_title: 'கழிவு சேகரிப்பு',
    collection_overview_title: 'சேகரிப்பு கண்ணோட்டம்',
    collection_overview_desc: 'உங்கள் திட்டமிடப்பட்ட கழிவு எடுப்புகளை மேலாண்மை செய்து முடிக்கப்பட்ட சேகரிப்புகளை கண்காணிக்கவும்',
    upcoming_collections: 'வரவிருக்கும் சேகரிப்புகள்',
    recent_collections: 'சமீபத்திய சேகரிப்புகள்',
    schedule_collection_title: 'சேகரிப்பை திட்டமிடுங்கள்',
    select_date: 'தேதியைத் தேர்ந்தெடுக்கவும்',
    waste_type: 'கழிவு வகை',
    schedule_button: 'திட்டமிடு',
    cancel_button: 'ரத்து செய்',
    
    // Waste Types
    waste_type_general: 'பொதுக் கழிவு',
    waste_type_recyclables: 'மறுசுழற்சிக்கூடிய',
    waste_type_organic: 'உயிரியல் கழிவு',
    waste_type_hazardous: 'அபாயகரமான கழிவு',
    waste_type_electronics: 'மின்சாதனங்கள்',
    
    // Time
    tomorrow: 'நாளை',
    friday: 'வெள்ளி',
    next_monday: 'அடுத்த திங்கள்',
    yesterday: 'நேற்று',
    last_week: 'கடந்த வாரம்',
    am: 'காலை',
    pm: 'மாலை',
    
    // Notes
    paper_plastic_glass: 'காகிதம், பிளாஸ்டிக் மற்றும் கண்ணாடி பொருட்கள்',
    food_waste_garden: 'உணவு கழிவு மற்றும் தோட்ட குப்பைகள்',
    old_phones_laptops: 'பழைய தொலைபேசிகள், லேப்டாப்கள் மற்றும் மின்சாதனங்கள்',
    paint_and_chemicals: 'வண்ணப்பூச்சு மற்றும் இரசாயன கழிவு',
    
    // Icons
    icon_check: 'சரிபார்க்கவும்',
    icon_info: 'தகவல்',
    
    // Auth
    login: 'உள்நுழையவும்',
    email: 'மின்னஞ்சல்',
    password: 'கடவுச்சொல்',
    continue_label: 'தொடரவும்',
    dont_have_account: 'கணக்கு இல்லையா?',
    signup: 'பதிவு செய்யவும்',
    
    // Onboarding
    onboarding_title: 'EcoGrid க்கு வரவேற்கிறோம்',
    onboarding_subtitle: 'நிலைத்த கழிவு மேலாண்மையுடன் உங்களைத் தொடங்குவோம்',
    onboarding_step1_title: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்',
    onboarding_step1_desc: 'பயன்பாட்டிற்கான உங்கள் விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்',
    onboarding_step2_title: 'உங்கள் விருப்பங்களை அமைக்கவும்',
    onboarding_step2_desc: 'உங்கள் அனுபவத்தை தனிப்பயனாக்குங்கள்',
    onboarding_step3_title: 'அமைப்பை முடிக்கவும்',
    onboarding_step3_desc: 'தொடங்க தயாராக உள்ளீர்கள்!',
    next: 'அடுத்து',
    previous: 'முந்தைய',
    get_started: 'தொடங்குங்கள்',
    
    // Profile
    profile_title: 'சுயவிவரம்',
    edit_profile: 'சுயவிவரத்தைத் திருத்தவும்',
    preferences: 'விருப்பங்கள்',
    notifications: 'அறிவிப்புகள்',
    dark_mode: 'இருள் பயன்முறை',
    language: 'மொழி',
    logout: 'வெளியேறு',
    save: 'சேமி',
    cancel: 'ரத்து செய்',
    
    // Recycling Guide
    recycling_guide_title: 'மறுசுழற்சி வழிகாட்டி',
    search_placeholder: 'மறுசுழற்சி குறிப்புகளைத் தேடுங்கள்...',
    categories: 'வகைகள்',
    tips: 'குறிப்புகள்',
    learn_more: 'மேலும் அறியுங்கள்',
    
    // Stats
    total_collections: 'மொத்த சேகரிப்புகள்',
    total_recycled: 'மொத்த மறுசுழற்சி',
    current_streak: 'தற்போதைய தொடர்ச்சி',
    monthly_stats: 'மாதாந்திர புள்ளிவிவரங்கள்',
    
    // Admin Dashboard
    adminDashboard: 'நிர்வாக டாஷ்போர்டு',
    managementDashboard: 'மேலாண்மை டாஷ்போர்டு',
    driverDashboard: 'ஓட்டுநர் டாஷ்போர்டு',
    adminDashboardWelcome: 'மீண்டும் வரவேற்கிறோம்! இன்று கழிவு மேலாண்மையில் என்ன நடக்கிறது என்பதை இங்கே காணலாம்.',
    totalUsers: 'மொத்த பயனர்கள்',
    activeCollections: 'செயலில் உள்ள சேகரிப்புகள்',
    completedToday: 'இன்று முடிக்கப்பட்டது',
    pendingApprovals: 'நிலுவையில் உள்ள ஒப்புகைகள்',
    quickActions: 'விரைவு செயல்கள்',
    scheduleCollection: 'சேகரிப்பை திட்டமிடுங்கள்',
    manageUsers: 'பயனர்களை மேலாண்மை செய்யுங்கள்',
    viewReports: 'அறிக்கைகளை பாருங்கள்',
    todaysSchedule: 'இன்றைய அட்டவணை',
    downtownRoute: 'நகர மைய பாதை',
    suburbanRoute: 'புறநகர பாதை',
    systemStatus: 'சிஸ்டம் நிலை',
    database: 'தரவுத்தளம்',
    apiServices: 'API சேவைகள்',
    online: 'ஆன்லைன்',
    recentCollections: 'சமீபத்திய சேகரிப்புகள்',
    user: 'பயனர்',
    date: 'தேதி',
    status: 'நிலை',
    location: 'இடம்',
    
    // Edit Profile
    editProfileDescription: 'உங்கள் தனிப்பட்ட தகவல்கள் மற்றும் சுயவிவர படத்தை புதுப்பிக்கவும்',
    changeProfilePicture: 'சுயவிவர படத்தை மாற்றவும்',
    changePhoto: 'படத்தை மாற்றவும்',
    removeNewPhoto: 'புதிய படத்தை அகற்றவும்',
    fullName: 'முழு பெயர்',
    emailAddress: 'மின்னஞ்சல் முகவரி',
    phoneNumber: 'தொலைபேசி எண்',
    address: 'முகவரி',
    enterFullName: 'உங்கள் முழு பெயரை உள்ளிடவும்',
    enterEmailAddress: 'உங்கள் மின்னஞ்சல் முகவரியை உள்ளிடவும்',
    enterPhoneNumberOptional: 'உங்கள் தொலைபேசி எண்ணை உள்ளிடவும் (விருப்பம்)',
    enterAddressOptional: 'உங்கள் முகவரியை உள்ளிடவும் (விருப்பம்)',
    changePassword: 'கடவுச்சொல்லை மாற்றவும்',
    currentPassword: 'தற்போதைய கடவுச்சொல்',
    newPassword: 'புதிய கடவுச்சொல்',
    confirmNewPassword: 'புதிய கடவுச்சொல்லை உறுதிப்படுத்தவும்',
    enterCurrentPassword: 'தற்போதைய கடவுச்சொல்லை உள்ளிடவும்',
    enterNewPasswordMin6: 'புதிய கடவுச்சொல்லை உள்ளிடவும் (குறைந்தபட்சம் 6 எழுத்துக்கள்)',
    updatePassword: 'கடவுச்சொல்லை புதுப்பிக்கவும்',
    saveChanges: 'மாற்றங்களை சேமிக்கவும்',
    saving: 'சேமிக்கிறது',
    
    // Report Feature
    nav_report: 'அறிக்கை',
    reportIllegalDumping: 'சட்டவிரோத குப்பை குவிப்பை அறிக்கையிடுங்கள்',
    reportDescription: 'சட்டவிரோத கழிவு அகற்றலை அறிக்கையிடுவதன் மூலம் கண்டியை சுத்தமாக வைத்திருக்க உதவுங்கள்',
    selectLocation: 'இடத்தைத் தேர்ந்தெடுக்கவும்',
    clickOnMap: 'சரியான இடத்தை குறிக்க வரைபடத்தில் கிளிக் செய்யவும்',
    reportTitle: 'அறிக்கை தலைப்பு',
    enterReportTitle: 'உங்கள் அறிக்கைக்கு விளக்கமான தலைப்பை உள்ளிடவும்',
    description: 'விளக்கம்',
    describeIllegalDumping: 'நீங்கள் கண்டதை விவரித்து கூடுதல் விவரங்களை சேர்க்கவும்',
    severity: 'கடுமை நிலை',
    lowSeverity: 'குறைந்த - சிறிய குப்பை',
    mediumSeverity: 'நடுத்தர - மிதமான கழிவு குவிப்பு',
    highSeverity: 'உயர் - பெரிய கழிவு குவியல்கள்',
    criticalSeverity: 'முக்கியமான - ஆபத்தான பொருட்கள்',
    uploadImage: 'படத்தை பதிவேற்றவும்',
    clickToUpload: 'படத்தை பதிவேற்ற கிளிக் செய்யவும்',
    maxFileSize: 'அதிகபட்ச கோப்பு அளவு: 5MB',
    submitReport: 'அறிக்கையை சமர்ப்பிக்கவும்',
    submitting: 'சமர்ப்பிக்கிறது',
    
    // Reports Dashboard
    reportsDashboard: 'அறிக்கைகள் டாஷ்போர்டு',
    manageIllegalDumpingReports: 'சட்டவிரோத குப்பை குவிப்பு அறிக்கைகளை நிர்வகித்து தீர்வு முன்னேற்றத்தை கண்காணிக்கவும்',
    totalReports: 'மொத்த அறிக்கைகள்',
    pendingReports: 'நிலுவையில் உள்ள அறிக்கைகள்',
    criticalReports: 'முக்கியமான அறிக்கைகள்',
    resolvedToday: 'இன்று தீர்க்கப்பட்டது',
    searchReports: 'அறிக்கைகளைத் தேடுங்கள்...',
    allStatuses: 'அனைத்து நிலைகளும்',
    allSeverities: 'அனைத்து கடுமைகளும்',
    pending: 'நிலுவையில்',
    underReview: 'மதிப்பாய்வில்',
    inProgress: 'முன்னேற்றத்தில்',
    resolved: 'தீர்க்கப்பட்டது',
    rejected: 'நிராகரிக்கப்பட்டது',
    report: 'அறிக்கை',
    reporter: 'அறிக்கையாளர்',
    location: 'இடம்',
    severity: 'கடுமை',
    status: 'நிலை',
    date: 'தேதி',
    actions: 'செயல்கள்',
    noReportsFound: 'அறிக்கைகள் எதுவும் கிடைக்கவில்லை',
    showing: 'காட்டுகிறது',
    of: 'இல்',
    reports: 'அறிக்கைகள்',
    previous: 'முந்தைய',
    next: 'அடுத்து',
    
    // Report Feature
    reportTitle: 'சட்டவிரோத குப்பை கிடத்தலை அறிக்கையிடுங்கள்',
    reportDescription: 'சட்டவிரோத கழிவு அகற்றலை அறிக்கையிடுவதன் மூலம் கண்டியை சுத்தமாக வைத்திருக்க உதவுங்கள்',
    selectLocation: 'இடத்தைத் தேர்ந்தெடுக்கவும்',
    uploadImage: 'படத்தை பதிவேற்றவும்',
    description: 'விளக்கம்',
    enterDescription: 'சட்டவிரோத குப்பை கிடத்தல் பற்றிய விரிவான விளக்கத்தை உள்ளிடவும்...',
    submitReport: 'அறிக்கையை சமர்ப்பிக்கவும்',
    reportSubmitted: 'அறிக்கை வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!',
    locationRequired: 'வரைபடத்தில் ஒரு இடத்தைத் தேர்ந்தெடுக்கவும்',
    imageRequired: 'சட்டவிரோத குப்பை கிடத்தலின் படத்தை பதிவேற்றவும்',
    descriptionRequired: 'விளக்கத்தை வழங்கவும்',
    kandyArea: 'கண்டி பகுதி',
    clickToPin: 'இடத்தை பின் செய்ய வரைபடத்தில் கிளிக் செய்யவும்',
    dragToMove: 'வரைபடத்தை நகர்த்த இழுக்கவும்',
    zoomInOut: 'உருப்பெருக்க/சிறிதாக்க சுட்டி சக்கரத்தைப் பயன்படுத்தவும்'
  }
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', currentLanguage);
  }, [currentLanguage]);

  const getString = (key) => {
    return localizedStrings[currentLanguage]?.[key] || localizedStrings.en[key] || key;
  };

  const changeLanguage = (languageCode) => {
    if (languages[languageCode]) {
      setCurrentLanguage(languageCode);
    }
  };

  const value = {
    currentLanguage,
    languages,
    getString,
    changeLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

