#!/bin/bash
# Simple script to start a local server for development

echo "Starting local server..."
echo "Open http://localhost:8000 in your browser"
echo "Press Ctrl+C to stop the server"
echo ""

# Try Python 3 first, then Python 2, then Node.js
if command -v python3 &> /dev/null; then
    python3 server.py
elif command -v python &> /dev/null; then
    python server.py
elif command -v node &> /dev/null; then
    npx http-server -p 8000 -c-1
else
    echo "Error: No server found. Please install Python 3 or Node.js"
    echo "Or use: python3 -m http.server 8000"
    exit 1
fi

