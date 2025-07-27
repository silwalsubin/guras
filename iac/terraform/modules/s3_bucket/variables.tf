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