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