#!/bin/bash

# Script to fix RDS subnet group state issue
# This script removes the problematic aws_db_subnet_group.main from Terraform state

set -e

echo "Fixing RDS subnet group state issue..."

# Remove the problematic resource from state
terraform state rm module.main.module.rds.aws_db_subnet_group.main || true

echo "State fix completed. You can now run terraform plan/apply." 