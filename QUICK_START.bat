@echo off
echo 🌾 Kisan Sewa Kendra - Quick Start
echo ====================================
echo.

echo 🔧 Setting up backend...
cd backend

if not exist .env (
    echo 📝 Creating .env file...
    (
        echo PORT=5000
        echo MONGODB_URI=mongodb://localhost:27017/kisan-sewa-kendra
        echo JWT_SECRET=kisan-sewa-kendra-secret-key
        echo NODE_ENV=development
    ) > .env
    echo ✅ Created .env file
)

if not exist node_modules (
    echo 📦 Installing backend dependencies...
    call npm install
    echo ✅ Backend dependencies installed
)

echo 🌱 Seeding database...
call npm run seed

echo 👤 Creating admin user...
call npm run create-admin admin@kisan.com admin123 "Admin User"

echo ✅ Backend setup complete!
echo.

echo 🎨 Setting up frontend...
cd ..\frontend

if not exist node_modules (
    echo 📦 Installing frontend dependencies...
    call npm install
    echo ✅ Frontend dependencies installed
)

echo.
echo ✅ Setup complete!
echo.
echo 🚀 To start the application:
echo    1. Terminal 1: cd backend ^&^& npm start
echo    2. Terminal 2: cd frontend ^&^& npm start
echo.
echo 📱 Access the app at: http://localhost:3000
echo 🔑 Admin login: admin@kisan.com / admin123
echo.
pause

