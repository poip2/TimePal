const { Party, PartyMember, PartyInvitation, PartyMessage, PartyActivity, User } = require('../models');
const { Op } = require('sequelize');

class PartyService {
  /**
   * 创建新队伍
   */
  async createParty(userId, partyData) {
    const { name, description, privacy = 'private', maxMembers = 4, imageUrl = null } = partyData;

    // 检查用户是否已创建队伍
    const existingParty = await Party.findOne({ where: { leader_id: userId } });
    if (existingParty) {
      throw new Error('User already has a created party');
    }

    const party = await Party.create({
      name,
      description,
      leaderId: userId,
      privacy,
      maxMembers: maxMembers,
      imageUrl: imageUrl
    });

    // 自动将创建者添加为队长
    await PartyMember.create({
      partyId: party.id,
      userId: userId,
      role: 'leader',
      permissions: {
        canInvite: true,
        canKick: true,
        canEditParty: true,
        canManageMessages: true,
        canStartQuests: true
      }
    });

    // 记录活动
    await PartyActivity.logActivity(
      party.id,
      userId,
      'party_created',
      `${party.name} 队伍已创建`,
      { partyName: party.name }
    );

    // 更新队伍统计
    await party.updateStats();

    return await Party.findByPk(party.id, {
      include: [{
        model: User,
        as: 'leader',
        attributes: ['id', 'username', 'avatarUrl']
      }, {
        model: PartyMember,
        as: 'partyMembers',
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatarUrl', 'level']
        }]
      }]
    });
  }

  /**
   * 获取用户相关的所有队伍
   */
  async getUserParties(userId) {
    return await Party.findUserParties(userId);
  }

  /**
   * 获取用户创建的队伍
   */
  async getUserCreatedParties(userId) {
    return await Party.findUserCreatedParties(userId);
  }

  /**
   * 获取公开队伍列表
   */
  async getPublicParties(options = {}) {
    return await Party.findPublicParties(options);
  }

  /**
   * 搜索队伍
   */
  async searchParties(query, options = {}) {
    return await Party.searchParties(query, options);
  }

  /**
   * 获取队伍详情
   */
  async getPartyDetails(partyId, userId = null) {
    const party = await Party.findByPk(partyId, {
      include: [{
        model: User,
        as: 'leader',
        attributes: ['id', 'username', 'avatarUrl', 'level']
      }, {
        model: PartyMember,
        as: 'partyMembers',
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatarUrl', 'level', 'experience']
        }]
      }]
    });

    if (!party) {
      throw new Error('Party not found');
    }

    // 检查用户是否有权限查看私有队伍
    if (party.privacy === 'private' && userId) {
      const isMember = await PartyMember.isUserInParty(userId, partyId);
      if (!isMember) {
        throw new Error('Access denied: private party');
      }
    }

    return party;
  }

  /**
   * 更新队伍信息
   */
  async updateParty(partyId, userId, updateData) {
    const { name, description, privacy, imageUrl } = updateData;

    const party = await Party.findByPk(partyId);
    if (!party) {
      throw new Error('Party not found');
    }

    // 检查权限（只有队长可以更新）
    if (party.leaderId !== userId) {
      throw new Error('Only party leader can update party information');
    }

    const oldData = {
      name: party.name,
      description: party.description,
      privacy: party.privacy,
      imageUrl: party.imageUrl
    };

    // 更新字段
    if (name !== undefined) party.name = name;
    if (description !== undefined) party.description = description;
    if (privacy !== undefined) party.privacy = privacy;
    if (imageUrl !== undefined) party.imageUrl = imageUrl;

    await party.save();

    // 记录活动
    await PartyActivity.logActivity(
      partyId,
      userId,
      'party_updated',
      `队伍信息已更新`,
      { oldData, newData: updateData }
    );

    return party;
  }

  /**
   * 删除队伍
   */
  async deleteParty(partyId, userId) {
    const party = await Party.findByPk(partyId);
    if (!party) {
      throw new Error('Party not found');
    }

    if (party.leaderId !== userId) {
      throw new Error('Only party leader can delete party');
    }

    await party.destroy();
    return true;
  }

  /**
   * 加入队伍
   */
  async joinParty(partyId, userId) {
    const party = await Party.findByPk(partyId);
    if (!party) {
      throw new Error('Party not found');
    }

    // 检查是否已满员
    const isFull = await party.isFull();
    if (isFull) {
      throw new Error('Party is full');
    }

    // 检查是否已在队伍中
    const isAlreadyMember = await PartyMember.isUserInParty(userId, partyId);
    if (isAlreadyMember) {
      throw new Error('Already a member of this party');
    }

    // 检查隐私设置
    if (party.privacy === 'private') {
      throw new Error('Cannot join private party without invitation');
    }

    // 创建成员记录
    const member = await PartyMember.create({
      partyId,
      userId,
      role: 'member'
    });

    // 记录活动
    await PartyActivity.logActivity(
      partyId,
      userId,
      'member_joined',
      `新成员加入`,
      { username: member.user?.username }
    );

    // 更新队伍统计
    await party.updateStats();

    return member;
  }

  /**
   * 离开队伍
   */
  async leaveParty(partyId, userId) {
    const member = await PartyMember.findOne({
      where: { partyId, userId }
    });

    if (!member) {
      throw new Error('Not a member of this party');
    }

    if (member.role === 'leader') {
      throw new Error('Party leader cannot leave party. Please transfer leadership first.');
    }

    await member.destroy();

    // 记录活动
    await PartyActivity.logActivity(
      partyId,
      userId,
      'member_left',
      `成员离开`,
      { username: member.user?.username }
    );

    // 更新队伍统计
    const party = await Party.findByPk(partyId);
    if (party) {
      await party.updateStats();
    }

    return true;
  }

  /**
   * 邀请用户加入队伍
   */
  async inviteUser(partyId, inviterId, inviteeId, message = null) {
    const party = await Party.findByPk(partyId);
    if (!party) {
      throw new Error('Party not found');
    }

    // 检查邀请者权限
    const inviterMember = await PartyMember.findOne({
      where: { partyId, userId: inviterId }
    });

    if (!inviterMember || !inviterMember.hasPermission('canInvite')) {
      throw new Error('No permission to invite members');
    }

    // 检查是否已满员
    const isFull = await party.isFull();
    if (isFull) {
      throw new Error('Party is full');
    }

    // 创建邀请
    const invitation = await PartyInvitation.createInvitation(
      partyId,
      inviterId,
      inviteeId,
      message
    );

    return invitation;
  }

  /**
   * 接受邀请
   */
  async acceptInvitation(invitationId, userId) {
    const invitation = await PartyInvitation.findByPk(invitationId, {
      include: ['party']
    });

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.inviteeId !== userId) {
      throw new Error('Unauthorized to accept this invitation');
    }

    await invitation.accept();

    // 检查队伍是否已满
    const party = invitation.party;
    const isFull = await party.isFull();
    if (isFull) {
      throw new Error('Party is now full');
    }

    // 添加成员
    const member = await PartyMember.create({
      partyId: invitation.partyId,
      userId: userId,
      role: 'member'
    });

    // 记录活动
    await PartyActivity.logActivity(
      invitation.partyId,
      userId,
      'member_joined',
      `通过邀请加入队伍`,
      { username: member.user?.username }
    );

    // 更新队伍统计
    await party.updateStats();

    return member;
  }

  /**
   * 拒绝邀请
   */
  async declineInvitation(invitationId, userId) {
    const invitation = await PartyInvitation.findByPk(invitationId);

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.inviteeId !== userId) {
      throw new Error('Unauthorized to decline this invitation');
    }

    await invitation.decline();
    return true;
  }

  /**
   * 踢出成员
   */
  async kickMember(partyId, kickerId, targetUserId) {
    const kicker = await PartyMember.findOne({
      where: { partyId, userId: kickerId }
    });

    const target = await PartyMember.findOne({
      where: { partyId, userId: targetUserId }
    });

    if (!kicker || !target) {
      throw new Error('Member not found');
    }

    if (!kicker.hasPermission('canKick')) {
      throw new Error('No permission to kick members');
    }

    if (target.role === 'leader') {
      throw new Error('Cannot kick party leader');
    }

    await target.destroy();

    // 记录活动
    await PartyActivity.logActivity(
      partyId,
      kickerId,
      'member_kicked',
      `${target.user?.username} 被移出队伍`,
      { username: target.user?.username, kickerName: kicker.user?.username }
    );

    // 更新队伍统计
    const party = await Party.findByPk(partyId);
    if (party) {
      await party.updateStats();
    }

    return true;
  }

  /**
   * 更新成员角色
   */
  async updateMemberRole(partyId, updaterId, targetUserId, newRole) {
    const updater = await PartyMember.findOne({
      where: { partyId, userId: updaterId }
    });

    const target = await PartyMember.findOne({
      where: { partyId, userId: targetUserId }
    });

    if (!updater || !target) {
      throw new Error('Member not found');
    }

    if (!updater.isAdmin()) {
      throw new Error('Only admins can change member roles');
    }

    if (target.role === 'leader') {
      throw new Error('Cannot change leader role');
    }

    const oldRole = target.role;
    target.role = newRole;

    // 更新权限
    if (newRole === 'admin') {
      target.permissions = {
        canInvite: true,
        canKick: true,
        canEditParty: false,
        canManageMessages: true,
        canStartQuests: true
      };
    } else {
      target.permissions = {
        canInvite: false,
        canKick: false,
        canEditParty: false,
        canManageMessages: false,
        canStartQuests: false
      };
    }

    await target.save();

    // 记录活动
    await PartyActivity.logActivity(
      partyId,
      updaterId,
      'role_changed',
      `${target.user?.username} 的角色已更新`,
      {
        username: target.user?.username,
        oldRole,
        newRole,
        updaterName: updater.user?.username
      }
    );

    return target;
  }

  /**
   * 获取队伍消息
   */
  async getPartyMessages(partyId, userId, options = {}) {
    // 检查用户是否有权限查看消息
    const isMember = await PartyMember.isUserInParty(userId, partyId);
    if (!isMember) {
      throw new Error('Not a member of this party');
    }

    return await PartyMessage.findByParty(partyId, options);
  }

  /**
   * 发送消息
   */
  async sendMessage(partyId, userId, message) {
    // 检查用户是否有权限发送消息
    const isMember = await PartyMember.isUserInParty(userId, partyId);
    if (!isMember) {
      throw new Error('Not a member of this party');
    }

    return await PartyMessage.createUserMessage(partyId, userId, message);
  }

  /**
   * 获取队伍活动记录
   */
  async getPartyActivities(partyId, userId, options = {}) {
    // 检查用户是否有权限查看活动
    const isMember = await PartyMember.isUserInParty(userId, partyId);
    if (!isMember) {
      throw new Error('Not a member of this party');
    }

    return await PartyActivity.findByParty(partyId, options);
  }

  /**
   * 获取用户邀请
   */
  async getUserInvitations(userId) {
    return await PartyInvitation.findPendingInvitations(userId);
  }

  /**
   * 获取队伍排行榜
   */
  async getPartyLeaderboard(partyId, userId, sortBy = 'expContributed') {
    // 检查用户是否有权限查看排行榜
    const isMember = await PartyMember.isUserInParty(userId, partyId);
    if (!isMember) {
      throw new Error('Not a member of this party');
    }

    return await PartyMember.getLeaderboard(partyId, sortBy);
  }

  /**
   * 清理过期邀请
   */
  async cleanupExpiredInvitations() {
    return await PartyInvitation.cleanupExpired();
  }

  /**
   * 清理旧消息和活动记录
   */
  async cleanupOldData(days = 30) {
    const messagesCount = await PartyMessage.cleanupOldMessages(days);
    const activitiesCount = await PartyActivity.cleanupOldActivities(days * 3);

    return {
      messagesDeleted: messagesCount,
      activitiesDeleted: activitiesCount
    };
  }
}

module.exports = new PartyService();
