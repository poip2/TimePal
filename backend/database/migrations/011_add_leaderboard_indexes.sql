-- 添加好友排行榜查询优化索引
-- 这个迁移文件为好友排行榜功能添加必要的索引以优化查询性能

-- 为用户表的常用排序字段添加索引
CREATE INDEX IF NOT EXISTS idx_users_level_desc ON users(level DESC, experience DESC);
CREATE INDEX IF NOT EXISTS idx_users_experience_desc ON users(experience DESC);
CREATE INDEX IF NOT EXISTS idx_users_coins_desc ON users(coins DESC);
CREATE INDEX IF NOT EXISTS idx_users_gold_desc ON users(gold DESC);
CREATE INDEX IF NOT EXISTS idx_users_tasks_desc ON users(total_tasks_completed DESC);
CREATE INDEX IF NOT EXISTS idx_users_streak_desc ON users(streak_highest DESC);
CREATE INDEX IF NOT EXISTS idx_users_login_streak_desc ON users(login_streak DESC);

-- 为好友关系表添加复合索引以优化好友查询
CREATE INDEX IF NOT EXISTS idx_friendships_status_users ON friendships(status, requester_id, addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_users_status ON friendships(requester_id, addressee_id, status);

-- 添加覆盖索引以优化排行榜查询
CREATE INDEX IF NOT EXISTS idx_users_leaderboard_fields ON users(id, username, avatar_url, level, experience, coins, gold, total_tasks_completed, streak_highest, login_streak, class);
