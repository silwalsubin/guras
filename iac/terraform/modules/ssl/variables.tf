variable "environment" {
  description = "Environment name"
  type        = string
}

variable "domain_name" {
  description = "Domain name for the SSL certificate"
  type        = string
}

variable "route53_zone_id" {
  description = "Route53 hosted zone ID for DNS validation"
  type        = string
} 