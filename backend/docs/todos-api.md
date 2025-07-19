# 待办事项 API 文档

## 概述
待办事项管理系统允许用户创建、管理、跟踪和完成待办事项。支持检查清单、截止日期、难度等级和排序功能。

## 基础信息
- **Base URL**: `/api/todos`
- **认证**: 所有端点需要 Bearer Token
- **内容类型**: `application/json`

## 数据模型

### 待办事项对象
```json
{
  "id": 1,
  "user_id": 123,
  "title": "完成项目报告",
  "notes": "需要包含市场分析和财务预测",
  "difficulty": "medium",
  "due_date": "2024-12-31",
  "date_completed": "2024-12-15T10:30:00Z",
  "checklist": [
    {
      "id": "check1",
      "text": "收集数据",
      "completed": true
    },
    {
      "id": "check2",
      "text": "撰写分析",
      "completed": false
    }
  ],
  "is_completed": false,
  "position": 0,
  "created_at": "2024-12-01T08:00:00Z",
  "updated_at": "2024-12-14T15:30:00Z"
}
```

### 字段说明
| 字段 | 类型 | 描述 |
|------|------|------|
| id | number | 待办事项唯一标识 |
| user_id | number | 所属用户ID |
| title | string | 待办事项标题 (必填) |
| notes | string | 详细描述 |
| difficulty | string | 难度等级: trivial, easy, medium, hard |
| due_date | string | 截止日期 (YYYY-MM-DD) |
| date_completed | string | 完成时间 (ISO 8601) |
| checklist | array | 检查清单数组 |
| is_completed | boolean | 是否已完成 |
| position | number | 排序位置 |
| created_at | string | 创建时间 |
| updated_at | string | 更新时间 |

### 检查清单项格式
```json
{
  "id": "unique-id",
  "text": "检查清单文本",
  "completed": false
}
```

## API 端点

### 1. 获取所有待办事项
获取当前用户的所有待办事项。

**请求**
```
GET /api/todos
Authorization: Bearer <token>
```

**响应**
```json
{
  "success": true,
  "data": [todo_object, ...],
  "count": 2
}
```

### 2. 获取待办事项统计
获取用户的待办事项统计数据。

**请求**
```
GET /api/todos/stats
Authorization: Bearer <token>
```

**响应**
```json
{
  "success": true,
  "data": {
    "total_todos": 10,
    "completed_todos": 4,
    "overdue_todos": 2,
    "today_todos": 3,
    "upcoming_todos": 1
  }
}
```

### 3. 获取单个待办事项
根据ID获取特定待办事项。

**请求**
```
GET /api/todos/:id
Authorization: Bearer <token>
```

**响应**
```json
{
  "success": true,
  "data": todo_object
}
```

### 4. 创建待办事项
创建新的待办事项。

**请求**
```
POST /api/todos
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "新待办事项",
  "notes": "详细描述",
  "difficulty": "easy",
  "due_date": "2024-12-31",
  "checklist": [
    {"text": "子任务1", "completed": false}
  ],
  "position": 0
}
```

**响应**
```json
{
  "success": true,
  "data": todo_object,
  "message": "待办事项创建成功"
}
```

### 5. 更新待办事项
更新现有待办事项。

**请求**
```
PUT /api/todos/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "更新后的标题",
  "notes": "更新后的描述",
  "difficulty": "hard",
  "due_date": "2025-01-15",
  "checklist": [
    {"text": "更新后的子任务", "completed": true}
  ],
  "position": 1
}
```

**响应**
```json
{
  "success": true,
  "data": todo_object,
  "message": "待办事项更新成功"
}
```

### 6. 删除待办事项
删除待办事项。

**请求**
```
DELETE /api/todos/:id
Authorization: Bearer <token>
```

**响应**
```json
{
  "success": true,
  "message": "待办事项删除成功",
  "data": todo_object
}
```

### 7. 完成待办事项
标记待办事项为已完成。

**请求**
```
POST /api/todos/:id/complete
Authorization: Bearer <token>
```

**响应**
```json
{
  "success": true,
  "data": todo_object,
  "message": "待办事项已完成"
}
```

### 8. 取消完成待办事项
取消待办事项的完成状态。

**请求**
```
POST /api/todos/:id/uncomplete
Authorization: Bearer <token>
```

**响应**
```json
{
  "success": true,
  "data": todo_object,
  "message": "待办事项已取消完成"
}
```

### 9. 重新排序待办事项
改变待办事项的排序位置。

**请求**
```
PUT /api/todos/:id/reorder
Authorization: Bearer <token>
Content-Type: application/json

{
  "position": 2
}
```

**响应**
```json
{
  "success": true,
  "data": todo_object,
  "message": "待办事项排序成功"
}
```

## 错误响应

### 400 Bad Request
```json
{
  "success": false,
  "message": "标题不能为空"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "未提供认证token"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "待办事项不存在"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "服务器内部错误",
  "error": "具体错误信息"
}
```

## 使用示例

### 创建带检查清单的待办事项
```bash
curl -X POST https://api.example.com/api/todos \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "准备会议",
    "notes": "季度总结会议准备",
    "difficulty": "medium",
    "due_date": "2024-12-20",
    "checklist": [
      {"text": "准备PPT", "completed": false},
      {"text": "收集数据", "completed": true}
    ]
  }'
```

### 完成待办事项
```bash
curl -X POST https://api.example.com/api/todos/123/complete \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 获取统计信息
```bash
curl -X GET https://api.example.com/api/todos/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 注意事项
1. 所有日期格式使用 YYYY-MM-DD
2. 检查清单项必须包含 text 字段
3. 位置(position)字段用于拖拽排序，从0开始
4. 用户只能访问自己的待办事项
5. 删除操作是永久性的，请谨慎操作
