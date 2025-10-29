#!/bin/bash

# Performance testing script

echo "🔥 Starting Performance Tests..."

# Check if services are running
if ! curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "❌ Frontend is not running on localhost:3000"
    exit 1
fi

if ! curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "❌ Backend is not running on localhost:5000"
    exit 1
fi

echo "✅ Services are running"

# Test API endpoints performance
echo "🚀 Testing API Performance..."

# Health endpoint
echo "Testing /health endpoint:"
curl -o /dev/null -s -w "Response Time: %{time_total}s | Status: %{http_code}\n" http://localhost:5000/health

# Auth endpoints (need to create test user first)
echo "Testing registration endpoint:"
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Perf Test","email":"perf'$(date +%s)'@test.com","password":"test123"}' \
  -o /dev/null -s -w "Response Time: %{time_total}s | Status: %{http_code}\n"

echo "✅ Performance tests completed"
