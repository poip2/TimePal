# 每日任务 API 文档

## 概述
每日任务（Dailies）系统允许用户创建和管理重复性的日常任务，支持复杂的重复规则、连续完成奖励（streak系统）和任务状态跟踪。

## 数据模型

### Daily 模型字段

| 字段名 | 类型 | 描述 | 默认值 |
|--------|------|------|--------|
| id | INTEGER | 主键，自增 | - |
| userId | INTEGER | 用户ID，外键 | - |
| title | STRING(255) | 任务标题 | - |
| notes | TEXT | 任务备注 | null |
| difficulty | ENUM | 难度等级：trivial, easy, medium, hard | easy |
| repeatType | ENUM | 重复类型：daily, weekly, monthly, yearly | daily |
| repeatDays | JSONB | 每周重复的具体日期（0-6） | [] |
| startDate | DATEONLY | 开始日期 | 当前日期 |
| everyX | INTEGER | 每X个周期执行一次 | 1 |
| streak | INTEGER | 当前连续完成天数 | 0 |
| longestStreak | INTEGER | 最长连续完成天数 | 0 |
| isCompleted | BOOLEAN | 今日是否已完成 | false |
| lastCompletedDate | DATEONLY | 最后完成日期 | null |
| reminderTime | TIME | 提醒时间 | null |
| position | INTEGER | 排序位置 | 0 |
| isArchived | BOOLEAN | 是否已归档 | false |
| createdAt | TIMESTAMP | 创建时间 | 当前时间 |
| updatedAt | TIMESTAMP | 更新时间 | 当前时间 |

## API 端点

### 获取所有每日任务
```
GET /api/dailies
```
**查询参数：**
- `archived` (boolean, optional): 是否包含已归档任务，默认false
- `limit` (number, optional): 返回数量限制
- `offset` (number, optional): 偏移量

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "每日阅读",
      "notes": "阅读30分钟",
      "difficulty": "easy",
      "repeatType": "daily",
      "repeatDays": [],
      "startDate": "2024-01-15",
      "everyX": 1,
      "streak": 5,
      "longestStreak": 7,
      "isCompleted": true,
      "lastCompletedDate": "2024-01-15",
      "reminderTime": "09:00:00",
      "position": 0,
      "isArchived": false,
      "createdAt": "2024-01-15T08:00:00.000Z",
      "updatedAt": "2024-01-15T08:00:00.000Z"
    }
  ],
  "count": 1
}
```

### 获取单个每日任务
```
GET /api/dailies/:id
```
**响应示例：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "每日阅读",
    "notes": "阅读30分钟",
    "difficulty": "easy",
    "repeatType": "daily",
    "repeatDays": [],
    "startDate": "2024-01-15",
    "everyX": 1,
    "streak": 5,
    "longestStreak": 7,
    "isCompleted": true,
    "lastCompletedDate": "2024-01-15",
    "reminderTime": "09:00:00",
    "position": 0,
    "isArchived": false,
    "createdAt": "2024-01-15T08:00:00.000Z",
    "updatedAt": "2024-01-15T08:00:00.000Z"
  }
}
```

### 获取今日任务
```
GET /api/dailies/today/tasks
```
**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "每日阅读",
      "difficulty": "easy",
      "isCompleted": false,
      "streak": 5
    }
  ],
  "count": 1
}
```

### 创建每日任务
```
POST /api/dailies
```
**请求体：**
```json
{
  "title": "每日阅读",
  "notes": "阅读30分钟",
  "difficulty": "easy",
  "repeatType": "daily",
  "repeatDays": [],
  "startDate": "2024-01-15",
  "everyX": 1,
  "reminderTime": "09:00",
  "position": 0
}
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "每日阅读",
    "notes": "阅读30分钟",
    "difficulty": "easy",
    "repeatType": "daily",
    "repeatDays": [],
    "startDate": "2024-01-15",
    "everyX": 1,
    "streak": 0,
    "longestStreak": 0,
    "isCompleted": false,
    "reminderTime": "09:00:00",
    "position": 0,
    "isArchived": false,
    "createdAt": "2024-01-15T08:00:00.000Z",
    "updatedAt": "2024-01-15T08:00:00.000Z"
  },
  "message": "Daily task created successfully"
}
```

### 更新每日任务
```
PUT /api/dailies/:id
```
**请求体：**
```json
{
  "title": "更新后的标题",
  "difficulty": "medium",
  "notes": "更新后的备注"
}
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "更新后的标题",
    "difficulty": "medium",
    "notes": "更新后的备注"
  },
  "message": "Daily task updated successfully"
}
```

### 删除每日任务
```
DELETE /api/dailies/:id
```
**响应示例：**
```json
{
  "success": true,
  "message": "Daily task deleted successfully"
}
```

### 完成每日任务
```
POST /api/dailies/:id/complete
```
**响应示例：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "isCompleted": true,
    "streak": 6,
    "longestStreak": 7,
    "lastCompletedDate": "2024-01-15"
  },
  "message": "Daily task completed successfully"
}
```

### 取消完成每日任务
```
POST /api/dailies/:id/uncomplete
```
**响应示例：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "isCompleted": false,
    "streak": 5,
    "lastCompletedDate": null
  },
  "message": "Daily task uncompleted successfully"
}
```

### 归档每日任务
```
POST /api/dailies/:id/archive
```
**响应示例：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "isArchived": true
  },
  "message": "Daily task archived successfully"
}
```

### 取消归档每日任务
```
POST /api/dailies/:id/unarchive
```
**响应示例：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "isArchived": false
  },
  "message": "Daily task unarchived successfully"
}
```

### 获取用户统计信息
```
GET /api/dailies/stats/overview
```
**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "difficulty": "easy",
      "isArchived": false,
      "isCompleted": true,
      "count": "5",
      "avgStreak": "3.2",
      "maxStreak": "7"
    },
    {
      "difficulty": "medium",
      "isArchived": false,
      "isCompleted": false,
      "count": "3",
      "avgStreak": "1.5",
      "maxStreak": "3"
    }
  ]
}
```

## 重复规则说明

### 每日重复 (daily)
- 每X天执行一次
- 示例：`everyX: 2` 表示每2天执行一次

### 每周重复 (weekly)
- 在指定的星期几执行
- 示例：`repeatDays: [1, 3, 5]` 表示每周一、三、五执行
- 星期对应：0=周日，1=周一，...，6=周六

### 每月重复 (monthly)
- 每X个月执行一次
- 示例：`everyX: 2` 表示每2个月执行一次

### 每年重复 (yearly)
- 每X年执行一次
- 示例：`everyX: 1` 表示每年执行一次

## 错误处理

所有API端点都遵循统一的错误响应格式：

```json
{
  "success": false,
  "message": "错误描述",
  "error": "详细错误信息"
}
```

## 权限要求

所有端点都需要用户认证，需要在请求头中包含：
```
Authorization: Bearer <token>
```

## 注意事项

1. **streak系统**：连续完成会增加streak值，错过一天会重置为0
2. **每日重置**：每天凌晨会自动重置所有任务的完成状态
3. **重复规则**：系统会根据repeatType、repeatDays和everyX计算任务是否应该在今天执行
4. **数据验证**：所有输入都会进行验证，无效数据会返回400错误
