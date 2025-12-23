const jwt = require('jsonwebtoken')
const db = require('../config/database')

// JWT验证中间件
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '访问令牌是必需的'
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    // 验证用户是否仍然存在
    const [users] = await db.execute(
      'SELECT id, username, email, role FROM users WHERE id = ?',
      [decoded.userId]
    )

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      })
    }

    req.user = users[0]
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '令牌已过期'
      })
    }
    
    return res.status(403).json({
      success: false,
      message: '无效的令牌'
    })
  }
}

// 角色权限验证中间件
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '请先登录'
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '权限不足'
      })
    }

    next()
  }
}

// 管理员权限中间件
const requireAdmin = requireRole(['admin'])

// 编辑器权限中间件（包含管理员）
const requireEditor = requireRole(['admin', 'editor'])

// 记录活动日志中间件
const logActivity = (action, resourceType) => {
  return async (req, res, next) => {
    // 保存原始的res.json方法
    const originalJson = res.json

    // 重写res.json方法以捕获响应
    res.json = function(data) {
      // 如果请求成功，记录活动
      if (data.success && req.user) {
        const logData = {
          user_id: req.user.id,
          action,
          resource_type: resourceType,
          resource_id: req.params.id || null,
          description: `用户 ${req.user.username} ${action} ${resourceType}`,
          ip_address: req.ip || req.connection.remoteAddress,
          user_agent: req.get('User-Agent')
        }

        // 异步记录日志，不阻塞响应
        db.execute(
          'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, description, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [logData.user_id, logData.action, logData.resource_type, logData.resource_id, logData.description, logData.ip_address, logData.user_agent]
        ).catch(error => {
          console.error('记录活动日志失败:', error)
        })
      }

      // 调用原始的json方法
      originalJson.call(this, data)
    }

    next()
  }
}

// 生成JWT令牌
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  )
}

// 验证令牌（不抛出错误）
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
  } catch (error) {
    return null
  }
}

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireEditor,
  logActivity,
  generateToken,
  verifyToken
}
