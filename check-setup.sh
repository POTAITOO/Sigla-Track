#!/bin/bash

echo "🔍 Checking Firebase setup for Sigla-Track..."
echo ""

# Check if google-services.json exists
if [ -f "google-services.json" ]; then
    echo "✅ google-services.json found"
else
    echo "❌ google-services.json NOT found"
    echo "   → Contact project owner or download from Firebase Console"
fi

# Check if firebaseConfig.js exists
if [ -f "firebaseConfig.js" ]; then
    echo "✅ firebaseConfig.js found"
    
    # Check if it's still the example template
    if grep -q "YOUR_API_KEY" firebaseConfig.js; then
        echo "⚠️  firebaseConfig.js contains placeholder values"
        echo "   → Update with actual Firebase credentials"
    else
        echo "✅ firebaseConfig.js appears to be configured"
    fi
else
    echo "❌ firebaseConfig.js NOT found"
    echo "   → Copy firebaseConfig.example.js to firebaseConfig.js"
    echo "   → Then update with your Firebase credentials"
fi

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "✅ Dependencies installed"
else
    echo "⚠️  Dependencies not installed"
    echo "   → Run: npm install"
fi

echo ""
echo "📖 For detailed setup instructions, see FIREBASE_SETUP.md"
echo ""

if [ -f "google-services.json" ] && [ -f "firebaseConfig.js" ] && ! grep -q "YOUR_API_KEY" firebaseConfig.js 2>/dev/null; then
    echo "🎉 Setup looks good! Run: npx expo start"
else
    echo "⚠️  Setup incomplete. Please complete the steps above."
fi
