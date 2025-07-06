terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Backend configuration is set per environment in backend.tf files
  # This prevents using variables in backend configuration
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "guras"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# VPC and Networking
module "vpc" {
  source = "./modules/vpc"
  
  environment = var.environment
  vpc_cidr    = var.vpc_cidr
  azs         = var.availability_zones
}

# ECR Repository for Docker images
module "ecr" {
  source = "./modules/ecr"
  
  environment = var.environment
  repository_name = "guras-server"
}

# Application Load Balancer
module "alb" {
  source = "./modules/alb"
  
  environment = var.environment
  vpc_id = module.vpc.vpc_id
  public_subnets = module.vpc.public_subnets
  alb_security_group_id = module.vpc.alb_security_group_id
  
  depends_on = [module.vpc]
}

# ECS Cluster and Services
module "ecs" {
  source = "./modules/ecs"
  
  environment = var.environment
  vpc_id = module.vpc.vpc_id
  private_subnets = module.vpc.private_subnets
  public_subnets = module.vpc.public_subnets
  
  ecr_repository_url = module.ecr.repository_url
  app_image_tag = var.app_image_tag
  desired_count = var.ecs_desired_count
  cpu = var.ecs_cpu
  memory = var.ecs_memory
  ecs_tasks_security_group_id = module.vpc.ecs_tasks_security_group_id
  target_group_arn = module.alb.target_group_arn
  kms_key_arn = module.rds.kms_key_arn
  
  depends_on = [module.vpc, module.ecr, module.alb, module.rds]
}

# RDS Database
module "rds" {
  source = "./modules/rds"
  
  environment = var.environment
  vpc_id = module.vpc.vpc_id
  private_subnets = module.vpc.private_subnets
  db_name = var.db_name
  instance_class = var.db_instance_class
  allocated_storage = var.db_allocated_storage
  
  rds_security_group_id = module.vpc.rds_security_group_id
  
  depends_on = [module.vpc]
}

# Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "ecr_repository_url" {
  description = "ECR Repository URL"
  value       = module.ecr.repository_url
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = module.alb.alb_dns_name
}

output "ecs_cluster_name" {
  description = "ECS Cluster name"
  value       = module.ecs.cluster_name
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = module.rds.endpoint
  sensitive   = true
} 