-- Migration: V6__Create_journal_entries_table
-- Description: Create table for storing user journal entries
-- Date: 2025-10-27

CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Content
    title VARCHAR(255) NOT NULL, -- AI-generated short title
    content TEXT NOT NULL,
    mood VARCHAR(50), -- e.g., 'happy', 'sad', 'anxious', 'calm', 'neutral'
    mood_score INTEGER, -- 1-10 scale for mood intensity
    
    -- Context
    tags TEXT[], -- Array of tags for categorization
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false -- Soft delete support
);

-- Indexes for common queries
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_created_at ON journal_entries(created_at DESC);
CREATE INDEX idx_journal_entries_user_recent ON journal_entries(user_id, created_at DESC);

-- Create updated_at trigger
CREATE TRIGGER update_journal_entries_updated_at 
    BEFORE UPDATE ON journal_entries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment to document the table purpose
COMMENT ON TABLE journal_entries IS 'Stores user journal entries with AI-generated titles and mood tracking';

