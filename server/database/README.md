# Database Maintenance Scripts

This directory stores one-off SQL scripts for maintaining the production and staging
PostgreSQL databases.

## Available scripts

| Script | Purpose |
| --- | --- |
| `scripts/2025-11-08-drop-quotes.sql` | Permanently drops the legacy `quotes` table that powered the retired quotes feature. |

## How to run

1. Ensure you have a recent backup of the target database.
2. Point the `DATABASE_URL` environment variable (or equivalent connection
   settings) at the database you want to update.
3. Execute the script with `psql`:

```bash
psql "$DATABASE_URL" -f server/database/scripts/2025-11-08-drop-quotes.sql
```

4. Verify the table was removed:

```bash
psql "$DATABASE_URL" -c "\dt" | grep quotes || echo "quotes table removed"
```

## Safety notes

- These scripts are destructive; double-check the target environment before
  running them.
- Prefer running the scripts through your existing deployment pipeline or a
  maintenance window if the database serves production traffic.
