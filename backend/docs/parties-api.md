# 队伍系统 API 文档

## 概述
队伍系统允许用户创建、加入和管理队伍，支持队伍聊天、邀请机制和活动记录等功能。

## 基础信息
- **基础URL**: `/api/parties`
- **认证**: 除公开接口外，所有接口都需要 Bearer Token 认证
- **数据格式**: JSON

## 数据模型

### 队伍 (Party)
```json
{
  "id": 1,
  "name": "队伍名称",
  "description": "队伍描述",
  "leaderId": 1,
  "privacy": "public|private|invite_only",
  "maxMembers": 4,
  "imageUrl": "https://example.com/image.jpg",
  "stats": {
    "totalQuestsCompleted": 0,
    "totalExpEarned": 0,
    "totalMembers": 1,
    "averageMemberLevel": 10,
    "totalAchievements": 0
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 队伍成员 (PartyMember)
```json
{
  "id": 1,
  "partyId": 1,
  "userId": 1,
  "role": "leader|admin|member",
  "joinedAt": "2024-01-01T00:00:00.000Z",
  "permissions": {
    "canInvite": true,
    "canKick": true,
    "canEditParty": true,
    "canManageMessages": true,
    "canStartQuests": true
  },
  "stats": {
    "questsCompleted": 0,
    "expContributed": 0,
    "lastActiveAt": null,
    "consecutiveDays": 0
  }
}
```

## API 端点

### 1. 创建队伍
**POST** `/api/parties`

创建一个新的队伍。

**请求体**:
```json
{
  "name": "队伍名称",
  "description": "队伍描述（可选）",
  "privacy": "public|private|invite_only",
  "maxMembers": 4,
  "imageUrl": "https://example.com/image.jpg（可选）"
}
```

**响应**:
```json
{
  "success": true,
  "message": "Party created successfully",
  "data": { /* 完整的队伍对象 */ }
}
```

### 2. 获取用户队伍列表
**GET** `/api/parties/my-parties`

获取当前用户所属的所有队伍。

**响应**:
```json
{
  "success": true,
  "data": [ /* 队伍列表 */ ]
}
```

### 3. 获取用户创建的队伍
**GET** `/api/parties/my-created-parties`

获取当前用户创建的队伍列表。

**响应**:
```json
{
  "success": true,
  "data": [ /* 队伍列表 */ ]
}
```

### 4. 获取公开队伍
**GET** `/api/parties/public`

获取所有公开的队伍列表。

**查询参数**:
- `limit` (可选): 每页数量，默认 20，最大 100
- `offset` (可选): 偏移量，默认 0

**响应**:
```json
{
  "success": true,
  "data": [ /* 公开队伍列表 */ ]
}
```

### 5. 搜索队伍
**GET** `/api/parties/search`

根据名称搜索公开队伍。

**查询参数**:
- `q` (必填): 搜索关键词
- `limit` (可选): 每页数量，默认 20，最大 100
- `offset` (可选): 偏移量，默认 0

**响应**:
```json
{
  "success": true,
  "data": [ /* 搜索结果 */ ]
}
```

### 6. 获取队伍详情
**GET** `/api/parties/:id`

获取特定队伍的详细信息。

**响应**:
```json
{
  "success": true,
  "data": { /* 完整的队伍对象，包含成员信息 */ }
}
```

### 7. 更新队伍信息
**PUT** `/api/parties/:id`

更新队伍的基本信息（仅队长可执行）。

**请求体**:
```json
{
  "name": "新队伍名称（可选）",
  "description": "新描述（可选）",
  "privacy": "public|private|invite_only（可选）",
  "imageUrl": "https://example.com/new-image.jpg（可选）"
}
```

**响应**:
```json
{
  "success": true,
  "message": "Party updated successfully",
  "data": { /* 更新后的队伍对象 */ }
}
```

### 8. 删除队伍
**DELETE** `/api/parties/:id`

删除队伍（仅队长可执行）。

**响应**:
```json
{
  "success": true,
  "message": "Party deleted successfully"
}
```

### 9. 加入队伍
**POST** `/api/parties/:id/join`

加入一个公开队伍。

**响应**:
```json
{
  "success": true,
  "message": "Successfully joined party",
  "data": { /* 成员信息 */ }
}
```

### 10. 离开队伍
**POST** `/api/parties/:id/leave`

离开当前队伍（队长不能离开）。

**响应**:
```json
{
  "success": true,
  "message": "Successfully left party"
}
```

### 11. 邀请用户
**POST** `/api/parties/:id/invite`

邀请用户加入队伍。

**请求体**:
```json
{
  "userId": 123,
  "message": "邀请消息（可选）"
}
```

**响应**:
```json
{
  "success": true,
  "message": "Invitation sent successfully",
  "data": { /* 邀请信息 */ }
}
```

### 12. 接受邀请
**POST** `/api/parties/invitations/:invitationId/accept`

接受队伍邀请。

**响应**:
```json
{
  "success": true,
  "message": "Invitation accepted successfully",
  "data": { /* 成员信息 */ }
}
```

### 13. 拒绝邀请
**POST** `/api/parties/invitations/:invitationId/decline`

拒绝队伍邀请。

**响应**:
```json
{
  "success": true,
  "message": "Invitation declined successfully"
}
```

### 14. 踢出成员
**POST** `/api/parties/:id/kick/:userId`

将成员踢出队伍（需要管理员权限）。

**响应**:
```json
{
  "success": true,
  "message": "Member kicked successfully"
}
```

### 15. 更新成员角色
**PUT** `/api/parties/:id/members/:userId/role`

更新成员的角色（需要管理员权限）。

**请求体**:
```json
{
  "role": "admin|member"
}
```

**响应**:
```json
{
  "success": true,
  "message": "Member role updated successfully",
  "data": { /* 更新后的成员信息 */ }
}
```

### 16. 获取队伍消息
**GET** `/api/parties/:id/messages`

获取队伍的聊天记录。

**查询参数**:
- `limit` (可选): 每页数量，默认 50，最大 100
- `offset` (可选): 偏移量，默认 0
- `before` (可选): 获取此时间之前的消息
- `after` (可选): 获取此时间之后的消息

**响应**:
```json
{
  "success": true,
  "data": [ /* 消息列表 */ ]
}
```

### 17. 发送消息
**POST** `/api/parties/:id/messages`

在队伍中发送消息。

**请求体**:
```json
{
  "message": "消息内容"
}
```

**响应**:
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": { /* 新消息 */ }
}
```

### 18. 获取队伍活动记录
**GET** `/api/parties/:id/activities`

获取队伍的活动记录。

**查询参数**:
- `limit` (可选): 每页数量，默认 50，最大 100
- `offset` (可选): 偏移量，默认 0
- `activityType` (可选): 活动类型过滤
- `days` (可选): 获取最近几天的记录

**响应**:
```json
{
  "success": true,
  "data": [ /* 活动记录列表 */ ]
}
```

### 19. 获取用户邀请
**GET** `/api/parties/invitations`

获取当前用户的待处理邀请。

**响应**:
```json
{
  "success": true,
  "data": [ /* 邀请列表 */ ]
}
```

### 20. 获取队伍排行榜
**GET** `/api/parties/:id/leaderboard`

获取队伍成员的排行榜。

**查询参数**:
- `sortBy` (可选): 排序字段，默认 'expContributed'

**响应**:
```json
{
  "success": true,
  "data": [ /* 排行榜数据 */ ]
}
```

## 错误码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 权限说明

- **队长 (leader)**: 拥有所有权限
- **管理员 (admin)**: 可以邀请成员、踢出成员、管理消息、开始任务
- **普通成员 (member)**: 只能发送消息、查看信息

## 使用示例

### 创建队伍
```bash
curl -X POST http://localhost:3000/api/parties \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "我的队伍",
    "description": "一起完成任务的队伍",
    "privacy": "public",
    "maxMembers": 4
  }'
```

### 加入队伍
```bash
curl -X POST http://localhost:3000/api/parties/1/join \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 发送消息
```bash
curl -X POST http://localhost:3000/api/parties/1/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "大家好！"}'
