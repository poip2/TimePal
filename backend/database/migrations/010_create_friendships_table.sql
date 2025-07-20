-- PostgreSQL: 创建好友关系表

-- 创建好友关系表
CREATE TABLE IF NOT EXISTS friendships (
    id SERIAL PRIMARY KEY,
    requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    addressee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(requester_id, addressee_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_friendships_requester_id ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee_id ON friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);
CREATE INDEX IF NOT EXISTS idx_friendships_created_at ON friendships(created_at DESC);

-- 创建复合索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_friendships_users ON friendships(requester_id, addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_reverse_users ON friendships(addressee_id, requester_id);

-- 创建更新时间触发器
CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 添加表注释
COMMENT ON TABLE friendships IS '好友关系表，存储用户之间的好友关系';
COMMENT ON COLUMN friendships.id IS '好友关系唯一标识';
COMMENT ON COLUMN friendships.requester_id IS '发起好友请求的用户ID';
COMMENT ON COLUMN friendships.addressee_id IS '接收好友请求的用户ID';
COMMENT ON COLUMN friendships.status IS '好友关系状态：pending(待处理), accepted(已接受), blocked(已屏蔽)';
COMMENT ON COLUMN friendships.created_at IS '记录创建时间';
COMMENT ON COLUMN friendships.updated_at IS '记录更新时间';

-- 添加约束检查，确保用户不能与自己建立好友关系
ALTER TABLE friendships ADD CONSTRAINT check_not_self_friend CHECK (requester_id != addressee_id);
