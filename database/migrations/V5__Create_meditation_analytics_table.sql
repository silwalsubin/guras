-- Migration: V5__Create_meditation_analytics_table
-- Description: Create table for tracking meditation session analytics and user patterns
-- Date: 2025-10-27
-- Purpose: Store detailed analytics for AI-powered personalized meditation recommendations

CREATE TABLE meditation_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    
    -- Session Details
    session_title VARCHAR(255),
    teacher_id UUID REFERENCES teachers(id),
    teacher_name VARCHAR(255),
    music_id UUID, -- Reference to audiofiles table if applicable
    music_name VARCHAR(255),
    
    -- Timing Information
    session_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    session_end_time TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER, -- Actual duration completed
    planned_duration_seconds INTEGER, -- Planned duration
    
    -- Session Metadata
    meditation_theme VARCHAR(100), -- e.g., 'mindfulness', 'sleep', 'stress-relief'
    difficulty_level VARCHAR(50), -- e.g., 'beginner', 'intermediate', 'advanced'
    is_program_session BOOLEAN DEFAULT false,
    program_id UUID,
    program_day INTEGER,
    
    -- Completion Status
    completed BOOLEAN DEFAULT false,
    completion_percentage INTEGER DEFAULT 0, -- 0-100
    
    -- Emotional State Tracking
    emotional_state_before VARCHAR(50), -- e.g., 'stressed', 'anxious', 'neutral', 'happy'
    emotional_state_before_score INTEGER, -- 1-10 scale
    emotional_state_after VARCHAR(50),
    emotional_state_after_score INTEGER, -- 1-10 scale
    
    -- User Feedback
    user_rating INTEGER, -- 1-5 stars
    user_notes TEXT,
    
    -- Environmental Context
    time_of_day VARCHAR(50), -- 'morning', 'afternoon', 'evening', 'night'
    day_of_week VARCHAR(20), -- 'monday', 'tuesday', etc.
    
    -- Engagement Metrics
    paused_count INTEGER DEFAULT 0,
    total_pause_duration_seconds INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for optimal query performance
CREATE INDEX idx_meditation_analytics_user_id ON meditation_analytics(user_id);
CREATE INDEX idx_meditation_analytics_session_id ON meditation_analytics(session_id);
CREATE INDEX idx_meditation_analytics_teacher_id ON meditation_analytics(teacher_id);
CREATE INDEX idx_meditation_analytics_session_start_time ON meditation_analytics(session_start_time);
CREATE INDEX idx_meditation_analytics_completed ON meditation_analytics(completed);
CREATE INDEX idx_meditation_analytics_user_session_time ON meditation_analytics(user_id, session_start_time DESC);
CREATE INDEX idx_meditation_analytics_user_teacher ON meditation_analytics(user_id, teacher_id);
CREATE INDEX idx_meditation_analytics_time_of_day ON meditation_analytics(time_of_day);
CREATE INDEX idx_meditation_analytics_difficulty ON meditation_analytics(difficulty_level);
CREATE INDEX idx_meditation_analytics_theme ON meditation_analytics(meditation_theme);

-- Create composite index for common queries (user's recent sessions)
CREATE INDEX idx_meditation_analytics_user_recent ON meditation_analytics(user_id, session_start_time DESC, completed);

-- Create updated_at trigger
CREATE TRIGGER update_meditation_analytics_updated_at 
    BEFORE UPDATE ON meditation_analytics 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE meditation_analytics IS 'Stores detailed analytics for each meditation session to enable AI-powered personalized recommendations';
COMMENT ON COLUMN meditation_analytics.id IS 'Unique identifier for the analytics record';
COMMENT ON COLUMN meditation_analytics.user_id IS 'Reference to the user who completed the session';
COMMENT ON COLUMN meditation_analytics.session_id IS 'Unique identifier for the meditation session';
COMMENT ON COLUMN meditation_analytics.session_start_time IS 'When the meditation session started';
COMMENT ON COLUMN meditation_analytics.session_end_time IS 'When the meditation session ended';
COMMENT ON COLUMN meditation_analytics.duration_seconds IS 'Actual duration of meditation completed in seconds';
COMMENT ON COLUMN meditation_analytics.planned_duration_seconds IS 'Originally planned duration in seconds';
COMMENT ON COLUMN meditation_analytics.meditation_theme IS 'Theme/category of meditation (mindfulness, sleep, stress-relief, etc.)';
COMMENT ON COLUMN meditation_analytics.difficulty_level IS 'Difficulty level of the session (beginner, intermediate, advanced)';
COMMENT ON COLUMN meditation_analytics.completed IS 'Whether the user completed the full session';
COMMENT ON COLUMN meditation_analytics.completion_percentage IS 'Percentage of session completed (0-100)';
COMMENT ON COLUMN meditation_analytics.emotional_state_before IS 'User''s emotional state before meditation';
COMMENT ON COLUMN meditation_analytics.emotional_state_before_score IS 'Numerical score of emotional state before (1-10)';
COMMENT ON COLUMN meditation_analytics.emotional_state_after IS 'User''s emotional state after meditation';
COMMENT ON COLUMN meditation_analytics.emotional_state_after_score IS 'Numerical score of emotional state after (1-10)';
COMMENT ON COLUMN meditation_analytics.user_rating IS 'User''s rating of the session (1-5 stars)';
COMMENT ON COLUMN meditation_analytics.user_notes IS 'Optional notes from the user about the session';
COMMENT ON COLUMN meditation_analytics.time_of_day IS 'Time period when session occurred (morning, afternoon, evening, night)';
COMMENT ON COLUMN meditation_analytics.day_of_week IS 'Day of week when session occurred';
COMMENT ON COLUMN meditation_analytics.paused_count IS 'Number of times user paused during session';
COMMENT ON COLUMN meditation_analytics.total_pause_duration_seconds IS 'Total time spent paused during session';
COMMENT ON COLUMN meditation_analytics.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN meditation_analytics.updated_at IS 'Timestamp when the record was last updated';

