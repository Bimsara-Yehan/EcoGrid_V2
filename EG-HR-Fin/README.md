# 🌱 EcoGrid Staff Management System

A complete **MERN Stack CRUD Application** for managing staff information in waste management systems. Built with modern technologies and a beautiful green & white theme.

## 🚀 Features

### ✅ Core Functionality
- **Complete CRUD Operations**: Create, Read, Update, Delete staff members
- **Comprehensive Staff Schema**: 20+ fields covering all staff information
- **Real-time Updates**: Immediate UI updates after operations
- **Responsive Design**: Mobile-friendly interface

### 🎨 User Interface
- **Modern Design**: Clean, professional interface
- **Green & White Theme**: Perfect for environmental/waste management systems
- **Status Badges**: Visual employment status indicators
- **Interactive Elements**: Hover effects and smooth transitions

### 🛠 Technical Features
- **MongoDB Atlas Integration**: Cloud database with Mongoose ODM
- **RESTful API**: Clean, well-structured backend endpoints
- **Form Validation**: Comprehensive input validation
- **Error Handling**: User-friendly error messages
- **Loading States**: Professional loading indicators

## 📁 Project Structure

```
ITP/
├── backend/                 # Express.js Server
│   ├── config/
│   │   └── db.js          # MongoDB connection
│   ├── controllers/
│   │   └── staffController.js # CRUD logic
│   ├── models/
│   │   └── Staff.js       # Mongoose schema
│   ├── routes/
│   │   └── staffRoutes.js # API endpoints
│   ├── server.js          # Main server file
│   └── package.json       # Backend dependencies
│
└── frontend/               # React Application
    ├── public/
    │   └── index.html     # Main HTML file
    ├── src/
    │   ├── components/    # React components
    │   │   ├── StaffList.jsx      # Staff listing
    │   │   ├── AddStaff.jsx       # Add staff form
    │   │   ├── EditStaff.jsx      # Edit staff form
    │   │   └── StaffDetails.jsx   # Staff details view
    │   ├── App.js         # Main app component
    │   ├── App.css        # Styling
    │   └── index.js       # App entry point
    └── package.json       # Frontend dependencies
```

## 🗄️ Database Schema

### Staff Model Fields

#### Core Staff Attributes
- **StaffID** (Primary Key - unique identifier)
- **FullName** (FirstName, MiddleName, LastName)
- **DateOfBirth** (Date)
- **Gender** (Male/Female/Other)
- **ContactNumbers** (Array of strings)
- **Email** (Unique string)
- **Address** (PermanentAddress, CurrentAddress)
- **NationalID** (Unique string)

#### Employment Details
- **JobTitle** (String)
- **Department** (String)
- **EmploymentType** (Full-time/Part-time/Contract)
- **DateOfJoining** (Date)
- **EmploymentStatus** (Active/On Leave/Resigned/Retired)
- **Supervisor** (String)

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   # or for development with auto-restart:
   npm run dev
   ```

4. **Server will run on:** `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **App will open in browser at:** `http://localhost:3000`

## 🔌 API Endpoints

### Staff Management
- `GET /api/staff` - Get all staff members
- `GET /api/staff/:id` - Get staff member by ID
- `POST /api/staff` - Create new staff member
- `PUT /api/staff/:id` - Update staff member
- `DELETE /api/staff/:id` - Delete staff member

## 🎯 Key Features

### Staff List View
- **Table Display**: Clean table with all staff information
- **Action Buttons**: Edit, Delete, and View actions
- **Status Indicators**: Color-coded employment status badges
- **Responsive Design**: Mobile-friendly table layout

### Add/Edit Staff Forms
- **Comprehensive Forms**: All staff fields with validation
- **Dynamic Contact Numbers**: Add/remove multiple contact numbers
- **Date Pickers**: Easy date selection for birth and joining
- **Form Validation**: Required field validation and error display

### Staff Details View
- **Complete Information**: All staff details in organized sections
- **Calculated Fields**: Age and tenure calculations
- **Action Buttons**: Quick access to edit and navigation
- **Professional Layout**: Clean, card-based design

## 🎨 Design Theme

The application features a **green and white theme** perfect for:
- **Environmental companies**
- **Waste management systems**
- **Sustainability organizations**
- **Green technology companies**

**Color Palette:**
- Primary Green: `#28a745`
- Secondary Green: `#20c997`
- White: `#ffffff`
- Light Gray: `#f8f9fa`
- Dark Gray: `#333333`

## 🔧 Technologies Used

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB ODM
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - UI library with hooks
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Custom styling framework

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop computers**
- **Tablets**
- **Mobile phones**
- **All modern browsers**

## 🚀 Deployment

### Backend Deployment
- Deploy to Heroku, Railway, or any Node.js hosting
- Set environment variables for MongoDB connection
- Ensure CORS is properly configured

### Frontend Deployment
- Build the production version: `npm run build`
- Deploy to Netlify, Vercel, or any static hosting
- Update API endpoints for production backend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions:
- Check the documentation in each folder
- Review the code comments
- Open an issue on GitHub

---

**Built with ❤️ for EcoGrid Staff Management**
