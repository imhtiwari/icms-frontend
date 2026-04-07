# Production Build Script for Vercel
echo "Building for production..."
npm run build

echo "Build completed. Deploying to Vercel..."
vercel --prod

echo "Deployment complete!"
