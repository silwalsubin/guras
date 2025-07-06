# GitHub Actions Workflows

This directory contains GitHub Actions workflows for CI/CD automation.

## Workflows Overview

### 1. `docker-build.yml`
- **Purpose**: Builds and pushes Docker images to GitHub Container Registry
- **Trigger**: Push to master branch (when server files change) or manual dispatch
- **Features**: 
  - Multi-platform builds (AMD64, ARM64)
  - Docker layer caching
  - Automatic tagging
  - Creates Firebase credentials from secrets

### 2. `ios-ci-cd.yml`
- **Purpose**: Builds and deploys iOS app to App Store
- **Trigger**: Push to master branch (when react-native files change) or manual dispatch
- **Features**:
  - Automatic versioning
  - Code signing
  - App Store deployment
  - Manual approval for production

### 3. `terraform-deploy.yml` ⭐ **NEW**
- **Purpose**: Manages infrastructure deployments with staged approval process
- **Trigger**: Manual dispatch only
- **Features**:
  - Plan and apply Terraform changes
  - Staged deployment (staging → production)
  - Environment protection rules
  - Plan artifacts and comments

## Terraform Deployment Workflow

### Setup Requirements

#### 1. GitHub Secrets
Add these secrets to your repository (Settings → Secrets and variables → Actions):

```
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
FIREBASE_ADMIN_SDK_JSON=your_firebase_json_content
```

#### 2. GitHub Environments
Create two environments in your repository (Settings → Environments):

**Staging Environment:**
- Name: `staging`
- Protection rules: Optional (can be enabled for additional security)

**Production Environment:**
- Name: `production`
- Protection rules: **Required reviewers** (add team members who can approve production deployments)

### Usage

#### Manual Deployment

1. **Go to Actions tab** in your GitHub repository
2. **Select "Terraform Deploy"** workflow
3. **Click "Run workflow"**
4. **Configure inputs**:
   - **Action**: `plan` (to see changes) or `apply` (to deploy)
   - **Environment**: `staging` or `production`
   - **Auto approve**: `false` (recommended)

#### Deployment Flow

**For Staging:**
1. Run workflow with `action: plan` and `environment: staging`
2. Review the plan output
3. Run workflow with `action: apply` and `environment: staging`
4. Review the results

**For Production:**
1. **Must deploy to staging first**
2. Run workflow with `action: apply` and `environment: production`
3. **Production deployment requires approval** (if protection rules are enabled)
4. Review and approve the deployment
5. Production infrastructure is deployed

### Workflow Jobs

#### 1. Validate
- Checks Terraform syntax and formatting
- Validates configuration
- Runs on every deployment

#### 2. Plan Staging
- Creates Terraform plan for staging
- Uploads plan as artifact
- Comments plan on pull requests (if applicable)

#### 3. Apply Staging
- Applies changes to staging environment
- Reports outputs (ALB DNS, ECR URL)
- Comments results

#### 4. Plan Production
- **Only runs after staging is successfully applied**
- Creates Terraform plan for production
- Requires production environment approval

#### 5. Apply Production
- Applies changes to production environment
- Reports outputs
- Comments results

### Security Features

- **Environment Protection**: Production requires approval
- **Staged Deployment**: Must deploy to staging before production
- **AWS Credentials**: Uses GitHub secrets for secure credential management
- **Plan Review**: Always shows plan before applying
- **Artifact Storage**: Plans are saved as artifacts for review

### Best Practices

1. **Always plan first**: Use `action: plan` to review changes before applying
2. **Test in staging**: Deploy to staging first to catch issues
3. **Review plans**: Carefully review the Terraform plan output
4. **Use protection rules**: Enable required reviewers for production
5. **Monitor deployments**: Check the workflow logs and comments

### Troubleshooting

#### Common Issues

1. **AWS Credentials Error**
   - Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` secrets are set
   - Ensure AWS credentials have required permissions

2. **Terraform State Error**
   - Run bootstrap configuration first: `cd iac/terraform/bootstrap && terraform apply`
   - Verify S3 buckets and DynamoDB table exist

3. **Environment Protection Error**
   - Ensure you have permission to approve production deployments
   - Check that protection rules are configured correctly

4. **Plan/Apply Fails**
   - Check Terraform configuration syntax
   - Verify all required variables are set
   - Review the workflow logs for specific error messages

#### Useful Commands

```bash
# Check workflow status
gh run list --workflow=terraform-deploy.yml

# Download plan artifacts
gh run download <run-id> --name=staging-plan

# View workflow logs
gh run view <run-id> --log
```

### Integration with Other Workflows

- **Docker Build**: Creates images that are deployed by Terraform
- **iOS CI/CD**: Manages mobile app deployment
- **Terraform Deploy**: Manages infrastructure deployment

All workflows work together to provide a complete CI/CD pipeline for the Guras application. 