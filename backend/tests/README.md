# 好友系统测试套件

本测试套件为TimePal应用的好友系统提供了全面的测试覆盖，包括单元测试、集成测试和服务层测试。

## 测试结构

```
tests/
├── unit/
│   ├── friend.test.js          # 好友模型单元测试
│   ├── message.test.js         # 消息模型单元测试
│   ├── friendService.test.js   # 好友服务层单元测试
│   └── messageService.test.js  # 消息服务层单元测试
├── integration/
│   ├── friends.test.js         # 好友功能集成测试
│   ├── messages.test.js        # 消息功能集成测试
│   └── friends-leaderboard.test.js  # 排行榜集成测试
└── README.md                   # 测试文档
```

## 测试覆盖范围

### 好友功能测试覆盖
- ✅ 好友请求发送/接受/拒绝的所有场景
- ✅ 好友列表获取的各种条件
- ✅ 好友关系状态检查
- ✅ 好友搜索功能
- ✅ 好友移除功能
- ✅ 权限验证和认证测试
- ✅ 错误处理和边界条件

### 消息功能测试覆盖
- ✅ 消息发送、接收、已读状态
- ✅ 对话消息获取
- ✅ 消息搜索功能
- ✅ 消息删除（软删除）
- ✅ 未读消息统计
- ✅ 批量标记已读
- ✅ 权限验证和认证测试

### 排行榜功能测试覆盖
- ✅ 按等级排序和排名
- ✅ 按经验值排序
- ✅ 按金币/黄金排序
- ✅ 按任务完成数排序
- ✅ 按连击数排序
- ✅ 用户排名计算
- ✅ 边界值和异常处理

## 运行测试

### 运行所有测试
```bash
npm test
```

### 运行特定测试文件
```bash
# 运行好友功能单元测试
npm test -- tests/unit/friend.test.js

# 运行消息功能集成测试
npm test -- tests/integration/messages.test.js

# 运行所有集成测试
npm test -- tests/integration/
```

### 运行测试并生成覆盖率报告
```bash
npm run test:coverage
```

## 测试数据工厂

测试使用以下数据工厂模式：

### 用户模板
```javascript
const userTemplate = {
  username: 'testuser',
  email: 'test@example.com',
  passwordHash: 'hashed_password',
  level: 10,
  experience: 1000,
  coins: 500,
  gold: 1000,
  totalTasksCompleted: 50,
  streakHighest: 20,
  loginStreak: 5
};
```

### 测试场景

#### 好友关系状态
- `none`: 无关系
- `pending`: 待处理请求
- `accepted`: 已接受
- `blocked`: 已屏蔽
- `self`: 自己

#### 消息状态
- `sent`: 已发送
- `delivered`: 已送达
- `read`: 已读

## 测试最佳实践

### 1. 测试隔离
- 每个测试文件使用独立的测试数据库
- 使用 `beforeEach` 和 `afterEach` 清理测试数据
- 避免测试间的数据依赖

### 2. 边界条件测试
- 空值处理
- 极值测试（最大值、最小值）
- 特殊字符处理
- 并发操作测试

### 3. 错误处理测试
- 无效参数
- 权限不足
- 资源不存在
- 数据库错误模拟

### 4. 性能测试
- 分页查询测试
- 大数据量处理
- 并发请求处理

## 测试环境配置

### 环境变量
```bash
NODE_ENV=test
JWT_SECRET=test-secret
DATABASE_URL=sqlite::memory:
```

### 测试数据库
使用内存中的SQLite数据库，确保测试快速运行且不影响生产数据。

## 新增测试指南

### 添加新的单元测试
1. 在 `tests/unit/` 目录下创建新的测试文件
2. 遵循现有的测试结构和命名规范
3. 确保测试覆盖所有边界条件

### 添加新的集成测试
1. 在 `tests/integration/` 目录下创建新的测试文件
2. 使用相同的用户创建和清理模式
3. 测试完整的API流程

### 测试命名规范
- 测试描述使用中文，清晰表达测试目的
- 使用 `should` 开头描述期望行为
- 按功能模块组织测试用例

## 调试测试

### 调试单个测试
```bash
npm test -- --verbose tests/unit/friend.test.js
```

### 调试失败的测试
```bash
npm test -- --detectOpenHandles
```

## 持续集成

测试套件已配置为在以下情况下自动运行：
- 代码提交时
- Pull Request创建时
- 部署前检查

## 覆盖率要求
- 语句覆盖率: > 80%
- 分支覆盖率: > 75%
- 函数覆盖率: > 85%
- 行覆盖率: > 80%

## 常见问题

### 测试失败排查
1. 检查数据库连接
2. 验证测试数据是否正确创建
3. 确认权限和认证设置
4. 检查边界条件处理

### 性能优化
- 使用事务批量操作
- 合理使用索引
- 避免N+1查询问题
- 使用内存数据库加速测试

## 更新日志

- v1.0.0: 初始测试套件创建
- v1.1.0: 添加排行榜测试
- v1.2.0: 完善边界条件测试
- v1.3.0: 添加性能测试用例
