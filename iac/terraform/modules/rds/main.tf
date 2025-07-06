# RDS Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${var.environment}-guras-db-subnet-group"
  subnet_ids = var.private_subnets

  tags = {
    Name = "${var.environment}-guras-db-subnet-group"
  }
}

# RDS Parameter Group
resource "aws_db_parameter_group" "main" {
  family = "postgres14"
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

# RDS Instance
resource "aws_db_instance" "main" {
  identifier = "${var.environment}-guras-db"

  engine         = "postgres"
  engine_version = "14.10"
  instance_class = var.instance_class

  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  storage_type          = "gp2"
  storage_encrypted     = true

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  vpc_security_group_ids = [var.rds_security_group_id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  parameter_group_name   = aws_db_parameter_group.main.name

  backup_retention_period = var.environment == "production" ? 7 : 1
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = var.environment == "staging"
  final_snapshot_identifier = var.environment == "production" ? "${var.environment}-guras-db-final-snapshot" : null

  deletion_protection = var.environment == "production"

  tags = {
    Name = "${var.environment}-guras-db"
  }
}

# CloudWatch Log Group for RDS
resource "aws_cloudwatch_log_group" "rds" {
  name              = "/aws/rds/instance/${aws_db_instance.main.identifier}/postgresql"
  retention_in_days = 7

  tags = {
    Name = "${var.environment}-guras-db-logs"
  }
} 