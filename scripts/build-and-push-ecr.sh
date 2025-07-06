#!/bin/bash

# Build and Push Docker Image to ECR for Staging
# Usage: ./scripts/build-and-push-ecr.sh [tag]

set -e

# Configuration
ENVIRONMENT=${1:-staging}
IMAGE_TAG=${2:-latest}
AWS_REGION=${AWS_REGION:-us-east-1}
PROJECT_NAME="guras"

echo "🚀 Building and pushing Docker image to ECR for $ENVIRONMENT environment"
echo "🏷️  Image tag: $IMAGE_TAG"
echo "🌍 AWS Region: $AWS_REGION"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Get ECR repository URL from Terraform outputs
echo "📦 Getting ECR repository URL from Terraform outputs..."
cd iac/terraform/environments/$ENVIRONMENT

# Initialize Terraform if needed
if [ ! -d ".terraform" ]; then
    echo "🔧 Initializing Terraform..."
    terraform init
fi

# Get ECR repository URL
ECR_REPO_URL=$(terraform output -raw ecr_repository_url 2>/dev/null || echo "")

if [ -z "$ECR_REPO_URL" ]; then
    echo "❌ Could not get ECR repository URL from Terraform outputs"
    echo "Please make sure the ECR repository is created first by running:"
    echo "cd iac/terraform/environments/$ENVIRONMENT && terraform apply"
    exit 1
fi

echo "📦 ECR Repository URL: $ECR_REPO_URL"

# Go back to project root
cd ../../..

# Login to ECR
echo "🔐 Logging in to Amazon ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPO_URL

# Create Firebase Admin SDK JSON if secret is available
if [ ! -z "$FIREBASE_ADMIN_SDK_JSON" ]; then
    echo "🔥 Creating Firebase Admin SDK JSON file..."
    echo "$FIREBASE_ADMIN_SDK_JSON" > server/apis/guras-firebase-adminsdk.json
    echo "✅ Firebase Admin SDK JSON file created"
else
    echo "⚠️  FIREBASE_ADMIN_SDK_JSON environment variable not set"
    echo "The build will continue but Firebase functionality may not work"
fi

# Build Docker image
echo "🔨 Building Docker image..."
docker build -t $PROJECT_NAME:$IMAGE_TAG ./server

# Tag image for ECR
echo "🏷️  Tagging image for ECR..."
docker tag $PROJECT_NAME:$IMAGE_TAG $ECR_REPO_URL:$IMAGE_TAG

# Push to ECR
echo "📤 Pushing image to ECR..."
docker push $ECR_REPO_URL:$IMAGE_TAG

echo "✅ Successfully built and pushed Docker image!"
echo "📦 Repository: $ECR_REPO_URL"
echo "🏷️  Tag: $IMAGE_TAG"
echo "🌍 Region: $AWS_REGION"
echo "🏗️  Environment: $ENVIRONMENT"

# Clean up local images
echo "🧹 Cleaning up local images..."
docker rmi $PROJECT_NAME:$IMAGE_TAG $ECR_REPO_URL:$IMAGE_TAG 2>/dev/null || true

echo "🎉 Done!" 