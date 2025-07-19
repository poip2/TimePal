const partyService = require('../services/partyService');
const { validationResult } = require('express-validator');

class PartyController {
  /**
   * 创建队伍
   */
  async createParty(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userId = req.user.userId;
      const party = await partyService.createParty(userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Party created successfully',
        data: party
      });
    } catch (error) {
      console.error('Create party error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 获取用户的队伍列表
   */
  async getUserParties(req, res) {
    try {
      const userId = req.user.userId;
      const parties = await partyService.getUserParties(userId);

      res.json({
        success: true,
        data: parties
      });
    } catch (error) {
      console.error('Get user parties error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 获取公开队伍列表
   */
  async getPublicParties(req, res) {
    try {
      const { limit = 20, offset = 0 } = req.query;
      const parties = await partyService.getPublicParties({
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: parties
      });
    } catch (error) {
      console.error('Get public parties error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 搜索队伍
   */
  async searchParties(req, res) {
    try {
      const { q, limit = 20, offset = 0 } = req.query;

      if (!q || q.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const parties = await partyService.searchParties(q, {
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: parties
      });
    } catch (error) {
      console.error('Search parties error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 获取队伍详情
   */
  async getPartyDetails(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId || null;

      const party = await partyService.getPartyDetails(id, userId);

      res.json({
        success: true,
        data: party
      });
    } catch (error) {
      console.error('Get party details error:', error);
      res.status(error.message === 'Party not found' ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 更新队伍信息
   */
  async updateParty(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const userId = req.user.userId;

      const party = await partyService.updateParty(id, userId, req.body);

      res.json({
        success: true,
        message: 'Party updated successfully',
        data: party
      });
    } catch (error) {
      console.error('Update party error:', error);
      const status = error.message.includes('not found') ? 404 : 403;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 删除队伍
   */
  async deleteParty(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      await partyService.deleteParty(id, userId);

      res.json({
        success: true,
        message: 'Party deleted successfully'
      });
    } catch (error) {
      console.error('Delete party error:', error);
      const status = error.message.includes('not found') ? 404 : 403;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 加入队伍
   */
  async joinParty(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const member = await partyService.joinParty(id, userId);

      res.json({
        success: true,
        message: 'Successfully joined party',
        data: member
      });
    } catch (error) {
      console.error('Join party error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 离开队伍
   */
  async leaveParty(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      await partyService.leaveParty(id, userId);

      res.json({
        success: true,
        message: 'Successfully left party'
      });
    } catch (error) {
      console.error('Leave party error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 邀请用户加入队伍
   */
  async inviteUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const inviterId = req.user.userId;
      const { userId: inviteeId, message } = req.body;

      const invitation = await partyService.inviteUser(id, inviterId, inviteeId, message);

      // 转换字段名为snake_case以匹配测试期望
      const formattedInvitation = {
        id: invitation.id,
        party_id: invitation.partyId,
        inviter_id: invitation.inviterId,
        invitee_id: invitation.inviteeId,
        status: invitation.status,
        message: invitation.message,
        expires_at: invitation.expiresAt,
        created_at: invitation.createdAt,
        updated_at: invitation.updatedAt
      };

      res.status(201).json({
        success: true,
        message: 'Invitation sent successfully',
        data: formattedInvitation
      });
    } catch (error) {
      console.error('Invite user error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 接受邀请
   */
  async acceptInvitation(req, res) {
    try {
      const { invitationId } = req.params;
      const userId = req.user.userId;

      const member = await partyService.acceptInvitation(invitationId, userId);

      res.json({
        success: true,
        message: 'Invitation accepted successfully',
        data: member
      });
    } catch (error) {
      console.error('Accept invitation error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 拒绝邀请
   */
  async declineInvitation(req, res) {
    try {
      const { invitationId } = req.params;
      const userId = req.user.userId;

      await partyService.declineInvitation(invitationId, userId);

      res.json({
        success: true,
        message: 'Invitation declined successfully'
      });
    } catch (error) {
      console.error('Decline invitation error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 踢出成员
   */
  async kickMember(req, res) {
    try {
      const { id, userId: targetUserId } = req.params;
      const kickerId = req.user.userId;

      await partyService.kickMember(id, kickerId, targetUserId);

      res.json({
        success: true,
        message: 'Member kicked successfully'
      });
    } catch (error) {
      console.error('Kick member error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 更新成员角色
   */
  async updateMemberRole(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id, userId: targetUserId } = req.params;
      const updaterId = req.user.userId;
      const { role } = req.body;

      const member = await partyService.updateMemberRole(id, updaterId, targetUserId, role);

      res.json({
        success: true,
        message: 'Member role updated successfully',
        data: member
      });
    } catch (error) {
      console.error('Update member role error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 获取队伍消息
   */
  async getPartyMessages(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const { limit = 50, offset = 0, before, after } = req.query;

      const messages = await partyService.getPartyMessages(id, userId, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        before,
        after
      });

      res.json({
        success: true,
        data: messages
      });
    } catch (error) {
      console.error('Get party messages error:', error);
      res.status(403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 发送消息
   */
  async sendMessage(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const userId = req.user.userId;
      const { message } = req.body;

      const newMessage = await partyService.sendMessage(id, userId, message);

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: newMessage
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 获取队伍活动记录
   */
  async getPartyActivities(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const { limit = 50, offset = 0, activityType, days } = req.query;

      const activities = await partyService.getPartyActivities(id, userId, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        activityType,
        days: days ? parseInt(days) : null
      });

      res.json({
        success: true,
        data: activities
      });
    } catch (error) {
      console.error('Get party activities error:', error);
      res.status(403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 获取用户邀请
   */
  async getUserInvitations(req, res) {
    try {
      const userId = req.user.userId;

      const invitations = await partyService.getUserInvitations(userId);

      res.json({
        success: true,
        data: invitations
      });
    } catch (error) {
      console.error('Get user invitations error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 获取队伍排行榜
   */
  async getPartyLeaderboard(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const { sortBy = 'expContributed' } = req.query;

      const leaderboard = await partyService.getPartyLeaderboard(id, userId, sortBy);

      res.json({
        success: true,
        data: leaderboard
      });
    } catch (error) {
      console.error('Get party leaderboard error:', error);
      res.status(403).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new PartyController();
