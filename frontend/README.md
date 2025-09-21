# Staff Management System - Frontend

This is the React frontend for the Staff Management System built with modern React hooks and functional components.

## Features

- **Responsive Design**: Mobile-friendly interface with green & white theme
- **CRUD Operations**: Complete Create, Read, Update, Delete functionality
- **Modern UI**: Clean, professional interface with status badges and action buttons
- **Navigation**: React Router for seamless page navigation
- **Form Validation**: Comprehensive form validation and error handling
- **Real-time Updates**: Immediate UI updates after operations

## Components

### Core Components
- **StaffList**: Displays all staff members in a table format with edit/delete actions
- **AddStaff**: Comprehensive form to add new staff members
- **EditStaff**: Form to update existing staff member information
- **StaffDetails**: Detailed view of a specific staff member with calculated fields

### Features
- **Status Badges**: Visual indicators for employment status
- **Action Buttons**: Edit, Delete, and View actions for each staff member
- **Responsive Tables**: Mobile-friendly table layout
- **Form Validation**: Required field validation and error display
- **Loading States**: Spinner and loading indicators
- **Error Handling**: User-friendly error messages and retry options

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Dependencies

- **React 18**: Modern React with hooks
- **React Router DOM**: Client-side routing
- **Axios**: HTTP client for API calls
- **CSS3**: Custom styling with green & white theme

## API Integration

The frontend communicates with the backend API at `http://localhost:5000` and includes:
- Staff listing and search
- Staff creation and updates
- Staff deletion with confirmation
- Detailed staff information display

## Styling

The application uses a custom CSS framework with:
- **Green Theme**: Primary color #28a745 for EcoGrid branding
- **White Backgrounds**: Clean, professional appearance
- **Responsive Grid**: CSS Grid and Flexbox for layout
- **Status Badges**: Color-coded employment status indicators
- **Hover Effects**: Interactive button and table row effects

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

The application is built with modern React practices:
- Functional components with hooks
- Custom CSS for styling
- Responsive design principles
- Error boundary handling
- Loading state management
