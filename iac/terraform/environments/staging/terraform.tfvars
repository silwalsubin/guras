environment = "staging"
aws_region = "us-east-1"
vpc_cidr = "10.0.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b"]

# Application settings
app_image_tag = "latest"
ecs_desired_count = 1
ecs_cpu = 256
ecs_memory = 512

# Database settings
db_name = "guras_staging"
db_instance_class = "db.t3.micro"
db_allocated_storage = 20

# Database credentials are automatically generated and stored in AWS Secrets Manager
# No manual credential management required 