import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/services/auth_service.dart';
import '../models/user_model.dart';

class AuthProvider with ChangeNotifier {
  UserModel? _user;
  String? _token;
  bool _isLoading = false;
  String? _error;
  final AuthService _authService = AuthService();

  // Getters
  UserModel? get user => _user;
  String? get token => _token;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _token != null && _user != null;

  // 检查是否已登录
  Future<bool> checkAuthStatus() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('auth_token');

      if (token != null) {
        final result = await _authService.validateToken(token);
        if (result['success']) {
          _token = token;
          _user = result['user'];
          notifyListeners();
          return true;
        } else {
          // Token无效，清除本地存储
          await prefs.remove('auth_token');
          await prefs.remove('user_data');
        }
      }
      return false;
    } catch (e) {
      _error = '检查登录状态失败: $e';
      notifyListeners();
      return false;
    }
  }

  // 登录
  Future<bool> login(String username, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _authService.login(
        username: username,
        password: password,
      );

      if (result['success']) {
        _token = result['token'];
        _user = result['user'];

        // 保存到本地存储
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', _token!);
        await prefs.setString('user_data', jsonEncode(_user!.toJson()));

        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _isLoading = false;
        _error = result['error'];
        notifyListeners();
        return false;
      }
    } catch (e) {
      _isLoading = false;
      _error = '登录失败: $e';
      notifyListeners();
      return false;
    }
  }

  // 注册
  Future<bool> register({
    required String username,
    required String email,
    required String password,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _authService.register(
        username: username,
        email: email,
        password: password,
      );

      if (result['success']) {
        _token = result['token'];
        _user = result['user'];

        // 保存到本地存储
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', _token!);
        await prefs.setString('user_data', jsonEncode(_user!.toJson()));

        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _isLoading = false;
        _error = result['error'];
        notifyListeners();
        return false;
      }
    } catch (e) {
      _isLoading = false;
      _error = '注册失败: $e';
      notifyListeners();
      return false;
    }
  }

  // 登出
  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('auth_token');
      await prefs.remove('user_data');

      _token = null;
      _user = null;
      _error = null;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _error = '登出失败: $e';
      notifyListeners();
    }
  }

  // 清除错误
  void clearError() {
    _error = null;
    notifyListeners();
  }

  // 更新用户信息
  Future<bool> updateUserProfile({
    String? username,
    String? email,
    String? avatar,
  }) async {
    if (_token == null) return false;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _authService.updateUserProfile(
        token: _token!,
        username: username,
        email: email,
        avatar: avatar,
      );

      if (result['success']) {
        _user = result['user'];

        // 更新本地存储
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_data', jsonEncode(_user!.toJson()));

        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _isLoading = false;
        _error = result['error'];
        notifyListeners();
        return false;
      }
    } catch (e) {
      _isLoading = false;
      _error = '更新用户信息失败: $e';
      notifyListeners();
      return false;
    }
  }

  // 刷新用户信息
  Future<bool> refreshUserProfile() async {
    if (_token == null) return false;

    try {
      final result = await _authService.getUserProfile(_token!);

      if (result['success']) {
        _user = result['user'];

        // 更新本地存储
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_data', jsonEncode(_user!.toJson()));

        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      _error = '刷新用户信息失败: $e';
      notifyListeners();
      return false;
    }
  }
}
