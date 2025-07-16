class ApiConstants {
  // 后端API基础URL
  static const String baseUrl = 'http://localhost:3000';

  // 认证相关端点
  static const String login = '/api/auth/login';
  static const String register = '/api/auth/register';
  static const String logout = '/api/auth/logout';
  static const String refreshToken = '/api/auth/refresh';
  static const String validateToken = '/api/auth/validate';

  // 用户相关端点
  static const String userProfile = '/api/users/profile';
  static const String userSettings = '/api/users/settings';

  // 习惯相关端点
  static const String habits = '/api/habits';
  static const String habitCheckins = '/api/habits/checkins';

  // 成就相关端点
  static const String achievements = '/api/achievements';

  // 游戏相关端点
  static const String games = '/api/games';
  static const String gameProgress = '/api/games/progress';
}
