# 好友消息系统 API 文档

## 概述
好友消息系统允许用户与好友之间发送和接收消息，支持消息状态管理（已发送、已送达、已读）和软删除功能。

## 基础信息
- 基础URL: `/api/messages`
- 认证方式: JWT Token (Bearer Token)
- 内容类型: `application/json`

## 消息状态
- `sent`: 已发送
- `delivered`: 已送达
- `read`: 已读

## API端点

### 1. 发送消息
**POST** `/api/messages`

发送一条消息给好友。

#### 请求体
```json
{
  "receiverId": 123,
  "content": "你好，今天过得怎么样？"
}
```

#### 响应示例
```json
{
  "success": true,
  "message": "消息发送成功",
  "data": {
    "id": 1,
    "senderId": 100,
    "receiverId": 123,
    "content": "你好，今天过得怎么样？",
    "status": "sent",
    "isDeleted": false,
    "createdAt": "2025-07-20T02:30:00.000Z",
    "updatedAt": "2025-07-20T02:30:00.000Z",
    "sender": {
      "id": 100,
      "username": "user1",
      "avatarUrl": "https://example.com/avatar1.jpg"
    },
    "receiver": {
      "id": 123,
      "username": "user2",
      "avatarUrl": "https://example.com/avatar2.jpg"
    }
  }
}
```

### 2. 获取消息列表
**GET** `/api/messages`

获取当前用户的所有消息。

#### 查询参数
- `limit` (可选): 每页数量，默认50，最大100
- `offset` (可选): 偏移量，默认0
- `status` (可选): 消息状态过滤（sent/delivered/read）
- `isDeleted` (可选): 是否包含已删除消息，默认false
- `sortBy` (可选): 排序字段（createdAt/updatedAt/status），默认createdAt
- `order` (可选): 排序顺序（ASC/DESC），默认DESC

#### 响应示例
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "senderId": 100,
      "receiverId": 123,
      "content": "你好，今天过得怎么样？",
      "status": "sent",
      "isDeleted": false,
      "createdAt": "2025-07-20T02:30:00.000Z",
      "sender": {
        "id": 100,
        "username": "user1",
        "avatarUrl": "https://example.com/avatar1.jpg"
      },
      "receiver": {
        "id": 123,
        "username": "user2",
        "avatarUrl": "https://example.com/avatar2.jpg"
      }
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 1
  }
}
```

### 3. 获取对话历史
**GET** `/api/messages/conversation/:friendId`

获取与特定好友的对话历史。

#### 路径参数
- `friendId`: 好友用户ID

#### 查询参数
- `limit` (可选): 每页数量，默认50，最大100
- `offset` (可选): 偏移量，默认0
- `before` (可选): 获取此时间之前的消息（ISO8601格式）
- `after` (可选): 获取此时间之后的消息（ISO8601格式）
- `isDeleted` (可选): 是否包含已删除消息，默认false

#### 响应示例
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "senderId": 100,
      "receiverId": 123,
      "content": "你好，今天过得怎么样？",
      "status": "read",
      "isDeleted": false,
      "createdAt": "2025-07-20T02:30:00.000Z",
      "sender": {
        "id": 100,
        "username": "user1",
        "avatarUrl": "https://example.com/avatar1.jpg"
      },
      "receiver": {
        "id": 123,
        "username": "user2",
        "avatarUrl": "https://example.com/avatar2.jpg"
      }
    },
    {
      "id": 2,
      "senderId": 123,
      "receiverId": 100,
      "content": "我很好，谢谢！你呢？",
      "status": "sent",
      "isDeleted": false,
      "createdAt": "2025-07-20T02:31:00.000Z",
      "sender": {
        "id": 123,
        "username": "user2",
        "avatarUrl": "https://example.com/avatar2.jpg"
      },
      "receiver": {
        "id": 100,
        "username": "user1",
        "avatarUrl": "https://example.com/avatar1.jpg"
      }
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 2
  }
}
```

### 4. 标记消息为已读
**PUT** `/api/messages/:id/read`

将单条消息标记为已读。

#### 路径参数
- `id`: 消息ID

#### 响应示例
```json
{
  "success": true,
  "message": "消息已标记为已读",
  "data": {
    "id": 1,
    "status": "read",
    "updatedAt": "2025-07-20T02:35:00.000Z"
  }
}
```

### 5. 标记对话为已读
**PUT** `/api/messages/conversation/:friendId/read`

将与特定好友的所有未读消息标记为已读。

#### 路径参数
- `friendId`: 好友用户ID

#### 响应示例
```json
{
  "success": true,
  "message": "已将3条消息标记为已读",
  "data": {
    "updatedCount": 3
  }
}
```

### 6. 删除消息
**DELETE** `/api/messages/:id`

软删除一条消息（标记为已删除）。

#### 路径参数
- `id`: 消息ID

#### 响应示例
```json
{
  "success": true,
  "message": "消息已删除",
  "data": {
    "id": 1,
    "isDeleted": true,
    "deletedAt": "2025-07-20T02:40:00.000Z"
  }
}
```

### 7. 获取未读消息数量
**GET** `/api/messages/unread-count`

获取当前用户的未读消息总数。

#### 响应示例
```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

### 8. 获取与特定好友的未读消息数量
**GET** `/api/messages/unread-count/:friendId`

获取与特定好友的未读消息数量。

#### 路径参数
- `friendId`: 好友用户ID

#### 响应示例
```json
{
  "success": true,
  "data": {
    "unreadCount": 2
  }
}
```

### 9. 获取消息概览
**GET** `/api/messages/overview`

获取消息概览信息，包括未读消息总数和最近对话列表。

#### 响应示例
```json
{
  "success": true,
  "data": {
    "totalUnread": 5,
    "recentConversations": [
      {
        "lastMessage": {
          "id": 10,
          "senderId": 123,
          "receiverId": 100,
          "content": "明天见！",
          "status": "sent",
          "createdAt": "2025-07-20T02:45:00.000Z"
        },
        "unreadCount": 2
      }
    ]
  }
}
```

### 10. 搜索消息
**GET** `/api/messages/search`

搜索当前用户的消息内容。

#### 查询参数
- `q`: 搜索关键词（必填）
- `limit` (可选): 每页数量，默认20，最大100
- `offset` (可选): 偏移量，默认0

#### 响应示例
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "senderId": 123,
      "receiverId": 100,
      "content": "明天我们一起去图书馆学习吧",
      "status": "read",
      "createdAt": "2025-07-20T02:20:00.000Z",
      "sender": {
        "id": 123,
        "username": "user2",
        "avatarUrl": "https://example.com/avatar2.jpg"
      },
      "receiver": {
        "id": 100,
        "username": "user1",
        "avatarUrl": "https://example.com/avatar1.jpg"
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

## 错误处理

### 常见错误码
- `400`: 请求参数错误
- `403`: 权限不足（非好友关系）
- `404`: 资源未找到
- `409`: 冲突（如重复操作）
- `500`: 服务器内部错误

### 错误响应格式
```json
{
  "success": false,
  "message": "错误描述信息"
}
```

## 使用示例

### 发送消息的完整流程
1. 确保与目标用户是好友关系
2. 获取JWT Token
3. 发送POST请求到 `/api/messages`
4. 接收响应并处理结果

### 获取对话的完整流程
1. 获取JWT Token
2. 发送GET请求到 `/api/messages/conversation/{friendId}`
3. 接收响应并显示对话内容
4. 可选：调用 `/api/messages/conversation/{friendId}/read` 标记为已读

## 注意事项
- 所有消息操作都需要用户与目标用户是好友关系
- 消息内容长度限制为1-2000字符
- 软删除的消息不会从数据库中物理删除，但不会在正常查询中显示
- 时间格式使用ISO8601标准
- 分页参数limit最大值为100
