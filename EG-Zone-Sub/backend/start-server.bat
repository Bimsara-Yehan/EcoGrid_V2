@echo off
echo Starting EcoGrid Backend Server...
echo.

REM Check if .env file exists
if not exist .env (
    echo WARNING: .env file not found!
    echo Please create a .env file with your MongoDB connection string
    echo Example:
    echo MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
    echo PORT=5000
    echo.
    pause
)

echo Starting server...
npm start
