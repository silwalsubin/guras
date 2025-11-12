-- Migration: V9__Create_journal_entry_emotions_table
-- Description: Create table for storing associations between journal entries and emotions
-- Date: 2025-11-12

CREATE TABLE journal_entry_emotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    emotion_id VARCHAR(50) NOT NULL, -- References emotions from emotions service
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX idx_journal_entry_emotions_journal_entry_id ON journal_entry_emotions(journal_entry_id);
CREATE INDEX idx_journal_entry_emotions_emotion_id ON journal_entry_emotions(emotion_id);

-- Add comment to document the table purpose
COMMENT ON TABLE journal_entry_emotions IS 'Stores associations between journal entries and emotions, enabling multi-emotion tracking per entry';

