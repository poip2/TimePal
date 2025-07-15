const express = require('express');
const router = express.Router();

// 路由导入
const authRoutes = require('./auth');
const userRoutes = require('./users');
const habitRoutes = require('./habits');
const checkinRoutes = require('./checkins');
const gameRoutes = require('./games');
const achievementRoutes = require('./achievements');

// 路由注册
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/habits', habitRoutes);
router.use('/checkins', checkinRoutes);
router.use('/games', gameRoutes);
router.use('/achievements', achievementRoutes);

module.exports = router;
