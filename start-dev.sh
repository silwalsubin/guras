#!/bin/bash

# Guras Development Startup Script
# This script starts both the backend API server and the Vue.js client

echo "🚀 Starting Guras Development Environment..."

# Function to cleanup background processes
cleanup() {
    echo "🛑 Stopping development servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start the backend API server
echo "📡 Starting backend API server..."
cd server
dotnet run --project apis &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start the Vue.js client
echo "🎨 Starting Vue.js client..."
cd client
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ Development environment started!"
echo "📡 Backend API: https://localhost:7001"
echo "🎨 Frontend Client: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for background processes
wait
