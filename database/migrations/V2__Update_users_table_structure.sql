-- Migration: V2__Update_users_table_structure
-- Description: Update users table structure to match UserRecord class
-- Date: 2024-12-19

-- Add new columns that match UserRecord class
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_user_id VARCHAR(255);

-- Update existing data: set firebase_user_id to the old id value
UPDATE users SET firebase_user_id = id WHERE firebase_user_id IS NULL;

-- Update existing data: set name to the old display_name value
UPDATE users SET name = display_name WHERE name IS NULL;

-- Generate UUIDs for existing records
UPDATE users SET user_id = gen_random_uuid() WHERE user_id IS NULL;

-- Make user_id NOT NULL after populating it
ALTER TABLE users ALTER COLUMN user_id SET NOT NULL;

-- Drop old columns
ALTER TABLE users DROP COLUMN IF EXISTS id;
ALTER TABLE users DROP COLUMN IF EXISTS display_name;
ALTER TABLE users DROP COLUMN IF EXISTS photo_url;

-- Drop old indexes
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_created_at;

-- Recreate indexes with correct column names
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_firebase_user_id ON users(firebase_user_id);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Add primary key constraint on user_id
ALTER TABLE users ADD CONSTRAINT pk_users_user_id PRIMARY KEY (user_id);

-- Add unique constraint on firebase_user_id
ALTER TABLE users ADD CONSTRAINT uk_users_firebase_user_id UNIQUE (firebase_user_id);

-- Update table comment
COMMENT ON TABLE users IS 'Stores user information with UUID primary key and Firebase integration';
