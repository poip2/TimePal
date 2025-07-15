const request = require('supertest');
const app = require('../../src/server');
const { User } = require('../../src/models');
const { Sequelize } = require('sequelize');

// 使用SQLite内存数据库进行测试
const sequelize = new Sequelize('sqlite::memory:', {
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  }
});

// 重新初始化模型
User.init({
  username: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    validate: {
      len: [3, 50]
    }
  },
  email: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  passwordHash: {
    type: Sequelize.STRING,
    allowNull: false
  },
  avatarUrl: {
    type: Sequelize.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  level: {
    type: Sequelize.INTEGER,
    defaultValue: 1
  },
  experience: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  coins: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.passwordHash && !user.passwordHash.startsWith('$2')) {
        const bcrypt = require('bcryptjs');
        user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
      }
    }
  }
});

// 添加密码验证方法
User.prototype.validatePassword = async function (password) {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(password, this.passwordHash);
};

// 测试数据库配置
beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

beforeEach(async () => {
  await User.destroy({ where: {} });
});

describe('用户认证API测试', () => {
  describe('POST /api/auth/register', () => {
    it('应该成功注册新用户', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe('testuser');
      expect(response.body.data.token).toBeDefined();
    });

    it('应该拒绝重复的用户名', async () => {
      await User.create({
        username: 'testuser',
        email: 'test1@example.com',
        passwordHash: 'password123'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test2@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('应该拒绝重复的邮箱', async () => {
      await User.create({
        username: 'testuser1',
        email: 'test@example.com',
        passwordHash: 'password123'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser2',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('应该拒绝无效的邮箱格式', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'invalid-email',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('应该拒绝过短的用户名', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'ab',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('应该拒绝过短的密码', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'password123'
      });
    });

    it('应该成功登录用户', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.token).toBeDefined();
    });

    it('应该拒绝错误的密码', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('应该拒绝不存在的用户', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('应该拒绝无效的邮箱格式', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    let token;
    let user;

    beforeEach(async () => {
      user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'password123'
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      token = loginResponse.body.data.token;
    });

    it('应该获取当前用户信息', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('应该拒绝无效的令牌', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('应该拒绝缺失的令牌', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/auth/profile', () => {
    let token;
    let user;

    beforeEach(async () => {
      user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'password123'
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      token = loginResponse.body.data.token;
    });

    it('应该更新用户名', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'newusername'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe('newusername');
    });

    it('应该更新头像URL', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          avatarUrl: 'https://example.com/avatar.jpg'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.avatarUrl).toBe('https://example.com/avatar.jpg');
    });

    it('应该拒绝重复的用户名', async () => {
      await User.create({
        username: 'existinguser',
        email: 'existing@example.com',
        passwordHash: 'password123'
      });

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'existinguser'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('应该拒绝无效的用户名格式', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'ab'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});

describe('密码加密测试', () => {
  it('应该正确加密和验证密码', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: 'password123'
    });

    const isValid = await user.validatePassword('password123');
    expect(isValid).toBe(true);

    const isInvalid = await user.validatePassword('wrongpassword');
    expect(isInvalid).toBe(false);
  });
});

describe('JWT令牌测试', () => {
  it('应该生成有效的JWT令牌', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: 'password123'
    });

    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    expect(decoded.userId).toBe(user.id);
  });
});
