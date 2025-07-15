# 用户认证API文档

## 基础信息
- **Base URL**: `http://localhost:3000/api`
- **认证方式**: JWT Bearer Token
- **Content-Type**: `application/json`

## 认证流程
1. 用户注册 → 获取JWT令牌
2. 后续请求在Header中添加: `Authorization: Bearer <token>`

---

## API端点

### 1. 用户注册
**POST** `/auth/register`

#### 请求参数
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

#### 响应示例
**成功 (201)**
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "level": 1,
      "experience": 0,
      "coins": 0,
      "avatarUrl": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**失败 (400)**
```json
{
  "success": false,
  "message": "输入验证失败",
  "errors": ["username长度必须在3-50个字符之间"]
}
```

**失败 (409)**
```json
{
  "success": false,
  "message": "用户名或邮箱已存在"
}
```

---

### 2. 用户登录
**POST** `/auth/login`

#### 请求参数
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

#### 响应示例
**成功 (200)**
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "level": 1,
      "experience": 0,
      "coins": 0,
      "avatarUrl": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**失败 (401)**
```json
{
  "success": false,
  "message": "邮箱或密码错误"
}
```

---

### 3. 获取当前用户信息
**GET** `/auth/me`

#### Headers
```
Authorization: Bearer <token>
```

#### 响应示例
**成功 (200)**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "level": 1,
      "experience": 0,
      "coins": 0,
      "avatarUrl": null,
      "createdAt": "2024-12-15T10:00:00.000Z",
      "updatedAt": "2024-12-15T10:00:00.000Z"
    }
  }
}
```

**失败 (401)**
```json
{
  "success": false,
  "message": "访问令牌缺失"
}
```

---

### 4. 更新用户信息
**PUT** `/auth/profile`

#### Headers
```
Authorization: Bearer <token>
```

#### 请求参数
```json
{
  "username": "newusername",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

#### 响应示例
**成功 (200)**
```json
{
  "success": true,
  "message": "用户信息更新成功",
  "data": {
    "user": {
      "id": 1,
      "username": "newusername",
      "email": "test@example.com",
      "level": 1,
      "experience": 0,
      "coins": 0,
      "avatarUrl": "https://example.com/avatar.jpg"
    }
  }
}
```

---

## 错误码说明

| 状态码 | 说明 |
|--------|------|
| 200    | 请求成功 |
| 201    | 创建成功 |
| 400    | 请求参数错误 |
| 401    | 未授权（令牌无效或缺失） |
| 403    | 权限不足（账户被禁用） |
| 404    | 资源不存在 |
| 409    | 资源冲突（用户名/邮箱已存在） |
| 429    | 请求过于频繁 |
| 500    | 服务器内部错误 |

## 测试示例

### 使用curl测试
```bash
# 注册
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# 登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 获取用户信息
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <your-token>"
```

### 使用JavaScript测试
```javascript
// 注册
const response = await fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  })
});

const data = await response.json();
const token = data.data.token;

// 使用token获取用户信息
const userResponse = await fetch('http://localhost:3000/api/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
});
