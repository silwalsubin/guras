variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "private_subnets" {
  description = "Private subnet IDs"
  type        = list(string)
}

variable "public_subnets" {
  description = "Public subnet IDs"
  type        = list(string)
}

variable "ecr_repository_url" {
  description = "ECR repository URL"
  type        = string
}

variable "app_image_tag" {
  description = "Docker image tag"
  type        = string
  default     = "latest"
}

variable "desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 1
}

variable "cpu" {
  description = "CPU units for ECS task"
  type        = number
  default     = 256
}

variable "memory" {
  description = "Memory for ECS task in MiB"
  type        = number
  default     = 512
}

variable "ecs_tasks_security_group_id" {
  description = "ECS tasks security group ID"
  type        = string
}

variable "target_group_arn" {
  description = "Target group ARN for load balancer"
  type        = string
} 

variable "kms_key_arn" {
  description = "KMS key ARN for decrypting secrets"
  type        = string
}

variable "openai_api_key_secret_arn" {
  description = "ARN of the OpenAI API key secret in AWS Secrets Manager"
  type        = string
}