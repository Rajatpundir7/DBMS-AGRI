#!/bin/bash

echo "🌾 Kisan Sewa Kendra - Quick Start"
echo "===================================="
echo ""

# Check if MongoDB is running
echo "📦 Checking MongoDB..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "   Linux: sudo systemctl start mongod"
    echo "   Mac: brew services start mongodb-community"
    exit 1
fi
echo "✅ MongoDB is running"
echo ""

# Backend setup
echo "🔧 Setting up backend..."
cd backend

if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kisan-sewa-kendra
JWT_SECRET=kisan-sewa-kendra-secret-key-$(date +%s)
NODE_ENV=development
EOF
    echo "✅ Created .env file"
fi

if [ ! -d node_modules ]; then
    echo "📦 Installing backend dependencies..."
    npm install
    echo "✅ Backend dependencies installed"
fi

echo "🌱 Seeding database..."
npm run seed

echo "👤 Creating admin user..."
npm run create-admin admin@kisan.com admin123 "Admin User"

echo "✅ Backend setup complete!"
echo ""

# Frontend setup
echo "🎨 Setting up frontend..."
cd ../frontend

if [ ! -d node_modules ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
    echo "✅ Frontend dependencies installed"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the application:"
echo "   1. Terminal 1: cd backend && npm start"
echo "   2. Terminal 2: cd frontend && npm start"
echo ""
echo "📱 Access the app at: http://localhost:3000"
echo "🔑 Admin login: admin@kisan.com / admin123"
echo ""

