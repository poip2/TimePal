const request = require('supertest');
const app = require('../../src/server');
const { sequelize, User, Party, PartyMember, PartyInvitation } = require('../../src/models');

describe('Party System Integration Tests', () => {
  let authToken;
  let testUser;
  let testUser2;

  beforeAll(async () => {
    // 同步数据库
    await sequelize.sync({ force: true });

    // 创建测试用户 - 使用明文密码，让User模型的beforeCreate钩子处理哈希
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: 'password',
      level: 10
    });

    testUser2 = await User.create({
      username: 'testuser2',
      email: 'test2@example.com',
      passwordHash: 'password',
      level: 5
    });

    // 获取认证token
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password'
      });

    authToken = res.body.data?.token || res.body.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // 清理测试数据
    await PartyInvitation.destroy({ where: {} });
    await PartyMember.destroy({ where: {} });
    await Party.destroy({ where: {} });
  });

  describe('POST /api/parties', () => {
    it('should create a new party', async () => {
      const partyData = {
        name: 'Test Party',
        description: 'A test party for testing',
        privacy: 'public',
        maxMembers: 4
      };

      const res = await request(app)
        .post('/api/parties')
        .set('Authorization', `Bearer ${authToken}`)
        .send(partyData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Test Party');
      expect(res.body.data.leaderId).toBe(testUser.id);
    });

    it('should fail if user already has a party', async () => {
      // 先创建一个队伍
      await Party.create({
        name: 'Existing Party',
        leaderId: testUser.id,
        privacy: 'public'
      });

      const res = await request(app)
        .post('/api/parties')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'New Party',
          privacy: 'public'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/parties/my-parties', () => {
    it('should get user parties', async () => {
      // 创建一个队伍并添加用户
      const party = await Party.create({
        name: 'Test Party',
        leaderId: testUser.id,
        privacy: 'public'
      });

      await PartyMember.create({
        partyId: party.id,
        userId: testUser.id,
        role: 'leader'
      });

      const res = await request(app)
        .get('/api/parties/my-parties')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Test Party');
    });
  });

  describe('GET /api/parties/public', () => {
    it('should get public parties', async () => {
      await Party.create({
        name: 'Public Party 1',
        leaderId: testUser.id,
        privacy: 'public'
      });

      await Party.create({
        name: 'Public Party 2',
        leaderId: testUser2.id,
        privacy: 'public'
      });

      const res = await request(app)
        .get('/api/parties/public')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });
  });

  describe('GET /api/parties/:id', () => {
    it('should get party details', async () => {
      const party = await Party.create({
        name: 'Test Party',
        leaderId: testUser.id,
        privacy: 'public'
      });

      const res = await request(app)
        .get(`/api/parties/${party.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Test Party');
    });

    it('should fail for private party if not member', async () => {
      const party = await Party.create({
        name: 'Private Party',
        leaderId: testUser2.id,
        privacy: 'private'
      });

      const res = await request(app)
        .get(`/api/parties/${party.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/parties/:id', () => {
    it('should update party information', async () => {
      const party = await Party.create({
        name: 'Old Name',
        leaderId: testUser.id,
        privacy: 'public'
      });

      const res = await request(app)
        .put(`/api/parties/${party.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'New Name',
          description: 'Updated description'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('New Name');
    });

    it('should fail if not party leader', async () => {
      const party = await Party.create({
        name: 'Test Party',
        leaderId: testUser2.id,
        privacy: 'public'
      });

      const res = await request(app)
        .put(`/api/parties/${party.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'New Name'
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/parties/:id/join', () => {
    it('should allow joining public party', async () => {
      const party = await Party.create({
        name: 'Public Party',
        leaderId: testUser2.id,
        privacy: 'public'
      });

      const res = await request(app)
        .post(`/api/parties/${party.id}/join`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail joining private party', async () => {
      const party = await Party.create({
        name: 'Private Party',
        leaderId: testUser2.id,
        privacy: 'private'
      });

      const res = await request(app)
        .post(`/api/parties/${party.id}/join`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/parties/:id/invite', () => {
    it('should send invitation successfully', async () => {
      const party = await Party.create({
        name: 'Test Party',
        leaderId: testUser.id,
        privacy: 'public'
      });

      await PartyMember.create({
        partyId: party.id,
        userId: testUser.id,
        role: 'leader'
      });

      const res = await request(app)
        .post(`/api/parties/${party.id}/invite`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: testUser2.id,
          message: 'Join my party!'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.invitee_id).toBe(testUser2.id);
    });
  });

  describe('POST /api/parties/invitations/:invitationId/accept', () => {
    it('should accept invitation successfully', async () => {
      const party = await Party.create({
        name: 'Test Party',
        leaderId: testUser.id,
        privacy: 'public'
      });

      const invitation = await PartyInvitation.create({
        partyId: party.id,
        inviterId: testUser.id,
        inviteeId: testUser2.id,
        status: 'pending'
      });

      // 使用第二个用户的token
      const res2 = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test2@example.com',
          password: 'password'
        });

      const token2 = res2.body.data?.token || res2.body.token;

      const res = await request(app)
        .post(`/api/parties/invitations/${invitation.id}/accept`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/parties/:id/leave', () => {
    it('should allow member to leave party', async () => {
      const party = await Party.create({
        name: 'Test Party',
        leaderId: testUser2.id,
        privacy: 'public'
      });

      await PartyMember.create({
        partyId: party.id,
        userId: testUser.id,
        role: 'member'
      });

      const res = await request(app)
        .post(`/api/parties/${party.id}/leave`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should prevent leader from leaving', async () => {
      const party = await Party.create({
        name: 'Test Party',
        leaderId: testUser.id,
        privacy: 'public'
      });

      await PartyMember.create({
        partyId: party.id,
        userId: testUser.id,
        role: 'leader'
      });

      const res = await request(app)
        .post(`/api/parties/${party.id}/leave`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
