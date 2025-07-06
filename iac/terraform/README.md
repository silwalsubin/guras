# Guras Infrastructure as Code (Terraform)

This directory contains Terraform configurations for deploying the Guras application infrastructure on AWS.

## Architecture Overview

The infrastructure includes:
- **VPC** with public and private subnets across multiple availability zones
- **ECS Fargate** for running the application containers
- **Application Load Balancer** for traffic distribution
- **RDS PostgreSQL** database
- **ECR** for storing Docker images
- **Security Groups** for network security

## Directory Structure

```
terraform/
├── main.tf                 # Main Terraform configuration
├── variables.tf            # Variable definitions
├── environments/           # Environment-specific configurations
│   ├── staging/
│   │   └── terraform.tfvars
│   └── production/
│       └── terraform.tfvars
└── modules/               # Reusable Terraform modules
    ├── vpc/              # VPC and networking
    ├── ecr/              # ECR repository
    ├── ecs/              # ECS cluster and services
    ├── alb/              # Application Load Balancer
    └── rds/              # RDS database
```

## Prerequisites

1. **AWS CLI** configured with appropriate credentials
2. **Terraform** >= 1.0 installed
3. **Bootstrap infrastructure** for state management (see bootstrap/README.md)

## Quick Start

### 1. Bootstrap State Management (First Time Only)

Before deploying the main infrastructure, you need to set up the state management infrastructure:

```bash
cd iac/terraform/bootstrap
terraform init
terraform plan
terraform apply
```

This creates the S3 buckets and DynamoDB table needed for state management.

### 2. Initialize Terraform for Environment

```bash
cd iac/terraform/environments/staging
terraform init
```

### 3. Set Required Variables

Set the database credentials as environment variables:

```bash
export TF_VAR_db_username="your_db_username"
export TF_VAR_db_password="your_db_password"
```

### 4. Plan and Apply

```bash
# Review the plan
terraform plan

# Apply the configuration
terraform apply
```

## Environment Management

### Staging Environment

```bash
cd iac/terraform/environments/staging
terraform init
terraform plan
terraform apply
```

### Production Environment

```bash
cd iac/terraform/environments/production
terraform init
terraform plan
terraform apply
```

## Variables

### Required Variables

- `db_username`: Database username
- `db_password`: Database password

### Optional Variables (with defaults)

- `environment`: Environment name (staging/production)
- `aws_region`: AWS region (default: us-east-1)
- `vpc_cidr`: VPC CIDR block (default: 10.0.0.0/16 for staging, 10.1.0.0/16 for production)
- `app_image_tag`: Docker image tag (default: latest)
- `ecs_desired_count`: Number of ECS tasks (default: 1 for staging, 2 for production)
- `db_instance_class`: RDS instance class (default: db.t3.micro for staging, db.t3.small for production)

## Security

- All sensitive variables (db_username, db_password) are marked as sensitive
- Security groups are configured with minimal required access
- RDS is deployed in private subnets
- ECS tasks run in private subnets with NAT gateway access

## Cost Optimization

- Staging environment uses smaller instance types
- Production environment uses larger instances for better performance
- ECR lifecycle policy keeps only the last 30 images
- NAT Gateway is shared across all private subnets

## Monitoring and Logging

- ECS tasks send logs to CloudWatch
- RDS has enhanced monitoring enabled
- ALB access logs are enabled

## Troubleshooting

### Common Issues

1. **State Lock Issues**: If Terraform gets stuck, check DynamoDB for locks
2. **Permission Issues**: Ensure AWS credentials have required permissions
3. **VPC CIDR Conflicts**: Ensure VPC CIDR doesn't conflict with existing VPCs

### Useful Commands

```bash
# View outputs
terraform output

# Destroy infrastructure
terraform destroy

# Import existing resources
terraform import aws_vpc.main vpc-12345678

# Validate configuration
terraform validate
```

## Next Steps

1. Set up CI/CD pipeline to automatically deploy infrastructure changes
2. Configure monitoring and alerting
3. Set up backup and disaster recovery procedures
4. Implement blue-green deployments
5. Add additional security measures (WAF, Shield, etc.)

## Contributing

When making changes to the infrastructure:

1. Test changes in staging first
2. Use `terraform plan` to review changes
3. Document any new variables or outputs
4. Update this README if necessary 