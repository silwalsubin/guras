environment = "staging"
aws_region = "us-east-1"
vpc_cidr = "10.0.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b"]

# Application settings
app_image_tag = "1.0.146"
ecs_desired_count = 1
ecs_cpu = 256
ecs_memory = 512

# Database settings
db_name = "guras_staging"
db_instance_class = "db.t3.micro"
db_allocated_storage = 20

# Database credentials are automatically generated and stored in AWS Secrets Manager
# No manual credential management required

# Domain and DNS settings
domain_name = "gurasuniverse.com"
route53_zone_id = "Z03420161UX2FR5OUM4K8"  # Replace with your actual Route53 hosted zone ID

# Development settings - Allow external RDS access
allow_external_rds_access = true
external_rds_access_cidrs = ["99.135.177.6/32"]  # Your specific IP address for secure access

# NAT Configuration - Use NAT Instance for staging (cost savings)
# NAT Instance (t3.nano) costs ~$3-5/month vs NAT Gateway (~$32/month)
use_nat_instance = true
nat_instance_type = "t3.nano"

# VPC Endpoints Configuration - Disabled for cost savings
# Removing Interface Endpoints (CloudWatch Logs, Secrets Manager, KMS)
# Saves ~$21.60/month, traffic goes through NAT Instance instead
enable_vpc_endpoints = false

# Phase 3 - Optional Cost Optimizations
# ECR Image Retention - Keep only 10 images for staging (vs 30 for production)
# Saves ~$0-1/month on image scanning costs
ecr_image_retention_count = 10

# RDS Max Storage - Limit to 50GB for staging (vs 100GB for production)
# Saves ~$0-1/month if auto-scaling occurs
rds_max_allocated_storage = 50

# S3 Versioning - Disabled for both environments to save costs
# Noncurrent versions kept for 7 days (vs 30 days default)
# Saves ~$0-1/month on storage costs
s3_noncurrent_version_expiration_days = 7
