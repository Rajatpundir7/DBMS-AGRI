@echo off
echo ========================================
echo  Kisan Sewa Kendra - Project Starter
echo ========================================
echo.

echo [1/4] Checking MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ MongoDB is running
) else (
    echo ⚠️  MongoDB is not running
    echo    Please start MongoDB first
    echo    Or install MongoDB and start the service
    pause
    exit /b 1
)

echo.
echo [2/4] Setting up Backend...
cd backend

if not exist node_modules (
    echo Installing backend dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ Backend installation failed
        pause
        exit /b 1
    )
)

if not exist .env (
    echo Creating .env file...
    (
        echo PORT=5000
        echo MONGODB_URI=mongodb://localhost:27017/kisan-sewa-kendra
        echo JWT_SECRET=kisan-sewa-kendra-secret-key-2024
        echo NODE_ENV=development
    ) > .env
)

echo Seeding database...
call npm run seed
if errorlevel 1 (
    echo ⚠️  Seeding failed (may already be seeded)
)

echo Creating admin user...
call npm run create-admin admin@kisan.com admin123 "Admin User"
if errorlevel 1 (
    echo ⚠️  Admin creation failed (may already exist)
)

echo.
echo [3/4] Setting up Frontend...
cd ..\frontend

if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ Frontend installation failed
        pause
        exit /b 1
    )
)

echo.
echo [4/4] Starting Servers...
echo.
echo ✅ Setup Complete!
echo.
echo 🚀 Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak >nul

echo 🚀 Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo  ✅ All servers starting!
echo ========================================
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:5000
echo.
echo 🔑 Admin Login:
echo    Email: admin@kisan.com
echo    Password: admin123
echo.
echo Press any key to exit...
pause >nul

