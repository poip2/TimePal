class UserModel {
  final String id;
  final String username;
  final String email;
  final String? avatar;
  final int level;
  final int experience;
  final int coins;
  final DateTime createdAt;
  final DateTime updatedAt;

  UserModel({
    required this.id,
    required this.username,
    required this.email,
    this.avatar,
    required this.level,
    required this.experience,
    required this.coins,
    required this.createdAt,
    required this.updatedAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    print('=== UserModel.fromJson 开始解析 ===');
    print('输入JSON: $json');

    try {
      final userModel = UserModel(
        id: json['id']?.toString() ?? '',
        username: json['username']?.toString() ?? '',
        email: json['email']?.toString() ?? '',
        avatar: json['avatarUrl'] ?? json['avatar'], // 兼容后端avatarUrl字段
        level: json['level'] is int
            ? json['level']
            : int.tryParse(json['level']?.toString() ?? '1') ?? 1,
        experience: json['experience'] is int
            ? json['experience']
            : int.tryParse(json['experience']?.toString() ?? '0') ?? 0,
        coins: json['coins'] is int
            ? json['coins']
            : int.tryParse(json['coins']?.toString() ?? '0') ?? 0,
        createdAt: json['createdAt'] != null
            ? DateTime.parse(json['createdAt'].toString())
            : DateTime.now(),
        updatedAt: json['updatedAt'] != null
            ? DateTime.parse(json['updatedAt'].toString())
            : DateTime.now(),
      );

      print('=== UserModel.fromJson 解析成功 ===');
      print('用户数据: ${userModel.toJson()}');

      return userModel;
    } catch (e) {
      print('=== UserModel.fromJson 解析失败 ===');
      print('错误: $e');
      print('输入JSON: $json');
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'avatar': avatar,
      'level': level,
      'experience': experience,
      'coins': coins,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  UserModel copyWith({
    String? id,
    String? username,
    String? email,
    String? avatar,
    int? level,
    int? experience,
    int? coins,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return UserModel(
      id: id ?? this.id,
      username: username ?? this.username,
      email: email ?? this.email,
      avatar: avatar ?? this.avatar,
      level: level ?? this.level,
      experience: experience ?? this.experience,
      coins: coins ?? this.coins,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
