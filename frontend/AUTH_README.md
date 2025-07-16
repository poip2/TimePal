# TimePal 用户认证系统

## 功能概述

本项目实现了完整的用户认证系统前端界面，包括：

### ✅ 已完成功能
- [x] 登录页面 (`LoginPage`)
- [x] 注册页面 (`RegisterPage`)
- [x] 表单验证（前端）
- [x] 状态管理（Provider）
- [x] 加载状态和错误处理
- [x] 自动登录（记住我功能）
- [x] 响应式设计适配
- [x] 深色/浅色主题支持

### 🎯 技术栈
- **Flutter**: 跨平台移动应用开发框架
- **Provider**: 状态管理
- **Dio**: HTTP客户端
- **SharedPreferences**: 本地存储
- **Material Design 3**: 现代UI设计

### 📁 项目结构

```
lib/
├── core/
│   ├── constants/
│   │   ├── app_colors.dart      # 应用颜色定义
│   │   ├── app_text_styles.dart # 文本样式定义
│   │   └── api_constants.dart   # API常量配置
│   └── services/
│       └── auth_service.dart    # 认证服务
├── data/
│   ├── models/
│   │   └── user_model.dart      # 用户数据模型
│   └── providers/
│       └── auth_provider.dart   # 认证状态管理
└── presentation/
    └── pages/
        └── auth/
            ├── login_page.dart   # 登录页面
            └── register_page.dart # 注册页面
```

### 🚀 快速开始

#### 1. 安装依赖
```bash
cd frontend
flutter pub get
```

#### 2. 配置后端API
编辑 `lib/core/constants/api_constants.dart` 文件，设置正确的后端API地址：

```dart
class ApiConstants {
  static const String baseUrl = 'http://your-backend-url.com';
}
```

#### 3. 运行应用
```bash
# 运行调试版本
flutter run

# 运行发布版本
flutter run --release
```

### 🔧 功能测试

#### 登录测试
1. 启动应用后会自动跳转到登录页面
2. 输入测试用户名和密码
3. 点击"登录"按钮
4. 验证是否成功跳转到仪表板

#### 注册测试
1. 在登录页面点击"立即注册"
2. 填写注册表单：
   - 用户名（3-20个字符，字母数字下划线）
   - 邮箱地址（有效格式）
   - 密码（至少6个字符，包含大小写字母和数字）
   - 确认密码（必须与密码一致）
3. 勾选用户协议
4. 点击"注册"按钮
5. 验证是否成功注册并跳转到仪表板

#### 自动登录测试
1. 成功登录后关闭应用
2. 重新启动应用
3. 验证是否自动跳转到仪表板（无需再次登录）

### 🎨 设计特性

#### 响应式设计
- 适配不同屏幕尺寸
- 支持横竖屏切换
- 平板电脑优化布局

#### 主题支持
- 自动跟随系统主题
- 支持深色/浅色模式切换
- 一致的颜色和字体规范

#### 用户体验
- 表单实时验证
- 友好的错误提示
- 加载动画反馈
- 密码可见性切换
- 记住登录状态

### 🔐 安全特性

- 密码强度验证
- 输入数据清理
- 安全存储用户凭证
- Token自动验证
- 安全的登出机制

### 📱 支持的设备

- **iOS**: iPhone 8及以上
- **Android**: Android 5.0 (API 21)及以上
- **Web**: Chrome, Safari, Firefox
- **桌面**: Windows, macOS, Linux

### 🐛 常见问题

#### Q: 无法连接到后端API
A: 检查 `api_constants.dart` 中的 `baseUrl` 是否正确配置，确保后端服务正在运行。

#### Q: 登录/注册失败
A: 检查网络连接，验证后端API是否正常工作，查看控制台错误信息。

#### Q: 自动登录不工作
A: 确保应用有存储权限，检查SharedPreferences是否正确保存了token。

### 🔮 后续计划

- [ ] 集成真实的后端API
- [ ] 添加忘记密码功能
- [ ] 实现第三方登录（微信、QQ等）
- [ ] 添加生物识别登录（指纹、面容ID）
- [ ] 优化性能和用户体验
- [ ] 添加单元测试和集成测试

### 📞 技术支持

如有问题，请通过以下方式联系：
- GitHub Issues: [创建Issue](https://github.com/poip2/TimePal-AI/issues)
- 邮箱: support@timepal.app
