-- PostgreSQL: 创建队伍系统相关表

-- 创建队伍表
CREATE TABLE IF NOT EXISTS parties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    leader_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    privacy VARCHAR(10) DEFAULT 'private' CHECK (privacy IN ('private', 'public', 'invite_only')),
    max_members INTEGER DEFAULT 4 CHECK (max_members >= 1 AND max_members <= 4),
    image_url VARCHAR(255),
    stats JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建队伍成员表
CREATE TABLE IF NOT EXISTS party_members (
    id SERIAL PRIMARY KEY,
    party_id INTEGER REFERENCES parties(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('leader', 'admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    permissions JSONB DEFAULT '{}',
    UNIQUE(party_id, user_id)
);

-- 创建队伍邀请表
CREATE TABLE IF NOT EXISTS party_invitations (
    id SERIAL PRIMARY KEY,
    party_id INTEGER REFERENCES parties(id) ON DELETE CASCADE,
    inviter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    invitee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    message TEXT,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(party_id, invitee_id)
);

-- 创建队伍聊天记录表
CREATE TABLE IF NOT EXISTS party_messages (
    id SERIAL PRIMARY KEY,
    party_id INTEGER REFERENCES parties(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'announcement')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建队伍活动记录表
CREATE TABLE IF NOT EXISTS party_activities (
    id SERIAL PRIMARY KEY,
    party_id INTEGER REFERENCES parties(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_parties_leader_id ON parties(leader_id);
CREATE INDEX IF NOT EXISTS idx_parties_privacy ON parties(privacy);
CREATE INDEX IF NOT EXISTS idx_parties_created_at ON parties(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_party_members_party_id ON party_members(party_id);
CREATE INDEX IF NOT EXISTS idx_party_members_user_id ON party_members(user_id);
CREATE INDEX IF NOT EXISTS idx_party_members_role ON party_members(role);

CREATE INDEX IF NOT EXISTS idx_party_invitations_party_id ON party_invitations(party_id);
CREATE INDEX IF NOT EXISTS idx_party_invitations_invitee_id ON party_invitations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_party_invitations_status ON party_invitations(status);

CREATE INDEX IF NOT EXISTS idx_party_messages_party_id ON party_messages(party_id);
CREATE INDEX IF NOT EXISTS idx_party_messages_user_id ON party_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_party_messages_created_at ON party_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_party_activities_party_id ON party_activities(party_id);
CREATE INDEX IF NOT EXISTS idx_party_activities_user_id ON party_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_party_activities_created_at ON party_activities(created_at DESC);

-- 创建更新时间触发器
CREATE TRIGGER update_parties_updated_at BEFORE UPDATE ON parties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_party_invitations_updated_at BEFORE UPDATE ON party_invitations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 添加表注释
COMMENT ON TABLE parties IS '队伍表，存储队伍基本信息';
COMMENT ON COLUMN parties.name IS '队伍名称';
COMMENT ON COLUMN parties.description IS '队伍描述';
COMMENT ON COLUMN parties.leader_id IS '队长用户ID';
COMMENT ON COLUMN parties.privacy IS '隐私设置：private,public,invite_only';
COMMENT ON COLUMN parties.max_members IS '最大成员数4';
COMMENT ON COLUMN parties.image_url IS '队伍头像URL';
COMMENT ON COLUMN parties.stats IS '队伍统计信息JSON对象';

COMMENT ON TABLE party_members IS '队伍成员表';
COMMENT ON COLUMN party_members.party_id IS '队伍ID';
COMMENT ON COLUMN party_members.user_id IS '用户ID';
COMMENT ON COLUMN party_members.role IS '成员角色：leader,admin,member';
COMMENT ON COLUMN party_members.permissions IS '成员权限JSON对象';

COMMENT ON TABLE party_invitations IS '队伍邀请表';
COMMENT ON COLUMN party_invitations.status IS '邀请状态：pending,accepted,declined,expired';
COMMENT ON COLUMN party_invitations.expires_at IS '邀请过期时间，默认7天后';

COMMENT ON TABLE party_messages IS '队伍聊天记录表';
COMMENT ON COLUMN party_messages.message_type IS '消息类型：text,system,announcement';

COMMENT ON TABLE party_activities IS '队伍活动记录表';
COMMENT ON COLUMN party_activities.activity_type IS '活动类型：join,leave,create,level_up等';
COMMENT ON COLUMN party_activities.metadata IS '活动元数据JSON对象';
