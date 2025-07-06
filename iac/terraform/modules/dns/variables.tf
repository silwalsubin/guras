variable "domain_name" {
  description = "Domain name for the A record"
  type        = string
}

variable "route53_zone_id" {
  description = "Route53 hosted zone ID"
  type        = string
}

variable "alb_dns_name" {
  description = "ALB DNS name for the A record"
  type        = string
}

variable "alb_zone_id" {
  description = "ALB hosted zone ID for the A record"
  type        = string
} 