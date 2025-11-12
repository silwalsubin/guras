-- Migration: V10__Create_emotions_table
-- Description: Create emotions table and seed with predefined emotions
-- Date: 2025-11-12

-- Create emotions table
CREATE TABLE emotions (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on is_active for faster queries
CREATE INDEX idx_emotions_is_active ON emotions(is_active);

-- Seed emotions data
INSERT INTO emotions (id, name, color, is_active, created_at, updated_at) VALUES
('happy', 'Happy', '#10B981', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('calm', 'Calm', '#3B82F6', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('anxious', 'Anxious', '#F59E0B', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sad', 'Sad', '#8B5CF6', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('excited', 'Excited', '#FBBF24', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('angry', 'Angry', '#EF4444', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Verify the insertions
SELECT id, name, color, is_active FROM emotions ORDER BY name;

