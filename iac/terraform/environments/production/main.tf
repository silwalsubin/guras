# This file references the main Terraform configuration
# The production environment uses the same configuration as the root module
# but with different variable values defined in terraform.tfvars

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Use the main configuration from the parent directory
module "main" {
  source = "../.."
  
  # Pass through all variables
  environment = var.environment
  aws_region = var.aws_region
  vpc_cidr = var.vpc_cidr
  availability_zones = var.availability_zones
  app_image_tag = var.app_image_tag
  ecs_desired_count = var.ecs_desired_count
  ecs_cpu = var.ecs_cpu
  ecs_memory = var.ecs_memory
  db_name = var.db_name

  db_instance_class = var.db_instance_class
  db_allocated_storage = var.db_allocated_storage
}

# Outputs from the main module
output "vpc_id" {
  description = "VPC ID"
  value       = module.main.vpc_id
}

output "ecr_repository_url" {
  description = "ECR Repository URL"
  value       = module.main.ecr_repository_url
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = module.main.alb_dns_name
}

output "ecs_cluster_name" {
  description = "ECS Cluster name"
  value       = module.main.ecs_cluster_name
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = module.main.rds_endpoint
  sensitive   = true
} 