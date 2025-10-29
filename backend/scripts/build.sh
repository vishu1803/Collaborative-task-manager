#!/bin/bash

# Production build script

echo "🏗️  Building Task Manager Backend..."

# Clean previous build
rm -rf dist

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Copy necessary files
echo "📁 Copying configuration files..."
cp package.json dist/
cp package-lock.json dist/
cp healthcheck.js dist/

echo "✅ Build completed successfully!"
echo "📂 Build output: ./dist"
