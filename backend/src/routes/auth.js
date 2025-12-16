const express = require('express')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const router = express.Router()
const db = require('../config/database')
const { 
  authenticateToken, 
  generateToken, 
  verifyToken,
  logActivity 
} = require('../middleware/auth')
const {
  validateLogin,
  validateUpdateProfile
} = require('../middleware/validation')

const REFRESH_COOKIE_NAME = 'refresh-token'
const REFRESH_TOKEN_DAYS = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30)

const parseCookies = (req) => {
  const header = req.headers?.cookie
  if (!header) return {}
  const out = {}
  header.split(';').forEach((part) => {
    const [rawKey, ...rawValueParts] = part.trim().split('=')
    if (!rawKey) return
    out[rawKey] = decodeURIComponent(rawValueParts.join('=') || '')
  })
  return out
}

const sha256Hex = (value) => crypto.createHash('sha256').update(value).digest('hex')

const generateRefreshToken = () => crypto.randomBytes(64).toString('base64url')

const getRefreshCookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production'
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000
  }
}

const setRefreshCookie = (res, token) => {
  res.cookie(REFRESH_COOKIE_NAME, token, getRefreshCookieOptions())
}

const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, { ...getRefreshCookieOptions(), maxAge: 0 })
}

const saveRefreshToken = async ({ userId, token, req }) => {
  const tokenHash = sha256Hex(token)
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000)
  const ipAddress = req.ip || req.connection?.remoteAddress || null
  const userAgent = req.get('User-Agent') || null

  const [result] = await db.execute(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, ip_address, user_agent)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, tokenHash, expiresAt, ipAddress, userAgent]
  )

  return { id: result.insertId, expiresAt }
}

const issueAuthTokens = async ({ userId, req, res }) => {
  const accessToken = generateToken(userId)
  const refreshToken = generateRefreshToken()
  await saveRefreshToken({ userId, token: refreshToken, req })
  setRefreshCookie(res, refreshToken)
  return { accessToken }
}

// 用户登录
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { username, password } = req.body

    console.log('调试登录:', { username, password }) // 调试日志

    // 查找用户
    const [users] = await db.execute(
      'SELECT id, username, password, email, role FROM users WHERE username = ?',
      [username]
    )

    if (users.length === 0) {
      console.log('用户不存在:', username) // 调试日志
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      })
    }

    const user = users[0]

    console.log('数据库中的密码:', user.password) // 调试日志
    console.log('输入的密码:', password) // 调试日志

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password)
    console.log('密码匹配结果:', isValidPassword) // 调试日志
    
    if (!isValidPassword) {
      console.log('密码不匹配') // 调试日志
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      })
    }

    // 更新最后登录时间
    await db.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    )

    // 生成JWT令牌
    const { accessToken } = await issueAuthTokens({ userId: user.id, req, res })

    // 记录登录日志
    await db.execute(
      'INSERT INTO activity_logs (user_id, action, resource_type, description, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
      [
        user.id,
        'login',
        'auth',
        `用户 ${user.username} 登录系统`,
        req.ip || req.connection.remoteAddress,
        req.get('User-Agent')
      ]
    )

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token: accessToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    })
  } catch (error) {
    console.error('登录失败:', error)
    res.status(500).json({
      success: false,
      message: '登录失败，请稍后重试'
    })
  }
})


// 获取当前用户信息
// Refresh access token using HttpOnly refresh cookie (also rotates refresh token)
router.post('/refresh', async (req, res) => {
  try {
    const cookies = parseCookies(req)
    const refreshToken = cookies[REFRESH_COOKIE_NAME]
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Missing refresh token' })
    }

    const tokenHash = sha256Hex(refreshToken)
    const [rows] = await db.execute(
      `SELECT id, user_id, expires_at, revoked_at
       FROM refresh_tokens
       WHERE token_hash = ?
       LIMIT 1`,
      [tokenHash]
    )

    if (!rows || rows.length === 0) {
      clearRefreshCookie(res)
      return res.status(401).json({ success: false, message: 'Invalid refresh token' })
    }

    const row = rows[0]
    if (row.revoked_at) {
      clearRefreshCookie(res)
      return res.status(401).json({ success: false, message: 'Refresh token revoked' })
    }

    if (!row.expires_at || new Date(row.expires_at).getTime() <= Date.now()) {
      await db.execute('UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ?', [row.id]).catch(() => {})
      clearRefreshCookie(res)
      return res.status(401).json({ success: false, message: 'Refresh token expired' })
    }

    // rotate refresh token
    const newRefresh = generateRefreshToken()
    const { id: newId } = await saveRefreshToken({ userId: row.user_id, token: newRefresh, req })
    await db.execute(
      'UPDATE refresh_tokens SET revoked_at = NOW(), replaced_by_id = ?, last_used_at = NOW() WHERE id = ?',
      [newId, row.id]
    )

    setRefreshCookie(res, newRefresh)

    const accessToken = generateToken(row.user_id)
    res.json({ success: true, data: { token: accessToken } })
  } catch (error) {
    console.error('refresh failed:', error)
    res.status(500).json({ success: false, message: 'Refresh failed' })
  }
})

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, username, email, first_name, last_name, language, role, created_at, last_login FROM users WHERE id = ?',
      [req.user.id]
    )

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      })
    }

    res.json({
      success: true,
      data: users[0]
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    })
  }
})

// 更新用户信息
router.put('/profile', authenticateToken, validateUpdateProfile, async (req, res) => {
  try {
    const { email, currentPassword, newPassword, firstName, lastName, language } = req.body
    const updates = []
    const values = []

    // 更新邮箱
    if (email) {
      // 检查邮箱是否已被其他用户使用
      const [existingUsers] = await db.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, req.user.id]
      )

      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: '邮箱已被其他用户使用'
        })
      }

      updates.push('email = ?')
      values.push(email)
    }

    // 更新个人资料
    if (firstName !== undefined) {
      updates.push('first_name = ?')
      values.push(firstName || null)
    }

    if (lastName !== undefined) {
      updates.push('last_name = ?')
      values.push(lastName || null)
    }

    if (language !== undefined) {
      updates.push('language = ?')
      values.push(language || 'zh-CN')
    }

    // 更新密码
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: '修改密码需要提供当前密码'
        })
      }

      // 验证当前密码
      const [users] = await db.execute(
        'SELECT password FROM users WHERE id = ?',
        [req.user.id]
      )

      const isValidPassword = await bcrypt.compare(currentPassword, users[0].password)
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: '当前密码错误'
        })
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12)
      updates.push('password = ?')
      values.push(hashedPassword)
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有可更新的字段'
      })
    }

    // 执行更新
    values.push(req.user.id)
    await db.execute(
      `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    )

    res.json({
      success: true,
      message: '用户信息更新成功'
    })
  } catch (error) {
    console.error('更新用户信息失败:', error)
    res.status(500).json({
      success: false,
      message: '更新用户信息失败'
    })
  }
})

// 用户登出
router.post('/logout', logActivity('logout', 'auth'), async (req, res) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    const decoded = token ? verifyToken(token) : null
    if (decoded?.userId) {
      const [users] = await db.execute('SELECT id, username, role FROM users WHERE id = ?', [decoded.userId])
      if (users && users[0]) req.user = users[0]
    }

    const cookies = parseCookies(req)
    const refreshToken = cookies[REFRESH_COOKIE_NAME]
    if (refreshToken) {
      const tokenHash = sha256Hex(refreshToken)
      await db
        .execute('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ? AND revoked_at IS NULL', [tokenHash])
        .catch(() => {})
    }
  } finally {
    clearRefreshCookie(res)
    res.json({ success: true, message: '登出成功' })
  }
})

// 检查认证状态
router.get('/check', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      authenticated: true,
      user: req.user
    }
  })
})


module.exports = router
