#!/bin/bash

# Deploy to ECS for Staging
# Usage: ./scripts/deploy-to-ecs.sh [version]

set -e

# Configuration
ENVIRONMENT=${1:-staging}
IMAGE_TAG=${2:-1.0.36}
AWS_REGION=${AWS_REGION:-us-east-1}

echo "🚀 Deploying to ECS for $ENVIRONMENT environment"
echo "🏷️  Image tag: $IMAGE_TAG"
echo "🌍 AWS Region: $AWS_REGION"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo "❌ Terraform is not installed. Please install it first."
    exit 1
fi

# Navigate to the staging environment
cd iac/terraform/environments/$ENVIRONMENT

echo "🔧 Initializing Terraform..."
terraform init

echo "📋 Planning Terraform changes..."
terraform plan -var="app_image_tag=$IMAGE_TAG" -out=tfplan

echo "🤔 Do you want to apply these changes? (y/N)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "🚀 Applying Terraform changes..."
    terraform apply tfplan
    
    echo "✅ Deployment completed successfully!"
    echo "📦 Image tag: $IMAGE_TAG"
    echo "🌍 Environment: $ENVIRONMENT"
    echo "🔗 Check your ALB endpoint for the deployed application"
    
    # Get the ALB DNS name
    ALB_DNS=$(terraform output -raw alb_dns_name 2>/dev/null || echo "not_available")
    if [ "$ALB_DNS" != "not_available" ]; then
        echo "🌐 Application URL: http://$ALB_DNS"
    fi
else
    echo "❌ Deployment cancelled"
    exit 1
fi

# Clean up
rm -f tfplan

echo "🎉 Done!" 