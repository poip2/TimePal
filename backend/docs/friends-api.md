# 好友系统 API 文档

## 基础信息
- 所有API都需要认证（JWT Token）
- 基础路径: `/api/friends`
- 响应格式统一为JSON

## API端点

### 1. 发送好友请求
**POST** `/api/friends/request`

**请求体:**
```json
{
  "userId": 123
}
```

**响应:**
```json
{
  "success": true,
  "message": "好友请求发送成功",
  "data": {
    "id": 1,
    "requesterId": 100,
    "addresseeId": 123,
    "status": "pending",
    "createdAt": "2024-01-20T10:00:00.000Z",
    "updatedAt": "2024-01-20T10:00:00.000Z",
    "requester": {
      "id": 100,
      "username": "user1",
      "avatarUrl": "https://example.com/avatar1.jpg",
      "level": 5
    },
    "addressee": {
      "id": 123,
      "username": "user2",
      "avatarUrl": "https://example.com/avatar2.jpg",
      "level": 3
    }
  }
}
```

### 2. 接受好友请求
**POST** `/api/friends/requests/:requestId/accept`

**响应:**
```json
{
  "success": true,
  "message": "好友请求已接受",
  "data": {
    "id": 1,
    "requesterId": 100,
    "addresseeId": 123,
    "status": "accepted",
    "createdAt": "2024-01-20T10:00:00.000Z",
    "updatedAt": "2024-01-20T10:05:00.000Z"
  }
}
```

### 3. 拒绝好友请求
**POST** `/api/friends/requests/:requestId/reject`

**响应:**
```json
{
  "success": true,
  "message": "好友请求已拒绝"
}
```

### 4. 获取好友列表
**GET** `/api/friends?limit=50&offset=0`

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "friend": {
        "id": 123,
        "username": "user2",
        "avatarUrl": "https://example.com/avatar2.jpg",
        "level": 3
      },
      "createdAt": "2024-01-20T10:00:00.000Z",
      "updatedAt": "2024-01-20T10:05:00.000Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 1
  }
}
```

### 5. 获取收到的好友请求
**GET** `/api/friends/requests/received?limit=20&offset=0`

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "requesterId": 100,
      "addresseeId": 123,
      "status": "pending",
      "createdAt": "2024-01-20T10:00:00.000Z",
      "updatedAt": "2024-01-20T10:00:00.000Z",
      "requester": {
        "id": 100,
        "username": "user1",
        "avatarUrl": "https://example.com/avatar1.jpg",
        "level": 5
      }
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 1
  }
}
```

### 6. 获取发送的好友请求
**GET** `/api/friends/requests/sent?limit=20&offset=0`

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "requesterId": 100,
      "addresseeId": 123,
      "status": "pending",
      "createdAt": "2024-01-20T10:00:00.000Z",
      "updatedAt": "2024-01-20T10:00:00.000Z",
      "addressee": {
        "id": 123,
        "username": "user2",
        "avatarUrl": "https://example.com/avatar2.jpg",
        "level": 3
      }
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 1
  }
}
```

### 7. 移除好友
**DELETE** `/api/friends/:friendId`

**响应:**
```json
{
  "success": true,
  "message": "好友已移除"
}
```

### 8. 获取好友关系状态
**GET** `/api/friends/status/:userId`

**响应:**
```json
{
  "success": true,
  "data": {
    "status": "accepted"
  }
}
```

### 9. 获取好友概览
**GET** `/api/friends/overview`

**响应:**
```json
{
  "success": true,
  "data": {
    "friendCount": 5,
    "pendingRequestsCount": 2
  }
}
```

### 10. 搜索好友
**GET** `/api/friends/search?q=username&limit=20&offset=0`

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "username": "username123",
      "avatarUrl": "https://example.com/avatar.jpg",
      "level": 3
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 1
  }
}
```

### 11. 获取好友排行榜
**GET** `/api/friends/leaderboard?sortBy=level&order=DESC&limit=10`

**查询参数:**
- `sortBy` (可选): 排序字段，可选值：level, experience, coins, gold, totalTasksCompleted, streakHighest, loginStreak
- `order` (可选): 排序顺序，可选值：ASC, DESC，默认DESC
- `limit` (可选): 返回数量限制，范围1-50，默认10

**响应:**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "user": {
          "id": 123,
          "username": "leader_user",
          "avatarUrl": "https://example.com/avatar.jpg",
          "class": "warrior"
        },
        "stats": {
          "level": 15,
          "experience": 1250,
          "coins": 5000,
          "gold": 2500,
          "totalTasksCompleted": 150,
          "streakHighest": 30,
          "loginStreak": 7
        },
        "score": 15
      },
      {
        "rank": 2,
        "user": {
          "id": 124,
          "username": "second_user",
          "avatarUrl": "https://example.com/avatar2.jpg",
          "class": "mage"
        },
        "stats": {
          "level": 12,
          "experience": 980,
          "coins": 3200,
          "gold": 1800,
          "totalTasksCompleted": 120,
          "streakHighest": 25,
          "loginStreak": 5
        },
        "score": 12
      }
    ],
    "totalFriends": 5,
    "userRank": {
      "rank": 3,
      "totalFriends": 5,
      "sortBy": "level",
      "value": 10
    },
    "sortBy": "level",
    "order": "DESC"
  }
}
```

**错误响应:**
```json
{
  "success": false,
  "message": "无效的排序字段"
}
```

## 状态码说明
- `none`: 无关系
- `pending`: 待处理的好友请求
- `accepted`: 已是好友
- `blocked`: 已被屏蔽
- `self`: 自己

## 错误处理
所有API在失败时都会返回如下格式的错误响应：

```json
{
  "success": false,
  "message": "错误描述"
}
```

## 注意事项
1. 用户不能向自己发送好友请求
2. 不能重复发送好友请求
3. 如果已收到对方的好友请求，不能再次发送
4. 已经是好友的用户不能再次发送请求
5. 被屏蔽的用户不能发送好友请求
