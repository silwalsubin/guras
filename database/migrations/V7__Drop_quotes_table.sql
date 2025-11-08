-- Drops the legacy quotes table now that the quotes feature has been removed.
-- Run via Flyway migrate (staging/prod) after deploying commit 94c34ef or newer.

BEGIN;

DROP TABLE IF EXISTS quotes CASCADE;

COMMIT;
