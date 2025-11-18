@echo off
echo ========================================
echo  Kisan Sewa Kendra - Final Start
echo ========================================
echo.

echo [1/5] Checking MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ MongoDB is running
) else (
    echo ⚠️  MongoDB is not running
    echo    Please start MongoDB first
    pause
    exit /b 1
)

echo.
echo [2/5] Installing backend dependencies...
cd backend
if not exist node_modules (
    call npm install
)

echo.
echo [3/5] Installing frontend dependencies...
cd ..\frontend
if not exist node_modules (
    call npm install
)

echo.
echo [4/5] Starting Backend Server...
cd ..\backend
start "Backend Server" cmd /k "cd /d %CD% && echo === BACKEND SERVER === && echo Starting on http://localhost:5000 && npm start"

timeout /t 3 /nobreak >nul

echo.
echo [5/5] Starting Frontend Server...
cd ..\frontend
start "Frontend Server" cmd /k "cd /d %CD% && echo === FRONTEND SERVER === && echo Starting on http://localhost:3000 && npm start"

echo.
echo ========================================
echo  ✅ ALL SERVERS STARTING!
echo ========================================
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:5000
echo.
echo 🔑 Admin Login:
echo    Email: admin@kisan.com
echo    Password: admin123
echo.
echo 🎯 Features Available:
echo    - Gemini AI Diagnosis (Hinglish)
echo    - Weather Information
echo    - Mandi Prices
echo    - Product Images
echo    - Disease Images (RAG)
echo.
echo ⏳ Wait for servers to start...
echo    Backend: Look for "MongoDB Connected"
echo    Frontend: Look for "Compiled successfully!"
echo.
pause

