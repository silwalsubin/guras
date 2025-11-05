variable "environment" {
  description = "Environment name"
  type        = string
}

variable "bucket_name" {
  description = "Name of the S3 bucket (will be prefixed with environment)"
  type        = string
}

variable "force_destroy" {
  description = "Allow bucket to be destroyed even if it contains objects"
  type        = bool
  default     = false
}

variable "enable_lifecycle" {
  description = "Enable lifecycle configuration for the bucket"
  type        = bool
  default     = true
}

variable "enable_versioning" {
  description = "Enable versioning for the bucket (disabled by default to save costs)"
  type        = bool
  default     = false
}

variable "noncurrent_version_expiration_days" {
  description = "Number of days to keep noncurrent versions (for lifecycle)"
  type        = number
  default     = 30
}
