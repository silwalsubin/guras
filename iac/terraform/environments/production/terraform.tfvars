environment = "production"
aws_region = "us-east-1"
vpc_cidr = "10.1.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]

# Application settings
app_image_tag = "1.0.128"
ecs_desired_count = 2
ecs_cpu = 512
ecs_memory = 1024

# Database settings
db_name = "guras_production"
db_instance_class = "db.t3.small"
db_allocated_storage = 50

# Database credentials are automatically generated and stored in AWS Secrets Manager
# No manual credential management required 

# Domain and DNS settings
domain_name = "gurasuniverse.com"
route53_zone_id = "Z03420161UX2FR5OUM4K8"  # Replace with your actual Route53 hosted zone ID

# VPC Endpoints Configuration - Disabled for cost savings
# Removing Interface Endpoints (CloudWatch Logs, Secrets Manager, KMS)
# Saves ~$21.60/month, traffic goes through NAT Gateway instead
enable_vpc_endpoints = false
