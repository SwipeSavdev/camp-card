#!/bin/bash
set -e

# Deploy Next.js to AWS S3 + CloudFront

ENVIRONMENT=${1:-production}
AWS_REGION="us-east-1"

if [ "$ENVIRONMENT" == "production" ]; then
 S3_BUCKET="campcard-web-prod"
 CLOUDFRONT_DISTRIBUTION_ID=$CLOUDFRONT_DISTRIBUTION_ID_PROD
 NEXT_PUBLIC_API_URL="https://api.campcard.org"
elif [ "$ENVIRONMENT" == "staging" ]; then
 S3_BUCKET="campcard-web-staging"
 CLOUDFRONT_DISTRIBUTION_ID=$CLOUDFRONT_DISTRIBUTION_ID_STAGING
 NEXT_PUBLIC_API_URL="https://api-staging.campcard.org"
else
 echo "Invalid environment. Use 'staging' or 'production'"
 exit 1
fi

echo "Deploying to $ENVIRONMENT..."

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build Next.js
echo "Building Next.js application..."
NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL npm run build

# Sync to S3
echo "Syncing to S3 bucket: $S3_BUCKET..."

# Upload static files with long cache
aws s3 sync .next/static s3://$S3_BUCKET/_next/static \
 --delete \
 --cache-control "public, max-age=31536000, immutable" \
 --region $AWS_REGION

# Upload public files
aws s3 sync public s3://$S3_BUCKET/public \
 --delete \
 --cache-control "public, max-age=86400" \
 --region $AWS_REGION

# Upload server-side pages
aws s3 sync .next/server s3://$S3_BUCKET/_next/server \
 --delete \
 --cache-control "public, max-age=0, must-revalidate" \
 --region $AWS_REGION

# Invalidate CloudFront cache
echo "Invalidating CloudFront distribution: $CLOUDFRONT_DISTRIBUTION_ID..."
aws cloudfront create-invalidation \
 --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
 --paths "/*" \
 --region $AWS_REGION

echo " Deployment to $ENVIRONMENT complete!"
