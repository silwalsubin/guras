-- Migration: Remove tags column from journal_entries table
-- Description: Tags are no longer used in journal entries. Emotions are now determined by AI analysis.

BEGIN;

-- Drop the tags column from journal_entries table
ALTER TABLE journal_entries DROP COLUMN IF EXISTS tags;

-- Add comment to document the change
COMMENT ON TABLE journal_entries IS 'Stores journal entries with AI-determined emotions. Tags column removed in V11.';

COMMIT;

