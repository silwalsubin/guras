variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
}

variable "azs" {
  description = "Availability zones"
  type        = list(string)
}

variable "allow_external_rds_access" {
  description = "Allow external access to RDS (for development)"
  type        = bool
  default     = false
}

variable "external_rds_access_cidrs" {
  description = "CIDR blocks allowed to access RDS externally"
  type        = list(string)
  default     = []
}

variable "bastion_security_group_id" {
  description = "Bastion host security group ID for RDS access"
  type        = string
  default     = null
}

variable "use_nat_instance" {
  description = "Use NAT Instance (t3.nano) instead of NAT Gateway for cost savings"
  type        = bool
  default     = false
}

variable "nat_instance_type" {
  description = "Instance type for NAT Instance"
  type        = string
  default     = "t3.nano"
}

variable "enable_vpc_endpoints" {
  description = "Enable VPC Endpoints (CloudWatch Logs, Secrets Manager, KMS). Set to false to save costs."
  type        = bool
  default     = false
}