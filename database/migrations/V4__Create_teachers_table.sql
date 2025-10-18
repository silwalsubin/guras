-- Migration: V4__Create_teachers_table
-- Description: Create table for storing spiritual teachers information
-- Date: 2025-01-21

CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    birth_year INTEGER,
    death_year INTEGER,
    nationality VARCHAR(100),
    description TEXT,
    tradition_name VARCHAR(255),
    tradition_description TEXT,
    tradition_origin VARCHAR(100),
    era VARCHAR(50),
    avatar_url TEXT,
    background_url TEXT,
    core_teachings TEXT[], -- Array of core teachings
    teaching_approach VARCHAR(50), -- direct, gentle, inspiring, etc.
    teaching_tone VARCHAR(50), -- playful, serious, passionate, etc.
    teaching_focus VARCHAR(100), -- meditation, philosophy, service, etc.
    teaching_complexity VARCHAR(20), -- beginner, intermediate, advanced
    personality_traits TEXT[], -- Array of personality traits
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_teachers_name ON teachers(name);
CREATE INDEX idx_teachers_display_name ON teachers(display_name);
CREATE INDEX idx_teachers_is_active ON teachers(is_active);
CREATE INDEX idx_teachers_teaching_focus ON teachers(teaching_focus);
CREATE INDEX idx_teachers_teaching_complexity ON teachers(teaching_complexity);
CREATE INDEX idx_teachers_created_at ON teachers(created_at);

-- Create updated_at trigger
CREATE TRIGGER update_teachers_updated_at 
    BEFORE UPDATE ON teachers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add constraints
ALTER TABLE teachers ADD CONSTRAINT teachers_name_check CHECK (LENGTH(name) > 0);
ALTER TABLE teachers ADD CONSTRAINT teachers_display_name_check CHECK (LENGTH(display_name) > 0);
ALTER TABLE teachers ADD CONSTRAINT teachers_birth_year_check CHECK (birth_year IS NULL OR birth_year > 0);
ALTER TABLE teachers ADD CONSTRAINT teachers_death_year_check CHECK (death_year IS NULL OR death_year > 0);
ALTER TABLE teachers ADD CONSTRAINT teachers_era_check CHECK (birth_year IS NULL OR death_year IS NULL OR death_year >= birth_year);

-- Add comments for documentation
COMMENT ON TABLE teachers IS 'Stores information about spiritual teachers and their teaching styles';
COMMENT ON COLUMN teachers.id IS 'Unique identifier for the teacher record';
COMMENT ON COLUMN teachers.name IS 'Unique identifier name (e.g., osho, buddha)';
COMMENT ON COLUMN teachers.display_name IS 'Display name for UI (e.g., Osho, Buddha)';
COMMENT ON COLUMN teachers.full_name IS 'Full formal name (e.g., Bhagwan Shree Rajneesh)';
COMMENT ON COLUMN teachers.birth_year IS 'Year of birth';
COMMENT ON COLUMN teachers.death_year IS 'Year of death (NULL if still alive)';
COMMENT ON COLUMN teachers.nationality IS 'Nationality or origin country';
COMMENT ON COLUMN teachers.description IS 'Brief description of the teacher';
COMMENT ON COLUMN teachers.tradition_name IS 'Spiritual tradition name (e.g., Zen Buddhism)';
COMMENT ON COLUMN teachers.tradition_description IS 'Description of the spiritual tradition';
COMMENT ON COLUMN teachers.tradition_origin IS 'Origin country of the tradition';
COMMENT ON COLUMN teachers.era IS 'Era or time period (e.g., 1931-1990)';
COMMENT ON COLUMN teachers.avatar_url IS 'URL to teacher avatar image';
COMMENT ON COLUMN teachers.background_url IS 'URL to background image';
COMMENT ON COLUMN teachers.core_teachings IS 'Array of core teachings';
COMMENT ON COLUMN teachers.teaching_approach IS 'Teaching approach style';
COMMENT ON COLUMN teachers.teaching_tone IS 'Teaching tone and communication style';
COMMENT ON COLUMN teachers.teaching_focus IS 'Primary focus area of teaching';
COMMENT ON COLUMN teachers.teaching_complexity IS 'Complexity level of teachings';
COMMENT ON COLUMN teachers.personality_traits IS 'Array of personality traits';
COMMENT ON COLUMN teachers.is_active IS 'Whether the teacher is active and available';
COMMENT ON COLUMN teachers.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN teachers.updated_at IS 'Timestamp when the record was last updated';
