terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = "guras"
      Environment = "bootstrap"
      ManagedBy   = "terraform"
    }
  }
}

# S3 bucket for staging state
resource "aws_s3_bucket" "staging_state" {
  bucket = "guras-terraform-state-staging"

  tags = {
    Name = "guras-terraform-state-staging"
  }
}

# S3 bucket for production state
resource "aws_s3_bucket" "production_state" {
  bucket = "guras-terraform-state-production"

  tags = {
    Name = "guras-terraform-state-production"
  }
}

# S3 bucket versioning for staging
resource "aws_s3_bucket_versioning" "staging_state" {
  bucket = aws_s3_bucket.staging_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 bucket versioning for production
resource "aws_s3_bucket_versioning" "production_state" {
  bucket = aws_s3_bucket.production_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 bucket encryption for staging
resource "aws_s3_bucket_server_side_encryption_configuration" "staging_state" {
  bucket = aws_s3_bucket.staging_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# S3 bucket encryption for production
resource "aws_s3_bucket_server_side_encryption_configuration" "production_state" {
  bucket = aws_s3_bucket.production_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# S3 bucket public access block for staging
resource "aws_s3_bucket_public_access_block" "staging_state" {
  bucket = aws_s3_bucket.staging_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 bucket public access block for production
resource "aws_s3_bucket_public_access_block" "production_state" {
  bucket = aws_s3_bucket.production_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# DynamoDB table for state locking
resource "aws_dynamodb_table" "terraform_locks" {
  name           = "guras-terraform-locks"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    Name = "guras-terraform-locks"
  }
}

# IAM policy for Terraform state access
resource "aws_iam_policy" "terraform_state_access" {
  name        = "guras-terraform-state-access"
  description = "Policy for accessing Terraform state buckets and DynamoDB table"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = [
          aws_s3_bucket.staging_state.arn,
          "${aws_s3_bucket.staging_state.arn}/*",
          aws_s3_bucket.production_state.arn,
          "${aws_s3_bucket.production_state.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:DeleteItem"
        ]
        Resource = aws_dynamodb_table.terraform_locks.arn
      }
    ]
  })
} 