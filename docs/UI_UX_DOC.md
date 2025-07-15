# TimePal UI/UX 设计文档

## 1. 设计概述

### 1.1 设计理念
TimePal的设计理念是"简约而不简单"，通过现代化的界面设计和流畅的交互体验，让用户在使用过程中感受到愉悦和成就感。

### 1.2 设计原则
- **简洁性**: 界面简洁明了，减少认知负担
- **一致性**: 保持设计元素和交互方式的一致性
- **可用性**: 优先考虑用户体验和操作便利性
- **可访问性**: 确保不同用户群体都能轻松使用
- **游戏化**: 通过视觉元素增强游戏化体验

### 1.3 目标用户体验
- 新用户能在3分钟内完成注册并创建第一个习惯
- 日常打卡操作不超过5秒
- 界面响应时间不超过1秒
- 用户满意度评分达到4.5分以上

## 2. 设计系统

### 2.1 颜色系统

#### 主色调
```css
/* 主色调 - 温暖的蓝色系 */
--primary-50: #E3F2FD;
--primary-100: #BBDEFB;
--primary-200: #90CAF9;
--primary-300: #64B5F6;
--primary-400: #42A5F5;
--primary-500: #2196F3;  /* 主色 */
--primary-600: #1E88E5;
--primary-700: #1976D2;
--primary-800: #1565C0;
--primary-900: #0D47A1;
```

#### 辅助色调
```css
/* 成功色 - 绿色 */
--success-50: #E8F5E8;
--success-500: #4CAF50;
--success-700: #388E3C;

/* 警告色 - 橙色 */
--warning-50: #FFF3E0;
--warning-500: #FF9800;
--warning-700: #F57C00;

/* 错误色 - 红色 */
--error-50: #FFEBEE;
--error-500: #F44336;
--error-700: #D32F2F;

/* 信息色 - 青色 */
--info-50: #E0F2F1;
--info-500: #00BCD4;
--info-700: #0097A7;
```

#### 中性色
```css
/* 灰色系 */
--gray-50: #FAFAFA;
--gray-100: #F5F5F5;
--gray-200: #EEEEEE;
--gray-300: #E0E0E0;
--gray-400: #BDBDBD;
--gray-500: #9E9E9E;
--gray-600: #757575;
--gray-700: #616161;
--gray-800: #424242;
--gray-900: #212121;

/* 文本色 */
--text-primary: #212121;
--text-secondary: #757575;
--text-disabled: #BDBDBD;
--text-hint: #9E9E9E;
```

### 2.2 字体系统

#### 字体族
```css
/* 主字体 */
--font-family-primary: 'SF Pro Display', 'PingFang SC', 'Microsoft YaHei', sans-serif;

/* 等宽字体 */
--font-family-mono: 'SF Mono', 'Monaco', 'Consolas', monospace;
```

#### 字体大小
```css
/* 标题字体 */
--font-size-h1: 32px;    /* 大标题 */
--font-size-h2: 24px;    /* 中标题 */
--font-size-h3: 20px;    /* 小标题 */
--font-size-h4: 18px;    /* 子标题 */

/* 正文字体 */
--font-size-body1: 16px;  /* 正文大 */
--font-size-body2: 14px;  /* 正文中 */
--font-size-caption: 12px; /* 说明文字 */
--font-size-overline: 10px; /* 标签文字 */
```

#### 字体权重
```css
--font-weight-light: 300;
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### 2.3 间距系统

#### 基础间距
```css
/* 8px网格系统 */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-xxl: 48px;
--spacing-xxxl: 64px;
```

#### 组件间距
```css
/* 组件内边距 */
--padding-xs: 8px;
--padding-sm: 12px;
--padding-md: 16px;
--padding-lg: 20px;
--padding-xl: 24px;

/* 组件外边距 */
--margin-xs: 8px;
--margin-sm: 12px;
--margin-md: 16px;
--margin-lg: 20px;
--margin-xl: 24px;
```

### 2.4 圆角系统

```css
/* 圆角半径 */
--radius-xs: 4px;    /* 小圆角 */
--radius-sm: 8px;    /* 中圆角 */
--radius-md: 12px;   /* 大圆角 */
--radius-lg: 16px;   /* 特大圆角 */
--radius-xl: 24px;   /* 超大圆角 */
--radius-full: 50%;  /* 完全圆形 */
```

### 2.5 阴影系统

```css
/* 阴影效果 */
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04);
```

## 3. 组件库

### 3.1 基础组件

#### 按钮组件
```dart
// 主要按钮
ElevatedButton(
  style: ElevatedButton.styleFrom(
    backgroundColor: primary500,
    foregroundColor: Colors.white,
    elevation: 2,
    padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(8),
    ),
  ),
  onPressed: onPressed,
  child: Text('主要按钮'),
)

// 次要按钮
OutlinedButton(
  style: OutlinedButton.styleFrom(
    foregroundColor: primary500,
    side: BorderSide(color: primary500),
    padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(8),
    ),
  ),
  onPressed: onPressed,
  child: Text('次要按钮'),
)

// 文本按钮
TextButton(
  style: TextButton.styleFrom(
    foregroundColor: primary500,
    padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
  ),
  onPressed: onPressed,
  child: Text('文本按钮'),
)
```

#### 输入框组件
```dart
TextFormField(
  decoration: InputDecoration(
    labelText: '标签文字',
    hintText: '提示文字',
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(8),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(8),
      borderSide: BorderSide(color: primary500, width: 2),
    ),
    contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
  ),
)
```

#### 卡片组件
```dart
Card(
  elevation: 2,
  shape: RoundedRectangleBorder(
    borderRadius: BorderRadius.circular(12),
  ),
  child: Padding(
    padding: EdgeInsets.all(16),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('卡片标题', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
        SizedBox(height: 8),
        Text('卡片内容', style: TextStyle(fontSize: 14, color: textSecondary)),
      ],
    ),
  ),
)
```

### 3.2 业务组件

#### 习惯卡片
```dart
class HabitCard extends StatelessWidget {
  final Habit habit;
  final VoidCallback onTap;
  final VoidCallback onCheckIn;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Row(
            children: [
              // 习惯图标
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: habit.color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(habit.icon, color: habit.color, size: 24),
              ),
              SizedBox(width: 16),
              // 习惯信息
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      habit.name,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: textPrimary,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      '连续${habit.streak}天',
                      style: TextStyle(
                        fontSize: 12,
                        color: textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              // 打卡按钮
              CheckInButton(
                isChecked: habit.isCheckedToday,
                onPressed: onCheckIn,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

#### 打卡按钮
```dart
class CheckInButton extends StatefulWidget {
  final bool isChecked;
  final VoidCallback onPressed;

  @override
  _CheckInButtonState createState() => _CheckInButtonState();
}

class _CheckInButtonState extends State<CheckInButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: Duration(milliseconds: 200),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.95).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => _controller.forward(),
      onTapUp: (_) => _controller.reverse(),
      onTapCancel: () => _controller.reverse(),
      onTap: widget.onPressed,
      child: AnimatedBuilder(
        animation: _scaleAnimation,
        builder: (context, child) {
          return Transform.scale(
            scale: _scaleAnimation.value,
            child: Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: widget.isChecked ? success500 : gray200,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 4,
                    offset: Offset(0, 2),
                  ),
                ],
              ),
              child: Icon(
                widget.isChecked ? Icons.check : Icons.add,
                color: widget.isChecked ? Colors.white : gray600,
                size: 24,
              ),
            ),
          );
        },
      ),
    );
  }
}
```

#### 进度条组件
```dart
class ProgressBar extends StatelessWidget {
  final double progress; // 0.0 to 1.0
  final Color color;
  final double height;

  const ProgressBar({
    Key? key,
    required this.progress,
    this.color = const Color(0xFF2196F3),
    this.height = 8.0,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      decoration: BoxDecoration(
        color: gray200,
        borderRadius: BorderRadius.circular(height / 2),
      ),
      child: FractionallySizedBox(
        widthFactor: progress,
        alignment: Alignment.centerLeft,
        child: Container(
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(height / 2),
          ),
        ),
      ),
    );
  }
}
```

### 3.3 导航组件

#### 底部导航栏
```dart
class CustomBottomNavigationBar extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(0, Icons.home, '首页'),
              _buildNavItem(1, Icons.list, '习惯'),
              _buildNavItem(2, Icons.games, '游戏'),
              _buildNavItem(3, Icons.person, '我的'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label) {
    final isSelected = currentIndex == index;
    return GestureDetector(
      onTap: () => onTap(index),
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? primary500.withOpacity(0.1) : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              color: isSelected ? primary500 : gray600,
              size: 24,
            ),
            SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: isSelected ? primary500 : gray600,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

## 4. 页面布局

### 4.1 首页布局
```dart
class HomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: gray50,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          'TimePal',
          style: TextStyle(
            color: textPrimary,
            fontSize: 20,
            fontWeight: FontWeight.w600,
          ),
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.notifications, color: gray600),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 用户信息卡片
            _buildUserInfoCard(),
            SizedBox(height: 24),
            
            // 今日习惯
            _buildSectionHeader('今日习惯'),
            SizedBox(height: 16),
            _buildTodayHabits(),
            SizedBox(height: 24),
            
            // 统计信息
            _buildSectionHeader('本周统计'),
            SizedBox(height: 16),
            _buildWeeklyStats(),
            SizedBox(height: 24),
            
            // 快捷入口
            _buildSectionHeader('快捷入口'),
            SizedBox(height: 16),
            _buildQuickActions(),
          ],
        ),
      ),
    );
  }
}
```

### 4.2 习惯列表页面
```dart
class HabitsPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: gray50,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text('我的习惯'),
        actions: [
          IconButton(
            icon: Icon(Icons.add),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => CreateHabitPage()),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // 筛选标签
          _buildFilterTabs(),
          
          // 习惯列表
          Expanded(
            child: ListView.builder(
              padding: EdgeInsets.symmetric(vertical: 8),
              itemCount: habits.length,
              itemBuilder: (context, index) {
                return HabitCard(
                  habit: habits[index],
                  onTap: () => _showHabitDetail(habits[index]),
                  onCheckIn: () => _checkInHabit(habits[index]),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
```

### 4.3 游戏中心页面
```dart
class GameCenterPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: gray50,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text('游戏中心'),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 游戏推荐
            _buildSectionHeader('推荐游戏'),
            SizedBox(height: 16),
            _buildFeaturedGames(),
            SizedBox(height: 24),
            
            // 所有游戏
            _buildSectionHeader('所有游戏'),
            SizedBox(height: 16),
            _buildAllGames(),
          ],
        ),
      ),
    );
  }
}
```

## 5. 用户流程设计

### 5.1 新用户引导流程

#### 流程图
```
开始 → 欢迎页面 → 注册页面 → 个人信息设置 → 创建第一个习惯 → 完成引导
```

#### 页面设计
1. **欢迎页面**
   - 应用Logo和slogan
   - 简洁的产品介绍
   - "开始使用"按钮

2. **注册页面**
   - 手机号/邮箱输入
   - 密码设置
   - 验证码验证
   - 第三方登录选项

3. **个人信息设置**
   - 昵称设置
   - 头像选择
   - 兴趣标签选择

4. **创建第一个习惯**
   - 习惯模板选择
   - 自定义习惯名称
   - 设置提醒时间

### 5.2 日常使用流程

#### 主要流程
```
打开应用 → 查看今日习惯 → 完成打卡 → 获得奖励 → 查看统计 → 玩游戏（可选）
```

#### 交互设计
1. **快速打卡**
   - 一键打卡按钮
   - 动画反馈
   - 经验值显示

2. **习惯管理**
   - 长按编辑
   - 滑动删除
   - 拖拽排序

3. **统计查看**
   - 图表展示
   - 数据筛选
   - 分享功能

### 5.3 游戏集成流程

#### 游戏入口设计
1. **游戏卡片**
   - 游戏截图
   - 游戏名称和描述
   - 游戏状态指示

2. **游戏启动**
   - 加载动画
   - 游戏规则说明
   - 开始游戏按钮

3. **游戏内交互**
   - 全屏游戏体验
   - 返回按钮
   - 游戏数据同步

## 6. 响应式设计

### 6.1 屏幕适配

#### 断点设置
```dart
class ScreenBreakpoints {
  static const double mobile = 480;
  static const double tablet = 768;
  static const double desktop = 1024;
}
```

#### 布局适配
```dart
class ResponsiveLayout extends StatelessWidget {
  final Widget mobile;
  final Widget? tablet;
  final Widget? desktop;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth >= ScreenBreakpoints.desktop) {
          return desktop ?? tablet ?? mobile;
        } else if (constraints.maxWidth >= ScreenBreakpoints.tablet) {
          return tablet ?? mobile;
        } else {
          return mobile;
        }
      },
    );
  }
}
```

### 6.2 字体缩放

```dart
class ResponsiveText extends StatelessWidget {
  final String text;
  final double baseFontSize;
  final FontWeight? fontWeight;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final scaleFactor = screenWidth / 375; // 基于iPhone X的宽度
    final fontSize = baseFontSize * scaleFactor.clamp(0.8, 1.2);

    return Text(
      text,
      style: TextStyle(
        fontSize: fontSize,
        fontWeight: fontWeight,
        color: color,
      ),
    );
  }
}
```

## 7. 动画设计

### 7.1 页面转场动画

```dart
class SlidePageRoute<T> extends PageRouteBuilder<T> {
  final Widget child;
  final AxisDirection direction;

  SlidePageRoute({
    required this.child,
    this.direction = AxisDirection.right,
  }) : super(
          pageBuilder: (context, animation, secondaryAnimation) => child,
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            var begin = _getBeginOffset(direction);
            var end = Offset.zero;
            var curve = Curves.ease;

            var tween = Tween(begin: begin, end: end).chain(
              CurveTween(curve: curve),
            );

            return SlideTransition(
              position: animation.drive(tween),
              child: child,
            );
          },
        );

  static Offset _getBeginOffset(AxisDirection direction) {
    switch (direction) {
      case AxisDirection.up:
        return Offset(0.0, 1.0);
      case AxisDirection.down:
        return Offset(0.0, -1.0);
      case AxisDirection.right:
        return Offset(-1.0, 0.0);
      case AxisDirection.left:
        return Offset(1.0, 0.0);
    }
  }
}
```

### 7.2 打卡动画

```dart
class CheckInAnimation extends StatefulWidget {
  final VoidCallback onComplete;

  @override
  _CheckInAnimationState createState() => _CheckInAnimationState();
}

class _CheckInAnimationState extends State<CheckInAnimation>
    with TickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _opacityAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: Duration(milliseconds: 800),
      vsync: this,
    );

    _scaleAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.elasticOut,
    ));

    _opacityAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeIn,
    ));

    _controller.forward().then((_) {
      Future.delayed(Duration(milliseconds: 500), () {
        widget.onComplete();
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: Opacity(
            opacity: _opacityAnimation.value,
            child: Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: success500,
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.check,
                color: Colors.white,
                size: 48,
              ),
            ),
          ),
        );
      },
    );
  }
}
```

## 8. 无障碍设计

### 8.1 语义化标签

```dart
Semantics(
  label: '习惯打卡按钮',
  hint: '点击完成今日习惯打卡',
  child: CheckInButton(
    onPressed: _onCheckIn,
  ),
)
```

### 8.2 颜色对比度

确保所有文本和背景的对比度符合WCAG 2.1 AA标准：
- 正常文本：对比度至少4.5:1
- 大文本：对比度至少3:1
- 图形元素：对比度至少3:1

### 8.3 字体大小

支持系统字体缩放，确保在不同字体大小设置下都能正常显示。

## 9. 国际化设计

### 9.1 文本国际化

```dart
class AppLocalizations {
  static const supportedLocales = [
    Locale('en', 'US'),
    Locale('zh', 'CN'),
  ];

  static Map<String, Map<String, String>> _localizedValues = {
    'en': {
      'app_title': 'TimePal',
      'login': 'Login',
      'register': 'Register',
      'habits': 'Habits',
      'check_in': 'Check In',
    },
    'zh': {
      'app_title': '时间伙伴',
      'login': '登录',
      'register': '注册',
      'habits': '习惯',
      'check_in': '打卡',
    },
  };
}
```

### 9.2 布局适配

考虑不同语言的文本长度差异，使用灵活的布局：

```dart
// 使用Flexible而不是固定宽度
Flexible(
  child: Text(
    AppLocalizations.of(context).translate('habit_name'),
    overflow: TextOverflow.ellipsis,
  ),
)
```

## 10. 性能优化

### 10.1 图片优化

```dart
// 使用缓存网络图片
CachedNetworkImage(
  imageUrl: imageUrl,
  placeholder: (context, url) => CircularProgressIndicator(),
  errorWidget: (context, url, error) => Icon(Icons.error),
  fit: BoxFit.cover,
)

// 使用占位符
FadeInImage.assetNetwork(
  placeholder: 'assets/images/placeholder.png',
  image: imageUrl,
  fit: BoxFit.cover,
)
```

### 10.2 列表优化

```dart
// 使用ListView.builder进行懒加载
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) {
    return ListTile(
      title: Text(items[index].title),
    );
  },
)

// 使用AutomaticKeepAliveClientMixin保持状态
class HabitCard extends StatefulWidget {
  @override
  _HabitCardState createState() => _HabitCardState();
}

class _HabitCardState extends State<HabitCard>
    with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Card(/* ... */);
  }
}
```

## 11. 错误处理

### 11.1 网络错误

```dart
class NetworkErrorWidget extends StatelessWidget {
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.wifi_off,
            size: 64,
            color: gray400,
          ),
          SizedBox(height: 16),
          Text(
            '网络连接失败',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: textPrimary,
            ),
          ),
          SizedBox(height: 8),
          Text(
            '请检查网络设置后重试',
            style: TextStyle(
              fontSize: 14,
              color: textSecondary,
            ),
          ),
          SizedBox(height: 24),
          ElevatedButton(
            onPressed: onRetry,
            child: Text('重试'),
          ),
        ],
      ),
    );
  }
}
```

### 11.2 空状态

```dart
class EmptyStateWidget extends StatelessWidget {
  final String title;
  final String description;
  final IconData icon;
  final VoidCallback? onAction;
  final String? actionText;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 64,
              color: gray400,
            ),
            SizedBox(height: 16),
            Text(
              title,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: textPrimary,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 8),
            Text(
              description,
              style: TextStyle(
                fontSize: 14,
                color: textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
            if (onAction != null && actionText != null) ...[
              SizedBox(height: 24),
              ElevatedButton(
                onPressed: onAction,
                child: Text(actionText!),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
```

---

**文档版本**: v1.0  
**创建日期**: 2024年12月  
**最后更新**: 2024年12月  
**维护人**: 设计团队 