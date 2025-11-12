-- Migration: V8__Remove_mood_from_journal_entries
-- Description: Remove mood and mood_score columns from journal_entries table
-- Reason: Emotions are now managed through journal_entry_emotions table with AI analysis
-- Date: 2025-11-12

-- Drop the columns
ALTER TABLE journal_entries
DROP COLUMN IF EXISTS mood,
DROP COLUMN IF EXISTS mood_score;

-- Add comment to document the change
COMMENT ON TABLE journal_entries IS 'Stores user journal entries with AI-generated titles and emotion tracking via journal_entry_emotions table';

