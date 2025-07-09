output "endpoint" {
  description = "RDS endpoint"
  value       = var.use_public_subnets ? aws_db_instance.development[0].endpoint : aws_db_instance.main[0].endpoint
}

output "port" {
  description = "RDS port"
  value       = var.use_public_subnets ? aws_db_instance.development[0].port : aws_db_instance.main[0].port
}

output "database_name" {
  description = "RDS database name"
  value       = var.use_public_subnets ? aws_db_instance.development[0].db_name : aws_db_instance.main[0].db_name
}

output "identifier" {
  description = "RDS instance identifier"
  value       = var.use_public_subnets ? aws_db_instance.development[0].identifier : aws_db_instance.main[0].identifier
}

output "arn" {
  description = "RDS instance ARN"
  value       = var.use_public_subnets ? aws_db_instance.development[0].arn : aws_db_instance.main[0].arn
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

output "subnet_group_name" {
  description = "Subnet group name being used"
  value       = var.use_public_subnets ? aws_db_subnet_group.public[0].name : data.aws_db_subnet_group.existing_private[0].name
}

output "subnet_group_subnets" {
  description = "Subnet IDs in the subnet group"
  value       = var.use_public_subnets ? aws_db_subnet_group.public[0].subnet_ids : data.aws_db_subnet_group.existing_private[0].subnet_ids
}

output "use_public_subnets" {
  description = "Whether using public subnets"
  value       = var.use_public_subnets
} 