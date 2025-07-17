// import 'dart:convert';
import 'package:dio/dio.dart';
import '../constants/api_constants.dart';
import '../../data/models/user_model.dart';

class AuthService {
  final Dio _dio = Dio();

  AuthService() {
    _dio.options.baseUrl = ApiConstants.baseUrl;
    _dio.options.connectTimeout = const Duration(seconds: 10);
    _dio.options.receiveTimeout = const Duration(seconds: 10);

    // 添加拦截器
    _dio.interceptors.add(
      InterceptorsWrapper(
        onError: (DioException e, ErrorInterceptorHandler handler) {
          // 统一错误处理
          if (e.response?.statusCode == 401) {
            // 处理未授权
          }
          handler.next(e);
        },
      ),
    );
  }

  // 登录
  Future<Map<String, dynamic>> login({
    required String username,
    required String password,
  }) async {
    try {
      print('=== 登录请求开始 ===');
      print('请求URL: /api/auth/login');
      print('请求数据: username=$username');

      final response = await _dio.post(
        '/api/auth/login',
        data: {
          'username': username,
          'password': password,
        },
      );

      print('=== 登录响应 ===');
      print('状态码: ${response.statusCode}');
      print('响应数据: ${response.data}');
      print('响应类型: ${response.data.runtimeType}');

      if (response.statusCode == 200) {
        final responseData = response.data;

        // 检查响应数据结构
        if (responseData == null) {
          throw Exception('响应数据为null');
        }

        if (responseData['data'] == null) {
          throw Exception('响应数据中data字段为null');
        }

        final data = responseData['data'];
        if (data is! Map<String, dynamic>) {
          throw Exception('data字段不是Map类型，实际类型: ${data.runtimeType}');
        }

        final token = data['token'];
        final userData = data['user'];

        if (token == null) {
          throw Exception('token为null');
        }

        if (userData == null) {
          throw Exception('user数据为null');
        }

        print('=== 登录成功解析 ===');
        print('token: $token');
        print('user数据: $userData');

        return {
          'success': true,
          'token': token,
          'user': UserModel.fromJson(userData),
        };
      }

      throw Exception('登录失败');
    } on DioException catch (e) {
      String errorMessage = '登录失败';

      if (e.response?.statusCode == 401) {
        errorMessage = '用户名或密码错误';
      } else if (e.response?.statusCode == 400) {
        errorMessage = e.response?.data['message'] ?? '请求参数错误';
      } else if (e.type == DioExceptionType.connectionTimeout) {
        errorMessage = '连接超时，请检查网络';
      } else if (e.type == DioExceptionType.receiveTimeout) {
        errorMessage = '响应超时，请重试';
      }

      return {
        'success': false,
        'error': errorMessage,
      };
    } catch (e) {
      return {
        'success': false,
        'error': '登录失败: $e',
      };
    }
  }

  // 注册
  Future<Map<String, dynamic>> register({
    required String username,
    required String email,
    required String password,
  }) async {
    try {
      print('=== 注册请求开始 ===');
      print('请求URL: /api/auth/register');
      print('请求数据: username=$username, email=$email');

      final response = await _dio.post(
        '/api/auth/register',
        data: {
          'username': username,
          'email': email,
          'password': password,
        },
      );

      print('=== 注册响应 ===');
      print('状态码: ${response.statusCode}');
      print('响应数据: ${response.data}');
      print('响应类型: ${response.data.runtimeType}');

      if (response.statusCode == 201) {
        final responseData = response.data;

        // 检查响应数据结构
        if (responseData == null) {
          throw Exception('响应数据为null');
        }

        if (responseData['data'] == null) {
          throw Exception('响应数据中data字段为null');
        }

        final data = responseData['data'];
        if (data is! Map<String, dynamic>) {
          throw Exception('data字段不是Map类型，实际类型: ${data.runtimeType}');
        }

        final token = data['token'];
        final userData = data['user'];

        if (token == null) {
          throw Exception('token为null');
        }

        if (userData == null) {
          throw Exception('user数据为null');
        }

        print('=== 注册成功解析 ===');
        print('token: $token');
        print('user数据: $userData');

        return {
          'success': true,
          'token': token,
          'user': UserModel.fromJson(userData),
        };
      }

      throw Exception('注册失败');
    } on DioException catch (e) {
      String errorMessage = '注册失败';

      if (e.response?.statusCode == 409) {
        errorMessage = e.response?.data['message'] ?? '用户名或邮箱已存在';
      } else if (e.response?.statusCode == 400) {
        errorMessage = e.response?.data['message'] ?? '请求参数错误';
      } else if (e.type == DioExceptionType.connectionTimeout) {
        errorMessage = '连接超时，请检查网络';
      } else if (e.type == DioExceptionType.receiveTimeout) {
        errorMessage = '响应超时，请重试';
      }

      return {
        'success': false,
        'error': errorMessage,
      };
    } catch (e) {
      return {
        'success': false,
        'error': '注册失败: $e',
      };
    }
  }

  // 验证Token
  Future<Map<String, dynamic>> validateToken(String token) async {
    try {
      final response = await _dio.get(
        '/api/auth/validate',
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      if (response.statusCode == 200) {
        final responseData = response.data;
        return {
          'success': true,
          'user': UserModel.fromJson(responseData['data']['user']),
        };
      }

      return {
        'success': false,
        'error': 'Token无效',
      };
    } catch (e) {
      return {
        'success': false,
        'error': 'Token验证失败: $e',
      };
    }
  }

  // 获取用户信息
  Future<Map<String, dynamic>> getUserProfile(String token) async {
    try {
      final response = await _dio.get(
        '/api/users/profile',
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      if (response.statusCode == 200) {
        final responseData = response.data;
        return {
          'success': true,
          'user': UserModel.fromJson(responseData['data']['user']),
        };
      }

      return {
        'success': false,
        'error': '获取用户信息失败',
      };
    } catch (e) {
      return {
        'success': false,
        'error': '获取用户信息失败: $e',
      };
    }
  }

  // 更新用户信息
  Future<Map<String, dynamic>> updateUserProfile({
    required String token,
    String? username,
    String? email,
    String? avatar,
  }) async {
    try {
      final data = <String, dynamic>{};
      if (username != null) data['username'] = username;
      if (email != null) data['email'] = email;
      if (avatar != null) data['avatar'] = avatar;

      final response = await _dio.put(
        '/api/users/profile',
        data: data,
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      if (response.statusCode == 200) {
        final responseData = response.data;
        return {
          'success': true,
          'user': UserModel.fromJson(responseData['data']['user']),
        };
      }

      return {
        'success': false,
        'error': '更新用户信息失败',
      };
    } catch (e) {
      return {
        'success': false,
        'error': '更新用户信息失败: $e',
      };
    }
  }
}
