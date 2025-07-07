output "main_domain_url" {
  description = "Main domain URL"
  value       = "https://${var.domain_name}"
}

output "staging_subdomain_url" {
  description = "Staging subdomain URL"
  value       = var.environment == "staging" ? "https://staging.${var.domain_name}" : null
}

output "production_subdomain_url" {
  description = "Production subdomain URL"
  value       = var.environment == "production" ? "https://production.${var.domain_name}" : null
} 