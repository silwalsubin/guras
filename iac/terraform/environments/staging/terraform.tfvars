environment = "staging"
aws_region = "us-east-1"
vpc_cidr = "10.0.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b"]

# Application settings
app_image_tag = "1.0.102"
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

 