# TimePal 实现计划文档

## 1. 项目概述

### 1.1 项目目标
基于PRD文档，开发TimePal - 一款专为中国用户设计的习惯养成与时间管理应用。

### 1.2 技术栈
- **前端**: Flutter 3.0+
- **后端**: Node.js + Express.js
- **数据库**: PostgreSQL
- **部署**: Docker + 云服务器

### 1.3 开发周期
总计6周（4周开发 + 1周测试 + 1周发布）

## 2. 开发阶段规划

### 第一阶段：基础架构搭建（第1周）

#### 任务1.1：环境搭建
- **状态**: 待开始
- **负责人**: 开发团队
- **预计时间**: 2天
- **任务内容**:
  - 安装Flutter开发环境
  - 配置Node.js开发环境
  - 搭建PostgreSQL数据库
  - 配置开发工具（VSCode、Postman等）

#### 任务1.2：项目初始化
- **状态**: 待开始
- **负责人**: 开发团队
- **预计时间**: 1天
- **任务内容**:
  - 创建Flutter项目结构
  - 创建Express.js后端项目
  - 配置项目依赖
  - 设置代码规范和Git工作流

#### 任务1.3：数据库设计与实现
- **状态**: 待开始
- **负责人**: 后端开发
- **预计时间**: 2天
- **任务内容**:
  - 设计数据库ER图
  - 创建数据库表结构
  - 编写数据库迁移脚本
  - 设置数据库连接池

**参考资源**:
- PostgreSQL官方文档
- Sequelize ORM文档

### 第二阶段：用户系统开发（第1-2周）

#### 任务2.1：用户认证系统
- **状态**: 待开始
- **负责人**: 后端开发
- **预计时间**: 3天
- **任务内容**:
  - 实现用户注册API
  - 实现用户登录API
  - JWT令牌生成与验证
  - 密码加密存储
  - 输入验证和错误处理

#### 任务2.2：用户管理界面
- **状态**: 待开始
- **负责人**: 前端开发
- **预计时间**: 3天
- **任务内容**:
  - 创建登录页面
  - 创建注册页面
  - 实现表单验证
  - 集成API调用
  - 实现状态管理

#### 任务2.3：用户档案功能
- **状态**: 待开始
- **负责人**: 全栈开发
- **预计时间**: 2天
- **任务内容**:
  - 用户信息编辑API
  - 头像上传功能
  - 个人资料页面
  - 数据持久化

**参考资源**:
- [prijindal/habiticapp](https://github.com/prijindal/habiticapp) - 用户界面参考
- [noah-ing/habitica-clone](https://github.com/noah-ing/habitica-clone) - 后端API参考

### 第三阶段：习惯管理系统（第2-3周）

#### 任务3.1：习惯CRUD操作
- **状态**: 待开始
- **负责人**: 后端开发
- **预计时间**: 2天
- **任务内容**:
  - 创建习惯API
  - 获取习惯列表API
  - 更新习惯API
  - 删除习惯API
  - 习惯分类管理

#### 任务3.2：习惯打卡系统
- **状态**: 待开始
- **负责人**: 后端开发
- **预计时间**: 2天
- **任务内容**:
  - 打卡记录API
  - 打卡状态查询
  - 连续打卡计算
  - 打卡历史记录
  - 数据统计API

#### 任务3.3：习惯管理界面
- **状态**: 待开始
- **负责人**: 前端开发
- **预计时间**: 4天
- **任务内容**:
  - 习惯列表页面
  - 习惯创建/编辑页面
  - 打卡界面设计
  - 习惯统计页面
  - 图表展示组件

#### 任务3.4：推送通知
- **状态**: 待开始
- **负责人**: 前端开发
- **预计时间**: 2天
- **任务内容**:
  - 本地通知配置
  - 提醒时间设置
  - 通知权限管理
  - 通知内容定制

### 第四阶段：游戏化系统（第3周）

#### 任务4.1：等级经验系统
- **状态**: 待开始
- **负责人**: 后端开发
- **预计时间**: 2天
- **任务内容**:
  - 经验值计算逻辑
  - 等级升级机制
  - 经验值API接口
  - 等级奖励系统

#### 任务4.2：货币系统
- **状态**: 待开始
- **负责人**: 后端开发
- **预计时间**: 2天
- **任务内容**:
  - 金币获取机制
  - 金币消费逻辑
  - 金币商店API
  - 虚拟物品管理

#### 任务4.3：成就系统
- **状态**: 待开始
- **负责人**: 全栈开发
- **预计时间**: 3天
- **任务内容**:
  - 成就定义和配置
  - 成就检测逻辑
  - 成就解锁通知
  - 成就展示界面

### 第五阶段：小游戏集成（第4周）

#### 任务5.1：WebView集成
- **状态**: 待开始
- **负责人**: 前端开发
- **预计时间**: 1天
- **任务内容**:
  - 配置webview_flutter插件
  - 创建WebView容器组件
  - 处理页面加载状态
  - 实现JavaScript通信

#### 任务5.2：人生重开游戏集成
- **状态**: 待开始
- **负责人**: 前端开发
- **预计时间**: 2天
- **任务内容**:
  - 部署lifeRestart项目
  - 集成到Flutter应用
  - 游戏数据与主应用交互
  - 游戏界面优化

#### 任务5.3：旅行青蛙游戏集成
- **状态**: 待开始
- **负责人**: 前端开发
- **预计时间**: 2天
- **任务内容**:
  - 部署TravelFrog项目
  - 集成到Flutter应用
  - 与习惯系统关联
  - 游戏进度同步

#### 任务5.4：游戏导航与管理
- **状态**: 待开始
- **负责人**: 前端开发
- **预计时间**: 2天
- **任务内容**:
  - 游戏入口设计
  - 游戏切换功能
  - 游戏历史记录
  - 游戏设置页面

**参考资源**:
- [VickScarlet/lifeRestart](https://github.com/VickScarlet/lifeRestart)
- [jsmask/TravelFrog](https://github.com/jsmask/TravelFrog)

### 第六阶段：系统集成与优化（第4周）

#### 任务6.1：API集成测试
- **状态**: 待开始
- **负责人**: 全栈开发
- **预计时间**: 2天
- **任务内容**:
  - 前后端API联调
  - 数据流测试
  - 错误处理验证
  - 性能优化

#### 任务6.2：UI/UX优化
- **状态**: 待开始
- **负责人**: 前端开发
- **预计时间**: 2天
- **任务内容**:
  - 界面美化
  - 动画效果添加
  - 响应式设计
  - 用户体验优化

#### 任务6.3：数据持久化与同步
- **状态**: 待开始
- **负责人**: 全栈开发
- **预计时间**: 1天
- **任务内容**:
  - 本地数据缓存
  - 数据同步机制
  - 离线模式支持
  - 数据备份策略

## 3. 测试阶段（第5周）

### 任务7.1：功能测试
- **状态**: 待开始
- **负责人**: 测试团队
- **预计时间**: 2天
- **任务内容**:
  - 用户注册登录测试
  - 习惯管理功能测试
  - 游戏化系统测试
  - 小游戏集成测试

### 任务7.2：性能测试
- **状态**: 待开始
- **负责人**: 测试团队
- **预计时间**: 2天
- **任务内容**:
  - 应用启动时间测试
  - 内存使用测试
  - 网络请求性能测试
  - 数据库查询优化

### 任务7.3：兼容性测试
- **状态**: 待开始
- **负责人**: 测试团队
- **预计时间**: 1天
- **任务内容**:
  - 不同Android版本测试
  - 不同屏幕尺寸测试
  - 不同设备性能测试

## 4. 发布阶段（第6周）

### 任务8.1：应用打包
- **状态**: 待开始
- **负责人**: 开发团队
- **预计时间**: 1天
- **任务内容**:
  - 配置应用签名
  - 生成发布版APK
  - 应用图标和启动页
  - 版本信息配置

### 任务8.2：部署上线
- **状态**: 待开始
- **负责人**: 运维团队
- **预计时间**: 2天
- **任务内容**:
  - 后端服务器部署
  - 数据库生产环境配置
  - 域名和SSL证书配置
  - 监控和日志系统

### 任务8.3：用户反馈收集
- **状态**: 待开始
- **负责人**: 产品团队
- **预计时间**: 2天
- **任务内容**:
  - 内测用户招募
  - 反馈收集机制
  - 问题跟踪和修复
  - 用户满意度调查

## 5. 技术实现细节

### 5.1 Flutter前端架构
```
lib/
├── main.dart                 # 应用入口
├── app/                     # 应用配置
│   ├── app.dart
│   └── routes.dart
├── core/                    # 核心功能
│   ├── constants/
│   ├── utils/
│   └── services/
├── data/                    # 数据层
│   ├── models/
│   ├── repositories/
│   └── providers/
├── presentation/            # 表现层
│   ├── pages/
│   ├── widgets/
│   └── themes/
└── domain/                  # 业务逻辑
    ├── entities/
    ├── usecases/
    └── repositories/
```

### 5.2 Node.js后端架构
```
src/
├── app.js                   # 应用入口
├── config/                  # 配置文件
│   ├── database.js
│   └── auth.js
├── controllers/             # 控制器
│   ├── authController.js
│   ├── habitController.js
│   └── gameController.js
├── models/                  # 数据模型
│   ├── User.js
│   ├── Habit.js
│   └── CheckIn.js
├── routes/                  # 路由
│   ├── auth.js
│   ├── habits.js
│   └── games.js
├── middleware/              # 中间件
│   ├── auth.js
│   └── validation.js
└── services/                # 服务层
    ├── authService.js
    ├── habitService.js
    └── gameService.js
```

### 5.3 数据库设计
```sql
-- 用户表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    coins INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 习惯表
CREATE TABLE habits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    frequency VARCHAR(20) DEFAULT 'daily',
    category VARCHAR(50),
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 打卡记录表
CREATE TABLE check_ins (
    id SERIAL PRIMARY KEY,
    habit_id INTEGER REFERENCES habits(id),
    user_id INTEGER REFERENCES users(id),
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- 成就表
CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    achievement_type VARCHAR(50) NOT NULL,
    achievement_name VARCHAR(100) NOT NULL,
    description TEXT,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 6. 关键技术点

### 6.1 状态管理
- 使用Provider或Riverpod进行状态管理
- 实现数据持久化
- 处理异步操作

### 6.2 网络请求
- 使用Dio进行HTTP请求
- 实现请求拦截器
- 错误处理和重试机制

### 6.3 本地存储
- 使用SharedPreferences存储用户设置
- 使用SQLite存储离线数据
- 实现数据同步策略

### 6.4 WebView集成
- 配置JavaScript通信
- 处理页面加载状态
- 实现数据交互

## 7. 部署配置

### 7.1 后端部署
```dockerfile
# Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### 7.2 数据库配置
```javascript
// config/database.js
module.exports = {
  development: {
    host: 'localhost',
    port: 5432,
    database: 'timepal_dev',
    username: 'postgres',
    password: 'password',
    dialect: 'postgres'
  },
  production: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    dialect: 'postgres'
  }
};
```

## 8. 质量保证

### 8.1 代码规范
- 使用ESLint进行JavaScript代码检查
- 使用Prettier进行代码格式化
- 实施代码审查流程

### 8.2 测试策略
- 单元测试覆盖率 > 80%
- 集成测试覆盖关键流程
- 端到端测试覆盖主要用户场景

### 8.3 性能监控
- 实施APM监控
- 设置关键指标告警
- 定期性能分析和优化

## 9. 风险管控

### 9.1 技术风险
- **风险**: 第三方游戏集成复杂度高
- **应对**: 提前进行技术验证，准备备选方案

### 9.2 进度风险
- **风险**: 开发进度延期
- **应对**: 定期进度检查，及时调整资源分配

### 9.3 质量风险
- **风险**: 功能缺陷影响用户体验
- **应对**: 完善测试流程，建立质量门禁

## 10. 后续迭代计划

### 10.1 第一次迭代（发布后1个月）
- 用户反馈收集和分析
- 关键bug修复
- 性能优化
- 新增统计分析功能

### 10.2 第二次迭代（发布后2个月）
- 社交功能开发
- 更多游戏集成
- 主题定制功能
- 数据导出功能

### 10.3 长期规划
- iOS版本开发
- 云同步功能
- 高级分析功能
- 企业版本

---

**文档版本**: v1.0  
**创建日期**: 2024年12月  
**最后更新**: 2024年12月  
**维护人**: 开发团队 