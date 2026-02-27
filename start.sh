#!/bin/bash
# ClaudeGO Startup Script
# Default Port: 3000

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Default port
PORT=${1:-3000}

# Kill any existing process on the port
sudo lsof -t -i:$PORT | xargs -r kill -9 2>/dev/null

echo "Starting ClaudeGO on port $PORT..."
PORT=$PORT npm start > "$SCRIPT_DIR/claudego.log" 2>&1 &
MAIN_PID=$!

sleep 2

echo ""
echo "==================================="
echo "ClaudeGO Started:"
echo "  Port: $PORT"
echo "  PID: $MAIN_PID"
echo "  URL: http://localhost:$PORT"
echo "==================================="
echo ""
echo "Log file: $SCRIPT_DIR/claudego.log"
echo ""
echo "To stop: kill $MAIN_PID"
