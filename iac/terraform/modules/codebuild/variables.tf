variable "project_name" {
  description = "Name of the project (used for resource naming)"
  type        = string
}

variable "environment" {
  description = "Environment name (staging, production)"
  type        = string
}

variable "github_repo_url" {
  description = "GitHub repository URL for the source code"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where CodeBuild will run"
  type        = string
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for CodeBuild VPC configuration"
  type        = list(string)
}

variable "rds_security_group_id" {
  description = "Security group ID of the RDS instance (optional)"
  type        = string
  default     = null
}



variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
