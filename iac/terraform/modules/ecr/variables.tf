variable "environment" {
  description = "Environment name"
  type        = string
}

variable "repository_name" {
  description = "ECR repository name"
  type        = string
}

variable "image_retention_count" {
  description = "Number of images to keep in ECR (older images will be expired)"
  type        = number
  default     = 30
}
