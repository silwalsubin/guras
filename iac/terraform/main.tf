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

# Retrieve OpenAI API key from AWS Secrets Manager
data "aws_secretsmanager_secret" "openai_api_key" {
  name = "guras/openai-api-key"
}

data "aws_secretsmanager_secret_version" "openai_api_key" {
  secret_id = data.aws_secretsmanager_secret.openai_api_key.id
}

# VPC and Networking
module "vpc" {
  source = "./modules/vpc"

  environment = var.environment
  vpc_cidr    = var.vpc_cidr
  azs         = var.availability_zones
  allow_external_rds_access = var.allow_external_rds_access
  external_rds_access_cidrs = var.external_rds_access_cidrs
  use_nat_instance = var.use_nat_instance
  nat_instance_type = var.nat_instance_type
  enable_vpc_endpoints = var.enable_vpc_endpoints
}

# ECR Repository for Docker images
module "ecr" {
  source = "./modules/ecr"

  environment = var.environment
  repository_name = "guras-server"
  image_retention_count = var.ecr_image_retention_count
}

# SSL Certificate
module "ssl" {
  source = "./modules/ssl"
  
  environment = var.environment
  domain_name = var.domain_name
  route53_zone_id = var.route53_zone_id
}

# Application Load Balancer
module "alb" {
  source = "./modules/alb"
  
  environment = var.environment
  vpc_id = module.vpc.vpc_id
  public_subnets = module.vpc.public_subnets
  alb_security_group_id = module.vpc.alb_security_group_id
  certificate_arn = module.ssl.certificate_arn
  
  depends_on = [module.vpc, module.ssl]
}

# DNS Records
module "dns" {
  source = "./modules/dns"
  
  environment = var.environment
  domain_name = var.domain_name
  route53_zone_id = var.route53_zone_id
  alb_dns_name = module.alb.alb_dns_name
  alb_zone_id = module.alb.alb_zone_id
  
  depends_on = [module.alb]
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
  openai_api_key_secret_arn = data.aws_secretsmanager_secret.openai_api_key.arn

  depends_on = [module.vpc, module.ecr, module.alb, module.rds]
}

# RDS Database
module "rds" {
  source = "./modules/rds"

  environment = var.environment
  vpc_id = module.vpc.vpc_id
  private_subnets = module.vpc.private_subnets
  public_subnets = module.vpc.public_subnets
  db_name = var.db_name
  instance_class = var.db_instance_class
  allocated_storage = var.db_allocated_storage
  max_allocated_storage = var.rds_max_allocated_storage
  use_public_subnets = var.allow_external_rds_access

  rds_security_group_id = module.vpc.rds_security_group_id

  depends_on = [module.vpc]
}

# S3 Bucket for Audio Files
module "audio_files_bucket" {
  source = "./modules/s3_bucket"

  environment   = var.environment
  bucket_name   = "guras-audio-files"
  force_destroy = var.environment != "production" ? true : false
  enable_versioning = false
  noncurrent_version_expiration_days = var.s3_noncurrent_version_expiration_days
}

# Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnets
}

output "rds_security_group_id" {
  description = "RDS security group ID"
  value       = module.vpc.rds_security_group_id
}

output "ecr_repository_url" {
  description = "ECR Repository URL"
  value       = module.ecr.repository_url
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = module.alb.alb_dns_name
}

output "current_alb_dns_name" {
  description = "Current ALB DNS name for debugging"
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

output "certificate_arn" {
  description = "SSL certificate ARN"
  value       = module.ssl.certificate_arn
}

output "certificate_status" {
  description = "Certificate status for debugging"
  value       = "Certificate ARN: ${module.ssl.certificate_arn}, Validation ARN: ${module.ssl.certificate_validation_arn}, Domain: ${var.domain_name}"
}

output "alb_debug_info" {
  description = "ALB debugging information"
  value       = "ALB DNS: ${module.alb.alb_dns_name}, HTTPS Listener ARN: ${module.alb.https_listener_arn}, Certificate ARN: ${module.ssl.certificate_arn}"
}

output "main_domain_url" {
  description = "Main domain URL"
  value       = module.dns.main_domain_url
}

output "staging_subdomain_url" {
  description = "Staging subdomain URL"
  value       = module.dns.staging_subdomain_url
}

output "production_subdomain_url" {
  description = "Production subdomain URL"
  value       = module.dns.production_subdomain_url
}

output "audio_files_bucket_name" {
  description = "S3 bucket name for audio files"
  value       = module.audio_files_bucket.bucket_name
}

output "audio_files_bucket_arn" {
  description = "S3 bucket ARN for audio files"
  value       = module.audio_files_bucket.bucket_arn
} 