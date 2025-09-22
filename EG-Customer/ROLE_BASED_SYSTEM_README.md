# EcoGrid Dual Authentication System

## Overview
The EcoGrid application now supports a **dual authentication system** with different login methods for different user types:

### User Categories & Authentication Methods

#### **1. Public Users (Email + Password)**
- **User** - Regular consumer users
- **Incinerator** - Incinerator facility operators
- **Signup**: Public signup available
- **Login**: Email + Password

#### **2. Administrative Users (Employee ID + Password)**
- **Admin** - System administrators
- **Manager** - Waste management managers  
- **Truck Driver** - Collection truck drivers
- **Signup**: Admin-created only (no public signup)
- **Login**: Employee ID + Password

## How It Works

### 1. **Dual Login System**
- **Regular Login** (`/login`): Email + Password for User/Incinerator
- **Admin Login** (`/admin-login`): Employee ID + Password for Admin/Manager/Driver
- **Separate Routes**: Different authentication endpoints
- **Unique Identification**: Each user type has distinct login credentials

### 2. **Role-Based Access Control**
- **Public Signup**: Only User & Incinerator roles available
- **Admin Creation**: Admin users can create other admin accounts
- **Automatic Routing**: Users are redirected to appropriate dashboards
- **Secure Access**: Admin accounts require Employee ID authentication

### 3. **User Flow**
```
Onboarding → Choose Access Type → Login/Signup → Role-Based Dashboard
```

## Testing the System

### 1. Create Test Users
Run the following command in the backend directory:
```bash
npm run create-test-users
```

This will create test users with the following credentials:

#### **Admin Users (Login with Employee ID)**
| Role | Employee ID | Password |
|------|-------------|----------|
| Admin | EMP001 | admin123 |
| Manager | EMP002 | manager123 |
| Truck Driver | EMP003 | driver123 |

#### **Regular Users (Login with Email)**
| Role | Email | Password |
|------|-------|----------|
| Incinerator | incinerator@ecogrid.com | incinerator123 |
| Regular User | user@ecogrid.com | user123 |

### 2. Test Different Access Types

#### **Test Admin Access:**
1. Go to `/admin-login`
2. Login with Employee ID + Password
3. Access Admin Dashboard

#### **Test Regular User Access:**
1. Go to `/login` or `/signup`
2. Login/Signup with Email + Password
3. Access Regular Dashboard

### 3. Test Role-Based Redirections
1. Start the backend: `npm run dev` (in backend directory)
2. Start the frontend: `npm start` (in frontend directory)
3. Test different login methods to see role-based redirections

## Technical Implementation

### Backend Changes
- **User Model**: Added `employeeId` field for admin users
- **Dual Authentication**: Separate login routes for different user types
- **Admin Creation**: Route for admins to create other admin accounts
- **Role Validation**: Enhanced role-based access control
- **Employee ID System**: Unique identification for administrative users

### Frontend Changes
- **Dual Login Screens**: Separate interfaces for different user types
- **Onboarding Flow**: Clear choice between regular and admin access
- **Role-Based Routing**: Automatic redirection based on user type
- **Enhanced Security**: Different authentication flows for different roles

### Key Components
- `AdminLoginScreen`: Employee ID + Password authentication
- `LoginScreen`: Email + Password authentication (User/Incinerator)
- `SignupScreen`: Public registration (User/Incinerator only)
- `RoleBasedRedirect`: Automatic role-based routing
- `AdminDashboardScreen`: Administrative interface

## 🆕 New Feature: Illegal Dumping Report System

### Overview
The EcoGrid application now includes a comprehensive **Illegal Dumping Report System** that allows users to report illegal waste disposal with location tracking and image evidence.

### Features

#### **For Regular Users (User/Incinerator)**
- **Report Creation**: Submit illegal dumping reports with images
- **Location Pinning**: Interactive map to pin exact location (Kandy area)
- **Severity Classification**: Choose from Low, Medium, High, or Critical
- **Status Tracking**: Monitor report progress and updates
- **My Reports**: View all submitted reports

#### **For Admin Users (Admin/Manager/Truck Driver)**
- **Reports Dashboard**: Comprehensive view of all reports
- **Status Management**: Update report status (Pending → Under Review → In Progress → Resolved/Rejected)
- **Filtering & Search**: Filter by status, severity, and search terms
- **Statistics**: Real-time overview of report statistics
- **Location Tracking**: View all reported locations on map

### Technical Implementation

#### **Backend**
- **Report Model**: Complete schema with location, images, and status tracking
- **Image Upload**: Multer-based file handling with validation
- **Location Validation**: Ensures reports are within Kandy area bounds
- **Role-Based Access**: Different permissions for different user types
- **Statistics API**: Real-time report statistics and analytics

#### **Frontend**
- **ReportScreen**: Interactive form with map integration and image upload
- **ReportsDashboardScreen**: Admin interface for managing reports
- **Google Maps Integration**: Location pinning and address reverse geocoding
- **Multi-language Support**: Full localization for all report features
- **Dark Mode Support**: Consistent theming across all report components

### Usage

#### **Submitting a Report**
1. Navigate to `/report` (available to User/Incinerator roles)
2. Fill in report details (title, description, severity)
3. Upload image of the illegal dumping
4. Pin location on the interactive map
5. Submit report

#### **Managing Reports (Admin)**
1. Navigate to `/reports-dashboard` (available to Admin/Manager/Truck Driver roles)
2. View all reports with filtering options
3. Update report status as needed
4. Monitor statistics and progress

### API Endpoints

#### **Report Management**
- `POST /api/reports` - Create new report
- `GET /api/reports` - Get all reports (admin only)
- `GET /api/reports/my-reports` - Get user's reports
- `GET /api/reports/:id` - Get specific report
- `PUT /api/reports/:id/status` - Update report status (admin only)
- `DELETE /api/reports/:id` - Delete report (admin only)

#### **Statistics**
- `GET /api/reports/stats/overview` - Get report statistics (admin only)

## Security Features

### **Access Control**
- **Public Signup**: Limited to User & Incinerator roles
- **Admin Creation**: Only existing admins can create admin accounts
- **Employee ID Validation**: Required for Admin/Manager/Driver roles
- **Role-Based Authentication**: Different login methods for different user types

### **Authentication Methods**
- **Regular Users**: Email + Password (standard security)
- **Admin Users**: Employee ID + Password (enhanced security)
- **JWT Tokens**: Include role and user type information
- **Backend Validation**: All permissions verified server-side

## User Experience

### **Onboarding Flow**
1. **Access Type Selection**: Choose between regular user and admin access
2. **Clear Instructions**: Separate paths for different user types
3. **Guided Navigation**: Appropriate forms for each access type
4. **Seamless Routing**: Automatic redirection to correct dashboards

### **Login Experience**
- **Regular Users**: Familiar email + password login
- **Admin Users**: Professional Employee ID + password login
- **Visual Distinction**: Different color schemes and icons
- **Clear Messaging**: Appropriate instructions for each user type

## Future Enhancements
- Role-based API endpoints with enhanced security
- Permission-based feature access
- Custom dashboards for each role
- Role-specific notifications and workflows
- Advanced access control and audit logging
- Multi-factor authentication for admin accounts

## Troubleshooting

### Common Issues
1. **Employee ID not found**: Verify admin user exists in database
2. **Role detection failed**: Check JWT token and user role
3. **Authentication errors**: Verify correct login method for user type
4. **Routing issues**: Ensure RoleBasedRedirect component is working

### Debug Steps
1. Check browser console for authentication errors
2. Verify user role and employee ID in database
3. Check JWT token payload for role information
4. Ensure correct login route is being used
5. Verify backend authentication endpoints are working

## Security Notes
- Employee IDs are unique identifiers for admin users
- Role information is stored in JWT tokens
- Backend validates all permissions and roles
- Admin accounts cannot be created through public signup
- Different authentication methods provide layered security
- Always verify permissions on the backend, not just frontend
