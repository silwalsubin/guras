output "certificate_arn" {
  description = "SSL certificate ARN"
  value       = aws_acm_certificate.main.arn
}

output "certificate_validation_arn" {
  description = "SSL certificate validation ARN"
  value       = aws_acm_certificate_validation.main.certificate_arn
}

output "domain_name" {
  description = "Domain name"
  value       = var.domain_name
} 