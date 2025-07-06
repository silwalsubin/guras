output "staging_state_bucket" {
  description = "S3 bucket for staging Terraform state"
  value       = aws_s3_bucket.staging_state.bucket
}

output "production_state_bucket" {
  description = "S3 bucket for production Terraform state"
  value       = aws_s3_bucket.production_state.bucket
}

output "dynamodb_table" {
  description = "DynamoDB table for Terraform state locking"
  value       = aws_dynamodb_table.terraform_locks.name
}

output "terraform_state_access_policy_arn" {
  description = "IAM policy ARN for Terraform state access"
  value       = aws_iam_policy.terraform_state_access.arn
} 