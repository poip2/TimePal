# 习惯管理API文档

## 基础信息
- **Base URL**: `http://localhost:3000/api`
- **认证方式**: JWT Bearer Token
- **Content-Type**: `application/json`

## 认证要求
所有习惯管理API都需要在Header中添加认证令牌：
```
Authorization: Bearer <token>
```

---

## API端点

### 1. 获取所有习惯
**GET** `/habits`

#### 查询参数
| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| type | string | 习惯类型筛选 (good/bad) | `?type=good` |
| difficulty | string | 难度筛选 (trivial/easy/medium/hard) | `?difficulty=easy` |
| archived | boolean | 是否包含已归档习惯 | `?archived=false` |
| page | number | 页码 (默认1) | `?page=1` |
| limit | number | 每页数量 (默认20) | `?limit=10` |
| sortBy | string | 排序字段 (默认position) | `?sortBy=createdAt` |
| sortOrder | string | 排序顺序 (ASC/DESC) | `?sortOrder=DESC` |

#### 响应示例
**成功 (200)**
```json
{
  "success": true,
  "data": {
    "habits": [
      {
        "id": 1,
        "title": "每日锻炼",
        "notes": "每天锻炼30分钟",
        "type": "good",
        "difficulty": "medium",
        "upCount": 5,
        "downCount": 1,
        "counterUp": 10,
        "counterDown": 2,
        "position": 0,
        "isPositive": true,
        "isNegative": true,
        "isArchived": false,
        "createdAt": "2024-12-15T10:00:00.000Z",
        "updatedAt": "2024-12-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

---

### 2. 获取单个习惯
**GET** `/habits/:id`

#### 响应示例
**成功 (200)**
```json
{
  "success": true,
  "data": {
    "habit": {
      "id": 1,
      "title": "每日锻炼",
      "notes": "每天锻炼30分钟",
      "type": "good",
      "difficulty": "medium",
      "upCount": 5,
      "downCount": 1,
      "counterUp": 10,
      "counterDown": 2,
      "position": 0,
      "isPositive": true,
      "isNegative": true,
      "isArchived": false,
      "createdAt": "2024-12-15T10:00:00.000Z",
      "updatedAt": "2024-12-15T10:00:00.000Z"
    }
  }
}
```

**失败 (404)**
```json
{
  "success": false,
  "message": "习惯不存在"
}
```

---

### 3. 创建新习惯
**POST** `/habits`

#### 请求参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 习惯标题 (1-255字符) |
| notes | string | 否 | 习惯备注 (最大1000字符) |
| type | string | 是 | 习惯类型: good/bad |
| difficulty | string | 否 | 难度: trivial/easy/medium/hard (默认easy) |
| isPositive | boolean | 否 | 是否支持正向评分 (默认true) |
| isNegative | boolean | 否 | 是否支持负向评分 (默认true) |
| position | number | 否 | 排序位置 (默认0) |

#### 请求示例
```json
{
  "title": "每日阅读",
  "notes": "每天阅读30分钟书籍",
  "type": "good",
  "difficulty": "easy",
  "isPositive": true,
  "isNegative": false
}
```

#### 响应示例
**成功 (201)**
```json
{
  "success": true,
  "message": "习惯创建成功",
  "data": {
    "habit": {
      "id": 2,
      "title": "每日阅读",
      "notes": "每天阅读30分钟书籍",
      "type": "good",
      "difficulty": "easy",
      "upCount": 0,
      "downCount": 0,
      "counterUp": 0,
      "counterDown": 0,
      "position": 0,
      "isPositive": true,
      "isNegative": false,
      "isArchived": false,
      "createdAt": "2024-12-15T10:30:00.000Z",
      "updatedAt": "2024-12-15T10:30:00.000Z"
    }
  }
}
```

**失败 (400)**
```json
{
  "success": false,
  "message": "输入验证失败",
  "errors": ["title不能为空"]
}
```

---

### 4. 更新习惯
**PUT** `/habits/:id`

#### 请求参数
所有参数均为可选，至少提供一个需要更新的字段。

| 参数 | 类型 | 说明 |
|------|------|------|
| title | string | 习惯标题 (1-255字符) |
| notes | string | 习惯备注 (最大1000字符) |
| type | string | 习惯类型: good/bad |
| difficulty | string | 难度: trivial/easy/medium/hard |
| isPositive | boolean | 是否支持正向评分 |
| isNegative | boolean | 是否支持负向评分 |
| position | number | 排序位置 |

#### 请求示例
```json
{
  "title": "每日阅读30分钟",
  "difficulty": "medium"
}
```

#### 响应示例
**成功 (200)**
```json
{
  "success": true,
  "message": "习惯更新成功",
  "data": {
    "habit": {
      "id": 2,
      "title": "每日阅读30分钟",
      "difficulty": "medium"
    }
  }
}
```

---

### 5. 删除习惯
**DELETE** `/habits/:id`

#### 响应示例
**成功 (200)**
```json
{
  "success": true,
  "message": "习惯删除成功"
}
```

---

### 6. 评分习惯
**POST** `/habits/:id/score`

#### 请求参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| action | string | 是 | 评分动作: up/down |

#### 请求示例
```json
{
  "action": "up"
}
```

#### 响应示例
**成功 (200)**
```json
{
  "success": true,
  "message": "习惯正向评分成功",
  "data": {
    "habit": {
      "id": 1,
      "title": "每日锻炼",
      "upCount": 6,
      "counterUp": 11
    },
    "action": "up"
  }
}
```

---

### 7. 归档/取消归档习惯
**POST** `/habits/:id/archive`

#### 请求参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| archive | boolean | 否 | true=归档, false=取消归档 (默认true) |

#### 请求示例
```json
{
  "archive": true
}
```

#### 响应示例
**成功 (200)**
```json
{
  "success": true,
  "message": "习惯归档成功",
  "data": {
    "habit": {
      "id": 1,
      "isArchived": true
    }
  }
}
```

---

### 8. 获取用户习惯统计
**GET** `/habits/stats`

#### 响应示例
**成功 (200)**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total": 5,
      "byType": {
        "good": 3,
        "bad": 2
      },
      "byDifficulty": {
        "trivial": 1,
        "easy": 2,
        "medium": 1,
        "hard": 1
      },
      "archived": 1,
      "active": 4,
      "totalUpvotes": 15,
      "totalDownvotes": 3,
      "totalCounterUp": 25,
      "totalCounterDown": 5
    }
  }
}
```

---

## 数据模型说明

### 习惯类型
- **good**: 好习惯（如：锻炼、阅读）
- **bad**: 坏习惯（如：熬夜、抽烟）

### 难度等级
- **trivial**: 微不足道
- **easy**: 简单
- **medium**: 中等
- **hard**: 困难

### 评分系统
- **upCount**: 正向评分次数
- **downCount**: 负向评分次数
- **counterUp**: 正向计数器（实际执行次数）
- **counterDown**: 负向计数器（实际避免次数）

---

## 错误码说明

| 状态码 | 说明 |
|--------|------|
| 200    | 请求成功 |
| 201    | 创建成功 |
| 400    | 请求参数错误 |
| 401    | 未授权（令牌无效或缺失） |
| 404    | 习惯不存在 |
| 409    | 资源冲突 |
| 500    | 服务器内部错误 |

---

## 测试示例

### 使用curl测试
```bash
# 需要先登录获取token
TOKEN="your-jwt-token"

# 创建习惯
curl -X POST http://localhost:3000/api/habits \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"每日锻炼","notes":"每天锻炼30分钟","type":"good","difficulty":"medium"}'

# 获取所有习惯
curl -X GET http://localhost:3000/api/habits \
  -H "Authorization: Bearer $TOKEN"

# 评分习惯
curl -X POST http://localhost:3000/api/habits/1/score \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"up"}'

# 归档习惯
curl -X POST http://localhost:3000/api/habits/1/archive \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"archive":true}'

# 获取统计
curl -X GET http://localhost:3000/api/habits/stats \
  -H "Authorization: Bearer $TOKEN"
```

### 使用JavaScript测试
```javascript
// 获取token后
const token = 'your-jwt-token';

// 创建习惯
const createResponse = await fetch('http://localhost:3000/api/habits', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: '每日阅读',
    notes: '每天阅读30分钟',
    type: 'good',
    difficulty: 'easy'
  })
});

// 获取习惯列表
const habitsResponse = await fetch('http://localhost:3000/api/habits', {
  headers: { 'Authorization': `Bearer ${token}` }
});
