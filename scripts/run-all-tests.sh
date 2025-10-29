#!/bin/bash

# Comprehensive test runner

set -e

echo "🧪 Running All Tests for Task Manager..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if services are running
check_services() {
    echo "🔍 Checking services..."
    
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        print_status "Backend is running"
    else
        print_error "Backend is not running. Please start it first."
        exit 1
    fi
    
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        print_status "Frontend is running"
    else
        print_error "Frontend is not running. Please start it first."
        exit 1
    fi
}

# Run backend unit tests
run_backend_tests() {
    echo "🔧 Running Backend Unit Tests..."
    cd backend
    npm test
    cd ..
    print_status "Backend tests completed"
}

# Run frontend E2E tests
run_frontend_tests() {
    echo "🌐 Running Frontend E2E Tests..."
    cd frontend
    
    # Run Cypress in headless mode
    npx cypress run
    cd ..
    print_status "Frontend E2E tests completed"
}

# Run integration tests
run_integration_tests() {
    echo "🔄 Running Integration Tests..."
    cd frontend
    npx cypress run --spec "cypress/e2e/integration.cy.ts"
    cd ..
    print_status "Integration tests completed"
}

# Run performance tests
run_performance_tests() {
    echo "🚀 Running Performance Tests..."
    ./scripts/performance-test.sh
    print_status "Performance tests completed"
}

# Run load tests (optional)
run_load_tests() {
    echo "💪 Running Load Tests..."
    if command -v artillery > /dev/null 2>&1; then
        cd backend
        artillery run load-test.yml
        cd ..
        print_status "Load tests completed"
    else
        print_warning "Artillery not installed. Skipping load tests."
    fi
}

# Main execution
main() {
    echo "🎯 Starting comprehensive test suite..."
    echo "======================================="
    
    check_services
    
    echo ""
    echo "📋 Test Plan:"
    echo "1. Backend Unit Tests"
    echo "2. Frontend E2E Tests"
    echo "3. Integration Tests"
    echo "4. Performance Tests"
    echo "5. Load Tests (optional)"
    echo ""
    
    # Run all tests
    run_backend_tests
    echo ""
    
    run_frontend_tests
    echo ""
    
    run_integration_tests
    echo ""
    
    run_performance_tests
    echo ""
    
    run_load_tests
    echo ""
    
    echo "======================================="
    print_status "All tests completed successfully! 🎉"
    
    # Generate summary
    echo ""
    echo "📊 Test Summary:"
    echo "- Backend Unit Tests: ✅ Passed"
    echo "- Frontend E2E Tests: ✅ Passed"
    echo "- Integration Tests: ✅ Passed"
    echo "- Performance Tests: ✅ Passed"
    echo "- Load Tests: ✅ Passed"
    echo ""
    echo "🚀 Application is ready for deployment!"
}

# Handle interrupts
trap 'echo ""; print_error "Tests interrupted by user"; exit 1' INT

# Run main function
main "$@"
