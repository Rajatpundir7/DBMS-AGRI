#!/bin/bash

echo "========================================"
echo " Kisan Sewa Kendra - Project Starter"
echo "========================================"
echo ""

# Check MongoDB
echo "[1/4] Checking MongoDB..."
if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB is running"
else
    echo "⚠️  MongoDB is not running"
    echo "   Please start MongoDB first:"
    echo "   Linux: sudo systemctl start mongod"
    echo "   Mac: brew services start mongodb-community"
    read -p "Press enter to continue anyway..."
fi

# Setup Backend
echo ""
echo "[2/4] Setting up Backend..."
cd backend

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Backend installation failed"
        exit 1
    fi
fi

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kisan-sewa-kendra
JWT_SECRET=kisan-sewa-kendra-secret-key-2024
NODE_ENV=development
EOF
fi

echo "Seeding database..."
npm run seed || echo "⚠️  Seeding failed (may already be seeded)"

echo "Creating admin user..."
npm run create-admin admin@kisan.com admin123 "Admin User" || echo "⚠️  Admin creation failed (may already exist)"

# Setup Frontend
echo ""
echo "[3/4] Setting up Frontend..."
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Frontend installation failed"
        exit 1
    fi
fi

# Start Servers
echo ""
echo "[4/4] Starting Servers..."
echo ""
echo "✅ Setup Complete!"
echo ""
echo "🚀 Starting Backend Server..."
cd ../backend
npm start &
BACKEND_PID=$!

sleep 3

echo "🚀 Starting Frontend Server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo " ✅ All servers starting!"
echo "========================================"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:5000"
echo ""
echo "🔑 Admin Login:"
echo "   Email: admin@kisan.com"
echo "   Password: admin123"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait

