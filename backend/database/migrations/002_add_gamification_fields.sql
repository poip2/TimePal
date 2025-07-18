-- Migration: Add gamification fields to users table
-- Created at: 2025-07-18
-- Purpose: Add game-like attributes to users for habit tracking gamification

BEGIN;

-- Add gamification fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS experience_to_next INTEGER NOT NULL DEFAULT 100,
ADD COLUMN IF NOT EXISTS health INTEGER NOT NULL DEFAULT 50 CHECK (health >= 0),
ADD COLUMN IF NOT EXISTS max_health INTEGER NOT NULL DEFAULT 50 CHECK (max_health > 0),
ADD COLUMN IF NOT EXISTS mana INTEGER NOT NULL DEFAULT 10 CHECK (mana >= 0),
ADD COLUMN IF NOT EXISTS max_mana INTEGER NOT NULL DEFAULT 10 CHECK (max_mana > 0),
ADD COLUMN IF NOT EXISTS gold INTEGER NOT NULL DEFAULT 0 CHECK (gold >= 0),
ADD COLUMN IF NOT EXISTS class VARCHAR(20) NOT NULL DEFAULT 'warrior' CHECK (class IN ('warrior', 'mage', 'rogue', 'healer')),
ADD COLUMN IF NOT EXISTS class_points INTEGER NOT NULL DEFAULT 0 CHECK (class_points >= 0),
ADD COLUMN IF NOT EXISTS strength INTEGER NOT NULL DEFAULT 0 CHECK (strength >= 0),
ADD COLUMN IF NOT EXISTS intelligence INTEGER NOT NULL DEFAULT 0 CHECK (intelligence >= 0),
ADD COLUMN IF NOT EXISTS constitution INTEGER NOT NULL DEFAULT 0 CHECK (constitution >= 0),
ADD COLUMN IF NOT EXISTS perception INTEGER NOT NULL DEFAULT 0 CHECK (perception >= 0),
ADD COLUMN IF NOT EXISTS total_tasks_completed INTEGER NOT NULL DEFAULT 0 CHECK (total_tasks_completed >= 0),
ADD COLUMN IF NOT EXISTS streak_highest INTEGER NOT NULL DEFAULT 0 CHECK (streak_highest >= 0),
ADD COLUMN IF NOT EXISTS login_streak INTEGER NOT NULL DEFAULT 0 CHECK (login_streak >= 0);

-- Create index on class for potential queries by class type
CREATE INDEX IF NOT EXISTS idx_users_class ON users(class);

-- Create index on total_tasks_completed for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_users_total_tasks ON users(total_tasks_completed DESC);

-- Create index on streak fields for streak-based queries
CREATE INDEX IF NOT EXISTS idx_users_streaks ON users(streak_highest DESC, login_streak DESC);

-- Ensure health and mana don't exceed their maximum values
-- This check is handled at application level, but we can add a trigger for extra safety

CREATE OR REPLACE FUNCTION check_health_mana_limits()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.health > NEW.max_health THEN
        NEW.health := NEW.max_health;
    END IF;

    IF NEW.mana > NEW.max_mana THEN
        NEW.mana := NEW.max_mana;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_health_mana_limits
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION check_health_mana_limits();

COMMIT;
