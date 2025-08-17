-- Create audiofiles table to store audio file metadata
-- This table stores metadata for uploaded audio files and their thumbnails

CREATE TABLE audiofiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    description TEXT,
    duration_seconds INTEGER,
    file_size_bytes BIGINT,
    audio_s3_key VARCHAR(500) NOT NULL, -- S3 key for audio file (guid-audio.ext)
    thumbnail_s3_key VARCHAR(500), -- S3 key for thumbnail (guid-thumbnail.ext)
    audio_content_type VARCHAR(100), -- MIME type of audio file
    thumbnail_content_type VARCHAR(100), -- MIME type of thumbnail
    uploaded_by_user_id UUID NOT NULL REFERENCES users(user_id), -- Foreign key to users table
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for better query performance
    CONSTRAINT audiofiles_name_check CHECK (LENGTH(name) > 0),
    CONSTRAINT audiofiles_author_check CHECK (LENGTH(author) > 0)
);

-- Create indexes for common queries
CREATE INDEX idx_audiofiles_uploaded_by_user_id ON audiofiles(uploaded_by_user_id);
CREATE INDEX idx_audiofiles_created_at ON audiofiles(created_at);
CREATE INDEX idx_audiofiles_author ON audiofiles(author);
CREATE INDEX idx_audiofiles_name ON audiofiles(name);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_audiofiles_updated_at 
    BEFORE UPDATE ON audiofiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE audiofiles IS 'Stores metadata for uploaded audio files and their thumbnails';
COMMENT ON COLUMN audiofiles.id IS 'Unique identifier for the audio file record';
COMMENT ON COLUMN audiofiles.name IS 'Display name of the audio file';
COMMENT ON COLUMN audiofiles.author IS 'Author/artist of the audio content';
COMMENT ON COLUMN audiofiles.description IS 'Optional description of the audio content';
COMMENT ON COLUMN audiofiles.duration_seconds IS 'Duration of audio in seconds';
COMMENT ON COLUMN audiofiles.file_size_bytes IS 'Size of audio file in bytes';
COMMENT ON COLUMN audiofiles.audio_s3_key IS 'S3 object key for the audio file (format: guid-audio.ext)';
COMMENT ON COLUMN audiofiles.thumbnail_s3_key IS 'S3 object key for the thumbnail image (format: guid-thumbnail.ext)';
COMMENT ON COLUMN audiofiles.audio_content_type IS 'MIME type of the audio file (e.g., audio/mpeg)';
COMMENT ON COLUMN audiofiles.thumbnail_content_type IS 'MIME type of the thumbnail (e.g., image/jpeg)';
COMMENT ON COLUMN audiofiles.uploaded_by_user_id IS 'Internal user ID from users table';
COMMENT ON COLUMN audiofiles.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN audiofiles.updated_at IS 'Timestamp when the record was last updated';
