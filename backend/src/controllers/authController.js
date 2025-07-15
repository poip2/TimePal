const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

// 注册验证schema
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required()
});

// 登录验证schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// 生成JWT令牌
const generateToken = (userId) => {
  return jwt.sign(
    { userId, iat: Math.floor(Date.now() / 1000) },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// 用户注册
const register = async (req, res) => {
  try {
    // 验证输入
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { username, email, password } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findByEmailOrUsername(email, username);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: '用户名或邮箱已存在'
      });
    }

    // 创建新用户
    const user = await User.create({
      username,
      email,
      passwordHash: password
    });

    // 生成令牌
    const token = generateToken(user.id);

    // 返回用户信息（不包含密码）
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      level: user.level,
      experience: user.experience,
      coins: user.coins,
      avatarUrl: user.avatarUrl
    };

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 用户登录
const login = async (req, res) => {
  try {
    // 验证输入
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { email, password } = req.body;

    // 查找用户
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    // 验证密码
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    // 检查用户是否激活
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: '账户已被禁用'
      });
    }

    // 生成令牌
    const token = generateToken(user.id);

    // 返回用户信息
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      level: user.level,
      experience: user.experience,
      coins: user.coins,
      avatarUrl: user.avatarUrl
    };

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 获取当前用户信息
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['passwordHash'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 更新用户信息
const updateProfile = async (req, res) => {
  try {
    const { username, avatarUrl } = req.body;

    const updateSchema = Joi.object({
      username: Joi.string().alphanum().min(3).max(50),
      avatarUrl: Joi.string().uri()
    });

    const { error } = updateSchema.validate({ username, avatarUrl });
    if (error) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: error.details.map(detail => detail.message)
      });
    }

    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    if (username) user.username = username;
    if (avatarUrl) user.avatarUrl = avatarUrl;

    await user.save();

    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      level: user.level,
      experience: user.experience,
      coins: user.coins,
      avatarUrl: user.avatarUrl
    };

    res.json({
      success: true,
      message: '用户信息更新成功',
      data: { user: userResponse }
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: '用户名已存在'
      });
    }
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile
};
