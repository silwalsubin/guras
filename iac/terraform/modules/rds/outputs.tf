output "endpoint" {
  description = "RDS endpoint"
  value       = aws_db_instance.main.endpoint
}

output "port" {
  description = "RDS port"
  value       = aws_db_instance.main.port
}

output "database_name" {
  description = "RDS database name"
  value       = aws_db_instance.main.db_name
}

output "identifier" {
  description = "RDS instance identifier"
  value       = aws_db_instance.main.identifier
}

output "arn" {
  description = "RDS instance ARN"
  value       = aws_db_instance.main.arn
}

output "secrets_manager_secret_arn" {
  description = "Secrets Manager secret ARN for database credentials"
  value       = aws_secretsmanager_secret.db_credentials.arn
}

output "kms_key_arn" {
  description = "KMS key ARN for secrets encryption"
  value       = aws_kms_key.secrets.arn
}

output "secrets_access_policy_arn" {
  description = "IAM policy ARN for secrets access"
  value       = aws_iam_policy.secrets_access.arn
} 