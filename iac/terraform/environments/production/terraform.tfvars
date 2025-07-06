environment = "production"
aws_region = "us-east-1"
vpc_cidr = "10.1.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]

# Application settings
app_image_tag = "latest"
ecs_desired_count = 2
ecs_cpu = 512
ecs_memory = 1024

# Database settings
db_name = "guras_production"
db_instance_class = "db.t3.small"
db_allocated_storage = 50

# Note: db_username and db_password should be provided via:
# - Environment variables: TF_VAR_db_username and TF_VAR_db_password
# - Command line: -var="db_username=xxx" -var="db_password=xxx"
# - Or use AWS Secrets Manager/Parameter Store 