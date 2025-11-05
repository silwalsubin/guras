# KMS Key for Secrets Manager encryption
resource "aws_kms_key" "secrets" {
  description             = "KMS key for ${var.environment} environment secrets"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {
    Name = "${var.environment}-guras-secrets-key"
  }
}

resource "aws_kms_alias" "secrets" {
  name          = "alias/${var.environment}-guras-secrets"
  target_key_id = aws_kms_key.secrets.key_id
}

# Random password generator
resource "random_password" "db_password" {
  length  = 16
  special = true
  upper   = true
  lower   = true
  numeric = true
}

# AWS Secrets Manager secret for database credentials
resource "aws_secretsmanager_secret" "db_credentials" {
  name        = "guras/db-credentials"
  description = "Database credentials for ${var.environment} environment"
  kms_key_id  = aws_kms_key.secrets.arn

  tags = {
    Name = "${var.environment}-guras-db-credentials"
  }
}

# Secret version with initial credentials (without host endpoint to avoid cycle)
resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    ServerName = ""
    Port = 5432
    UserName = "guras_admin"
    Password = random_password.db_password.result
    DatabaseName = var.db_name
  })
}

# Data source for existing subnet group
data "aws_db_subnet_group" "existing" {
  name = var.use_public_subnets ? "${var.environment}-guras-db-public-subnet-group" : "${var.environment}-guras-db-subnet-group"
}

# Moved blocks to help Terraform understand the resource transitions
moved {
  from = aws_db_instance.development[0]
  to   = aws_db_instance.main
}

moved {
  from = aws_db_subnet_group.public[0]
  to   = data.aws_db_subnet_group.existing
}

# RDS Instance
resource "aws_db_instance" "main" {
  identifier = "${var.environment}-guras-db"

  engine         = "postgres"
  engine_version = "13.20"
  instance_class = var.instance_class

  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  storage_type          = "gp2"
  storage_encrypted     = true
  kms_key_id            = aws_kms_key.secrets.arn

  db_name  = var.db_name
  username = "guras_admin"
  password = random_password.db_password.result

  vpc_security_group_ids = [var.rds_security_group_id]
  db_subnet_group_name   = data.aws_db_subnet_group.existing.name
  parameter_group_name   = aws_db_parameter_group.main.name

  # Enable public accessibility for development
  publicly_accessible = var.use_public_subnets

  backup_retention_period = var.environment == "production" ? 7 : 1
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = var.environment == "staging"
  final_snapshot_identifier = var.environment == "production" ? "${var.environment}-guras-db-final-snapshot" : null

  deletion_protection = var.environment == "production"

  tags = {
    Name = "${var.environment}-guras-db"
  }

  depends_on = [aws_secretsmanager_secret_version.db_credentials]

  lifecycle {
    create_before_destroy = true
    ignore_changes = [
      # Ignore changes to subnet group during transition
      db_subnet_group_name
    ]
  }
}

# RDS Parameter Group
resource "aws_db_parameter_group" "main" {
  family = "postgres13"
  name   = "${var.environment}-guras-db-params"

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_disconnections"
    value = "1"
  }

  tags = {
    Name = "${var.environment}-guras-db-params"
  }
}



# Update secret with RDS endpoint after instance is created
resource "aws_secretsmanager_secret_version" "db_credentials_with_host" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    ServerName = aws_db_instance.main.endpoint
    Port = 5432
    UserName = "guras_admin"
    Password = random_password.db_password.result
    DatabaseName = var.db_name
  })

  depends_on = [aws_db_instance.main]
}

# CloudWatch Log Group for RDS
resource "aws_cloudwatch_log_group" "rds" {
  name              = "/aws/rds/instance/${aws_db_instance.main.identifier}/postgresql"
  retention_in_days = 2

  tags = {
    Name = "${var.environment}-guras-db-logs"
  }
}

# IAM Policy for Secrets Manager access
resource "aws_iam_policy" "secrets_access" {
  name        = "${var.environment}-guras-secrets-access"
  description = "Policy for accessing database secrets"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = aws_secretsmanager_secret.db_credentials.arn
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:DescribeKey"
        ]
        Resource = aws_kms_key.secrets.arn
      }
    ]
  })
} 