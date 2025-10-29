#!/bin/bash

# Deployment script

set -e

echo "🚀 Deploying Task Manager Backend..."

# Check if environment variables are set
if [ -z "$NODE_ENV" ]; then
  echo "❌ NODE_ENV is not set"
  exit 1
fi

if [ -z "$MONGODB_URI" ]; then
  echo "❌ MONGODB_URI is not set"
  exit 1
fi

# Build the application
./scripts/build.sh

# Run database migrations (if any)
echo "🗄️  Running database setup..."
node dist/scripts/dbSetup.js

# Start the application
echo "🎯 Starting application..."
if [ "$NODE_ENV" = "production" ]; then
  # Use PM2 for production
  pm2 start ecosystem.config.js --env production
else
  node dist/server.js
fi

echo "✅ Deployment completed!"
