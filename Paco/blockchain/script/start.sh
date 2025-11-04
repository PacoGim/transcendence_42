#!/bin/bash
set -e

# Start Avalanche in background
avalanchego --http-host=127.0.0.1 --network-id=local &
AVAL_PID=$!

# Wait for Avalanche to initialize
echo "Waiting for Avalanche node to start..."
sleep 10

# Start Node.js API (this one keeps container alive)
echo "Starting Node.js API..."
bun --watch srcs/index.ts

# Optional cleanup on exit
kill $AVAL_PID
