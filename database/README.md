# Database Migrations

This folder contains database migrations and scripts for the Guras application.

## Structure

```
database/
├── migrations/          # Flyway migration scripts
├── flyway.conf         # Flyway configuration
└── README.md           # This file
```

## Migration Naming Convention

Flyway migrations follow the pattern: `V{version}__{description}.sql`

- **V1__Create_user_notification_preferences.sql** - Creates the first table
- **V2__Add_user_sessions.sql** - Future migration example
- **V3__Update_notification_schema.sql** - Future migration example

## Running Migrations

### CodeBuild Execution (Recommended)

Migrations are executed via AWS CodeBuild, which provides:
- **VPC Access**: Direct connection to RDS without IP whitelisting
- **Security**: Runs in your AWS environment with proper IAM roles
- **Cost-Effective**: Free tier covers most use cases
- **Reliability**: No network connectivity issues

### GitHub Actions

Migrations are triggered via GitHub Actions workflow dispatch:
1. **Manual Trigger**: Go to Actions → Database Migrations → Run workflow
2. **Environment Selection**: Choose staging or production
3. **CodeBuild Integration**: GitHub Actions triggers CodeBuild project
4. **Real-time Monitoring**: Watch progress in both GitHub and AWS Console

#### Environment Protection

The workflow includes environment protection similar to the terraform-deploy workflow:

- **Staging**: Runs on manual trigger (with staging environment protection)
- **Production**: Runs only on manual trigger with production environment protection
- **Environment Approvals**: Each environment can have required reviewers and deployment restrictions

### Local Development

1. Install Flyway CLI: https://flywaydb.org/download
2. Set environment variables for database connection
3. Run: `flyway -configFiles=database/flyway.conf migrate`

**Note**: Local execution requires IP whitelisting in RDS security groups

## Environment Variables

Both GitHub Actions and CodeBuild automatically retrieve database credentials from AWS Secrets Manager:

- **Secret Name**: `guras/db-credentials`
- **Structure**: Matches the server's `DbConfiguration` class
- **Fields**: `ServerName`, `Port`, `DatabaseName`, `UserName`, `Password`

### CodeBuild Environment Variables

CodeBuild receives these additional variables:
- **ENVIRONMENT**: Set to staging/production based on workflow input
- **AWS_REGION**: Set to us-east-1
- **Database credentials**: Retrieved from Secrets Manager during build

## Current Tables

### users

Stores basic user information from Firebase authentication.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(255) | Primary key, Firebase UID |
| email | VARCHAR(255) | User's email address (unique) |
| display_name | VARCHAR(255) | User's display name |
| photo_url | TEXT | URL to user's profile photo |
| created_at | TIMESTAMP | When user account was created |
| updated_at | TIMESTAMP | When user record was last updated |

## Adding New Migrations

1. Create a new SQL file in `migrations/` folder
2. Follow naming convention: `V{next_version}__{description}.sql`
3. Test locally if possible
4. Push to trigger automatic migration
5. Or manually trigger via GitHub Actions

## Rollback Strategy

Flyway Community Edition doesn't support automatic rollbacks. For rollbacks:

1. Create a new migration that reverses the changes
2. Use `V{version}__Rollback_{description}.sql` naming
3. Test thoroughly before applying to production

## Best Practices

- Always test migrations on staging first
- Use descriptive migration names
- Include comments explaining complex SQL
- Test rollback scenarios
- Keep migrations atomic (one logical change per migration)
- Use placeholders for environment-specific values
