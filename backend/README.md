# Staff Management System - Backend

This is the backend API for the Staff Management System built with Node.js, Express, and MongoDB.

## Features

- **CRUD Operations**: Create, Read, Update, Delete staff members
- **MongoDB Integration**: Uses Mongoose ODM with MongoDB Atlas
- **RESTful API**: Clean REST endpoints for all operations
- **Validation**: Built-in data validation and error handling
- **CORS Enabled**: Cross-origin resource sharing for frontend integration

## API Endpoints

### Staff Management
- `GET /api/staff` - Get all staff members
- `GET /api/staff/:id` - Get staff member by ID
- `POST /api/staff` - Create new staff member
- `PUT /api/staff/:id` - Update staff member
- `DELETE /api/staff/:id` - Delete staff member

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. For development with auto-restart:
   ```bash
   npm run dev
   ```

## Database Configuration

The system connects to MongoDB Atlas with the following details:
- Database: `ecogrid`
- Collection: `staffmodel`
- Username: `deeghayu_db_user`
- Password: `Deeghayu_123`

## Staff Schema

The staff model includes:
- **Core Attributes**: StaffID, FullName, DateOfBirth, Gender, ContactNumbers, Email, Address, NationalID
- **Employment Details**: JobTitle, Department, EmploymentType, DateOfJoining, EmploymentStatus, Supervisor

## Environment

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose ODM
- CORS middleware
