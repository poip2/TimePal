-- 插入测试用户数据
-- 密码都是 'password123'，已经用bcrypt加密

INSERT INTO users (username, email, password_hash, level, experience, coins, avatar_url) VALUES
    ('admin', 'admin@timepal.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 10, 1000, 1000, 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'),
    ('testuser1', 'user1@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 5, 500, 500, 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1'),
    ('testuser2', 'user2@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, 300, 300, 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2'),
    ('testuser3', 'user3@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 100, 100, 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3');

-- 更新updated_at字段为当前时间
UPDATE users SET updated_at = CURRENT_TIMESTAMP;
