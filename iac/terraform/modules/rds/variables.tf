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

variable "db_name" {
  description = "Database name"
  type        = string
}

variable "instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20
}

variable "max_allocated_storage" {
  description = "RDS maximum allocated storage in GB"
  type        = number
  default     = 100
}

variable "rds_security_group_id" {
  description = "RDS security group ID"
  type        = string
}

variable "public_subnets" {
  description = "Public subnet IDs for development access"
  type        = list(string)
  default     = []
}

variable "use_public_subnets" {
  description = "Use public subnets for RDS (for development access)"
  type        = bool
  default     = false
} 