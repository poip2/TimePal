-- 创建每日任务表
CREATE TABLE IF NOT EXISTS dailies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    notes TEXT,
    difficulty VARCHAR(10) DEFAULT 'easy' CHECK (difficulty IN ('trivial', 'easy', 'medium', 'hard')),
    repeat_type VARCHAR(10) DEFAULT 'daily' CHECK (repeat_type IN ('daily', 'weekly', 'monthly', 'yearly')),
    repeat_days JSONB DEFAULT '[]',
    start_date DATE DEFAULT CURRENT_DATE,
    every_x INTEGER DEFAULT 1 CHECK (every_x > 0),
    streak INTEGER DEFAULT 0 CHECK (streak >= 0),
    longest_streak INTEGER DEFAULT 0 CHECK (longest_streak >= 0),
    is_completed BOOLEAN DEFAULT false,
    last_completed_date DATE,
    reminder_time TIME,
    position INTEGER DEFAULT 0,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_dailies_user_id ON dailies(user_id);
CREATE INDEX IF NOT EXISTS idx_dailies_user_active ON dailies(user_id, is_archived) WHERE is_archived = false;
CREATE INDEX IF NOT EXISTS idx_dailies_completed ON dailies(user_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_dailies_streak ON dailies(user_id, streak DESC);

-- 创建更新时间戳的触发器
CREATE OR REPLACE FUNCTION update_dailies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_dailies_updated_at
    BEFORE UPDATE ON dailies
    FOR EACH ROW
    EXECUTE FUNCTION update_dailies_updated_at();
