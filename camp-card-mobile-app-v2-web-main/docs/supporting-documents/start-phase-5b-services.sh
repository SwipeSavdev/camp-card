#!/bin/bash

# Phase 5b Service Startup Guide
# This script provides instructions for starting all three services for Phase 5b testing

set -e

PROJECT_ROOT="/Users/macbookpro/Documents/camp-card-mobile-app-v2"

echo ""
echo " "
echo "  PHASE 5b SERVICE STARTUP GUIDE  "
echo " "
echo " Authentication E2E Testing - Service Initialization "
echo " "
echo ""
echo ""

echo " This script will help you start all required services for Phase 5b testing."
echo ""
echo "You will need to open THREE separate terminal windows and run each command."
echo ""

# Check if repos exist
echo " Checking project structure..."
if [ ! -d "$PROJECT_ROOT/repos/camp-card-backend" ]; then
 echo " Backend repo not found at $PROJECT_ROOT/repos/camp-card-backend"
 exit 1
fi

if [ ! -d "$PROJECT_ROOT/repos/camp-card-mobile" ]; then
 echo " Mobile repo not found at $PROJECT_ROOT/repos/camp-card-mobile"
 exit 1
fi

if [ ! -d "$PROJECT_ROOT/repos/camp-card-web" ]; then
 echo " Web repo not found at $PROJECT_ROOT/repos/camp-card-web"
 exit 1
fi

echo " All repos found"
echo ""

# Create startup script file
STARTUP_FILE="$PROJECT_ROOT/PHASE_5B_STARTUP_COMMANDS.sh"

cat > "$STARTUP_FILE" << 'COMMANDS_EOF'
#!/bin/bash

PROJECT_ROOT="/Users/macbookpro/Documents/camp-card-mobile-app-v2"

echo ""
echo ""
echo " "
echo " PHASE 5b - THREE SERVICE STARTUP COMMANDS "
echo " Copy and paste each command into a separate terminal window "
echo " "
echo ""
echo ""

echo ""
echo " TERMINAL 1: Backend Service (Java/Spring Boot)"
echo ""
echo ""
echo "Copy this command:"
echo ""
echo "cd $PROJECT_ROOT/repos/camp-card-backend && npm install && npm start"
echo ""
echo "Expected output:"
echo "  npm install completes successfully"
echo "  'Server listening on port 8080' or similar"
echo "  Backend API ready at http://localhost:8080"
echo ""

echo ""
echo " TERMINAL 2: Mobile App (Expo/React Native)"
echo ""
echo ""
echo "Copy this command:"
echo ""
echo "cd $PROJECT_ROOT/repos/camp-card-mobile && npm install && npm start"
echo ""
echo "After npm start completes, you'll see:"
echo "  Metro bundler ready (127.0.0.1:8081)"
echo "  Press 'i' for iOS Simulator"
echo "  Press 'a' for Android Emulator"
echo ""
echo "Choose based on your setup:"
echo " - iOS: Have Xcode with iOS Simulator running, or press 'i'"
echo " - Android: Have Android Emulator running, or press 'a'"
echo ""

echo ""
echo " TERMINAL 3: Web Portal (Next.js)"
echo ""
echo ""
echo "Copy this command:"
echo ""
echo "cd $PROJECT_ROOT/repos/camp-card-web && npm install && npm run dev"
echo ""
echo "Expected output:"
echo "  npm install completes successfully"
echo "  'ready - started server on 0.0.0.0:3000'"
echo "  Web portal ready at http://localhost:3000"
echo ""

echo ""
echo " STARTUP VERIFICATION CHECKLIST"
echo ""
echo ""
echo "After starting all three services, verify they're ready:"
echo ""
echo " Backend"
echo "  Terminal 1 shows: 'Server listening on port 8080'"
echo "  Test: curl http://localhost:8080/api/health (if available)"
echo ""
echo " Mobile App"
echo "  Terminal 2 shows: Metro bundler ready"
echo "  iOS Simulator or Android Emulator is running"
echo "  App displays login screen"
echo ""
echo " Web Portal"
echo "  Terminal 3 shows: 'ready - started server on 0.0.0.0:3000'"
echo "  Visit http://localhost:3000"
echo "  Login page displays"
echo ""

echo ""
echo " TEST CREDENTIALS"
echo ""
echo ""
echo "Use these for testing:"
echo ""
echo "Customer Account:"
echo " Email: customer@example.com"
echo " Password: password123"
echo ""
echo "Scout Account:"
echo " Email: scout@example.com"
echo " Password: password123"
echo ""
echo "Leader Account:"
echo " Email: leader@example.com"
echo " Password: password123"
echo ""

echo ""
echo " NEXT STEPS AFTER STARTUP"
echo ""
echo ""
echo "1. Once all services are running, open:"
echo "  File: PHASE_5B_LIVE_EXECUTION_GUIDE.md"
echo ""
echo "2. Follow the detailed test cases in order:"
echo "  Tests 1.1-1.4: Mobile Authentication (4 tests)"
echo "  Tests 2.1-2.3: Web Authentication (3 tests)"
echo "  Tests 3.1-3.2: Cross-Service Token (2 tests)"
echo "  Tests 4.1-4.2: Token Refresh (2 tests)"
echo "  Tests 5.1-5.2: Security Validation (2 tests)"
echo ""
echo "3. Total testing time: ~2-3 hours for all 13 test cases"
echo ""
echo "4. Document results in PHASE_5B_EXECUTION_START.md"
echo ""

echo ""
echo ""
echo " Ready to proceed!"
echo ""

COMMANDS_EOF

chmod +x "$STARTUP_FILE"

echo " Created startup guide: $STARTUP_FILE"
echo ""

# Display the startup commands
bash "$STARTUP_FILE"

echo ""
echo ""
echo " ACTION ITEMS"
echo ""
echo ""
echo "1. Open THREE new terminal windows"
echo ""
echo "2. In Terminal 1, run:"
echo " cd $PROJECT_ROOT/repos/camp-card-backend && npm install && npm start"
echo ""
echo "3. In Terminal 2, run:"
echo " cd $PROJECT_ROOT/repos/camp-card-mobile && npm install && npm start"
echo ""
echo "4. In Terminal 3, run:"
echo " cd $PROJECT_ROOT/repos/camp-card-web && npm install && npm run dev"
echo ""
echo "5. Once all are running, open:"
echo " PHASE_5B_LIVE_EXECUTION_GUIDE.md"
echo ""
echo "6. Follow the test cases and document results in:"
echo " PHASE_5B_EXECUTION_START.md"
echo ""
echo ""
echo ""
