-- -----------------------------------------------------------------------------
-- Script: 2025-11-08-drop-quotes.sql
-- Purpose: Remove all tables and supporting artifacts that powered the quotes
--          microservice. Run this once after deploying the code that removes
--          the quotes feature.
--
-- Usage:
--   psql "$DATABASE_URL" -f server/database/scripts/2025-11-08-drop-quotes.sql
--
-- Notes:
--   * This script assumes a PostgreSQL database.
--   * The operation is irreversible—ensure you have a backup before running it.
-- -----------------------------------------------------------------------------

BEGIN;

-- Remove the primary quotes table if it still exists.
DROP TABLE IF EXISTS quotes CASCADE;

COMMIT;
