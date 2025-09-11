#!/bin/bash

echo "🚀 Deploying to Vercel"
echo "====================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing..."
    npm install -g vercel
fi

echo "✅ Vercel CLI is ready"

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel:"
    vercel login
fi

echo "✅ Logged in to Vercel"

# Build the client first
echo "🔨 Building React client..."
cd client
npm run build
cd ..

if [ ! -d "client/dist" ]; then
    echo "❌ Client build failed. Please check the errors above."
    exit 1
fi

echo "✅ Client built successfully"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully deployed to Vercel!"
    echo ""
    echo "🌐 Your app is now available at:"
    echo "   https://your-project-name.vercel.app"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Set environment variables in Vercel dashboard:"
    echo "      - TWILIO_ACCOUNT_SID"
    echo "      - TWILIO_API_KEY_SID"
    echo "      - TWILIO_API_KEY_SECRET"
    echo ""
    echo "   2. Update client/src/config.ts with your Vercel URL"
    echo ""
    echo "🔧 To set environment variables:"
    echo "   vercel env add TWILIO_ACCOUNT_SID"
    echo "   vercel env add TWILIO_API_KEY_SID"
    echo "   vercel env add TWILIO_API_KEY_SECRET"
    echo ""
    echo "📊 To view logs:"
    echo "   vercel logs"
    echo ""
    echo "🔄 To redeploy:"
    echo "   vercel --prod"
else
    echo "❌ Deployment failed"
    exit 1
fi
