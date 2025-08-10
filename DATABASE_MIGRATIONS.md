# Database Migrations with Flyway

This document describes how to set up and run database migrations for the Guras project using Flyway.

## Prerequisites

- **Flyway CLI** installed on your system
  - macOS: `brew install flyway`
  - Windows: Download from [Flyway website](https://flywaydb.org/download)
  - Linux: Follow [installation guide](https://flywaydb.org/documentation/usage/commandline/)

- **Database access** configured for your environment
- **Migrations directory** exists at `database/migrations/`

## Configuration Files

**⚠️ Security Note**: Configuration files containing database credentials are **NOT committed to version control** for security reasons.

### Available Files

- **`flyway.conf.template`** - Template showing configuration structure (safe to commit)
- **`flyway.staging.conf`** - Staging environment config (gitignored, contains real credentials)
- **`flyway.local.conf`** - Local development config (gitignored, contains local credentials)

### Setting Up Configuration

1. **Copy the template** for your environment:
   ```bash
   cp flyway.conf.template flyway.staging.conf
   cp flyway.conf.template flyway.local.conf
   ```

2. **Edit the config file** with your actual database credentials:
   ```bash
   # For staging
   nano flyway.staging.conf
   
   # For local
   nano flyway.local.conf
   ```

3. **Never commit** these files - they're automatically gitignored

## Available Commands

### Setup and Installation

```bash
# Interactive setup guide
./scripts/setup-flyway.sh

# Test database connectivity
./scripts/test-db-connection.sh
```

### Running Migrations

```bash
# Dry run (validate only)
./scripts/migrate.sh staging true
./scripts/migrate.sh local true

# Apply migrations
./scripts/migrate.sh staging false
./scripts/migrate.sh local false
```

### Manual Flyway Commands

```bash
# Using environment-specific config
flyway -configFiles=flyway.staging.conf info
flyway -configFiles=flyway.staging.conf migrate

# Using local config
flyway -configFiles=flyway.local.conf info
flyway -configFiles=flyway.local.conf migrate
```

## Migration File Naming

Migration files must follow Flyway's naming convention:

```
V<version>__<description>.sql
```

Examples:
- `V1__Create_users.sql`
- `V2__Add_user_preferences.sql`
- `V3__Create_meditation_sessions.sql`

## Important Notes

### Security
- **Never commit** configuration files with real credentials
- Use environment variables or secure credential management in production
- The `flyway.*.conf` files are automatically gitignored

### Safety
- Always run `dry run` first to validate migrations
- Test migrations on staging before production
- Keep backups before running migrations

### Best Practices
- Use descriptive migration names
- Test migrations locally first
- Keep migrations small and focused
- Document complex migrations in comments

## Troubleshooting

### Common Issues

1. **"flyway: command not found"**
   - Install Flyway CLI: `brew install flyway`

2. **Connection refused/timeout**
   - Check if your IP is whitelisted in RDS security group
   - Verify database credentials and network access

3. **Migration validation fails**
   - Check SQL syntax in migration files
   - Ensure database user has proper permissions

4. **Silent execution/no output**
   - This usually indicates a connectivity issue
   - Check network access and credentials

### Getting Help

- Run `./scripts/setup-flyway.sh` for guided setup
- Use `./scripts/test-db-connection.sh` to diagnose connectivity
- Check Flyway logs with `-X` flag for debug information

## Additional Resources

- [Flyway Documentation](https://flywaydb.org/documentation/)
- [Flyway Command Line Reference](https://flywaydb.org/documentation/usage/commandline/)
- [PostgreSQL JDBC Driver](https://jdbc.postgresql.org/)
