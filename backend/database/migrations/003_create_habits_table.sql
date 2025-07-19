-- Create habits table for habit management system
CREATE TABLE IF NOT EXISTS habits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    notes TEXT,
    type VARCHAR(10) NOT NULL CHECK (type IN ('good', 'bad')),
    difficulty VARCHAR(10) DEFAULT 'easy' CHECK (difficulty IN ('trivial', 'easy', 'medium', 'hard')),
    up_count INTEGER DEFAULT 0,
    down_count INTEGER DEFAULT 0,
    counter_up INTEGER DEFAULT 0,
    counter_down INTEGER DEFAULT 0,
    position INTEGER DEFAULT 0,
    is_positive BOOLEAN DEFAULT true,
    is_negative BOOLEAN DEFAULT true,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance optimization
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_type ON habits(type);
CREATE INDEX idx_habits_difficulty ON habits(difficulty);
CREATE INDEX idx_habits_is_archived ON habits(is_archived);
CREATE INDEX idx_habits_created_at ON habits(created_at);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_habits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_habits_updated_at
    BEFORE UPDATE ON habits
    FOR EACH ROW
    EXECUTE FUNCTION update_habits_updated_at();
