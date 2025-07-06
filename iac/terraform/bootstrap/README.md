# Terraform Bootstrap Configuration

This directory contains the bootstrap Terraform configuration that sets up the infrastructure needed for Terraform state management.

## What This Creates

- **S3 Buckets**: Separate buckets for staging and production Terraform state
- **DynamoDB Table**: For state locking to prevent concurrent modifications
- **IAM Policy**: For accessing the state buckets and DynamoDB table
- **Security**: Encryption, versioning, and public access blocking

## Prerequisites

1. AWS CLI configured with appropriate credentials
2. Terraform >= 1.0 installed
3. AWS account with permissions to create S3 buckets, DynamoDB tables, and IAM policies

## Quick Start

### 1. Initialize Terraform

```bash
cd iac/terraform/bootstrap
terraform init
```

### 2. Review the Plan

```bash
terraform plan
```

### 3. Apply the Configuration

```bash
terraform apply
```

### 4. Note the Outputs

After successful deployment, note the outputs:
- S3 bucket names for staging and production
- DynamoDB table name
- IAM policy ARN

## Security Features

- **Encryption**: All S3 buckets use AES256 encryption
- **Versioning**: S3 buckets have versioning enabled for state recovery
- **Public Access**: All public access is blocked
- **State Locking**: DynamoDB table prevents concurrent state modifications

## Usage

Once the bootstrap infrastructure is created, you can use the backend configurations in the environment directories:

### Staging Environment
```bash
cd ../environments/staging
terraform init
terraform plan
terraform apply
```

### Production Environment
```bash
cd ../environments/production
terraform init
terraform plan
terraform apply
```

## IAM Permissions

The created IAM policy (`guras-terraform-state-access`) provides the minimum required permissions for Terraform to:
- Read/write state files in S3 buckets
- Use DynamoDB for state locking

Attach this policy to users or roles that need to run Terraform.

## Cleanup

To destroy the bootstrap infrastructure (use with caution):

```bash
terraform destroy
```

**Warning**: This will delete the S3 buckets and DynamoDB table. Make sure you have backups of your Terraform state if needed.

## Troubleshooting

### Common Issues

1. **Bucket Already Exists**: Ensure the bucket names are unique across all AWS accounts
2. **Permission Denied**: Verify your AWS credentials have the required permissions
3. **State Lock**: If Terraform gets stuck, check the DynamoDB table for locks

### Useful Commands

```bash
# Check S3 bucket contents
aws s3 ls s3://guras-terraform-state-staging/
aws s3 ls s3://guras-terraform-state-production/

# Check DynamoDB table
aws dynamodb describe-table --table-name guras-terraform-locks

# Force unlock state (use with caution)
terraform force-unlock <lock-id>
``` 