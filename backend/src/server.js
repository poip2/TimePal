const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { syncDatabase } = require('./models');

const app = express();

// 中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

// 限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 100个请求
});
app.use(limiter);

// 更严格的认证相关限流
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 限制每个IP 5个请求（注册/登录）
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试'
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API状态检查
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'running',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }
  });
});

// 路由
app.use('/api', require('./routes'));

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在'
  });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('错误详情:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Sequelize验证错误
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: '数据验证失败',
      errors: err.errors.map(e => e.message)
    });
  }

  // Sequelize唯一约束错误
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: '数据已存在',
      errors: err.errors.map(e => `${e.path} 已存在`)
    });
  }

  // 其他错误
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '服务器内部错误'
  });
});

const PORT = process.env.PORT || 3000;

// 启动服务器
const startServer = async () => {
  try {
    // 同步数据库
    await syncDatabase();

    // 启动HTTP服务器
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔧 API docs: http://localhost:${PORT}/api/status`);
    });

    // 优雅关闭
    const gracefulShutdown = (signal) => {
      console.log(`\n${signal} received, shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
};

// 只在直接运行时启动服务器
if (require.main === module) {
  startServer();
}

module.exports = app;
