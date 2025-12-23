const express = require('express')
const router = express.Router()

const db = require('../config/database')
const { authenticateToken, requireAdmin, logActivity } = require('../middleware/auth')
const {
  validateEmailSettings,
  validateTestEmail,
  validateAdminMessagesQuery,
  validateMarkRead,
  validateResendMessage
} = require('../middleware/validation')
const { encryptSecret, decryptSecret, sendMail } = require('../utils/mailService')

const EMAIL_TYPE = 'email'
const CONTACT_TABLE = 'contact_submissions'

const parseRecipients = (value) => {
  if (Array.isArray(value)) return value
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return parsed
    } catch (err) {
      return value.split(',').map(item => item.trim()).filter(Boolean)
    }
  }
  return []
}

const mapRowToResponse = (row) => ({
  smtp_host: row.smtp_host,
  smtp_port: row.smtp_port,
  secure: !!row.secure,
  username: row.username,
  from_name: row.from_name,
  from_email: row.from_email,
  default_recipients: parseRecipients(row.default_recipients),
  contact_enabled: !!row.contact_enabled,
  contact_recipients: parseRecipients(row.contact_recipients),
  status: row.status,
  test_status: row.test_status,
  last_error: row.last_error,
  updated_at: row.updated_at,
  has_password: !!row.password_encrypted || !!process.env.SMTP_PASS
})

const buildEffectiveConfig = (row, overrides = {}) => {
  const password = overrides.password
    || decryptSecret(row?.password_encrypted)
    || process.env.SMTP_PASS

  return {
    smtp_host: overrides.smtp_host || row?.smtp_host || process.env.SMTP_HOST,
    smtp_port: overrides.smtp_port || row?.smtp_port || process.env.SMTP_PORT || 587,
    secure: typeof overrides.secure === 'boolean' ? overrides.secure : !!row?.secure,
    username: overrides.username || row?.username || process.env.SMTP_USER,
    password,
    from_name: overrides.from_name || row?.from_name || process.env.SMTP_FROM_NAME || '',
    from_email: overrides.from_email || row?.from_email || process.env.SMTP_FROM || overrides.username || row?.username,
    default_recipients: overrides.default_recipients || parseRecipients(row?.default_recipients),
    contact_enabled: typeof overrides.contact_enabled === 'boolean'
      ? overrides.contact_enabled
      : (row?.contact_enabled ? true : false),
    contact_recipients: overrides.contact_recipients || parseRecipients(row?.contact_recipients)
  }
}

const getEmailSettingsRow = async () => {
  const [rows] = await db.execute(
    'SELECT * FROM notification_settings WHERE type = ? LIMIT 1',
    [EMAIL_TYPE]
  )
  return rows[0] || null
}

router.get('/email',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const row = await getEmailSettingsRow()

      if (!row && !process.env.SMTP_HOST) {
        return res.json({
          success: true,
          data: null,
          message: '尚未配置邮件发送，请填写 SMTP 信息'
        })
      }

      const data = row ? mapRowToResponse(row) : {
        smtp_host: process.env.SMTP_HOST || '',
        smtp_port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        username: process.env.SMTP_USER || '',
        from_name: process.env.SMTP_FROM_NAME || '',
        from_email: process.env.SMTP_FROM || process.env.SMTP_USER || '',
        default_recipients: [],
        contact_enabled: false,
        contact_recipients: [],
        status: 'inactive',
        test_status: 'pending',
        last_error: null,
        has_password: !!process.env.SMTP_PASS
      }

      res.json({
        success: true,
        data
      })
    } catch (error) {
      console.error('获取邮件配置失败:', error)
      res.status(500).json({
        success: false,
        message: '获取邮件配置失败'
      })
    }
  }
)

router.put('/email',
  authenticateToken,
  requireAdmin,
  validateEmailSettings,
  logActivity('update', 'notification_settings'),
  async (req, res) => {
    const {
      smtp_host,
      smtp_port,
      secure,
      username,
      password,
      from_name,
      from_email,
      default_recipients = [],
      contact_enabled = false,
      contact_recipients = [],
      status = 'active'
    } = req.body

    try {
      const existing = await getEmailSettingsRow()
      let passwordEncrypted = existing?.password_encrypted || null

      if (password === '') {
        passwordEncrypted = null
      } else if (password) {
        passwordEncrypted = encryptSecret(password)
      }

      await db.execute(
        `INSERT INTO notification_settings
          (type, smtp_host, smtp_port, secure, username, password_encrypted, from_name, from_email, default_recipients, contact_enabled, contact_recipients, status, test_status, last_error, updated_by, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NULL, ?, NOW())
         ON DUPLICATE KEY UPDATE
          smtp_host = VALUES(smtp_host),
          smtp_port = VALUES(smtp_port),
          secure = VALUES(secure),
          username = VALUES(username),
          password_encrypted = VALUES(password_encrypted),
          from_name = VALUES(from_name),
          from_email = VALUES(from_email),
          default_recipients = VALUES(default_recipients),
          contact_enabled = VALUES(contact_enabled),
          contact_recipients = VALUES(contact_recipients),
          status = VALUES(status),
          test_status = 'pending',
          last_error = NULL,
          updated_by = VALUES(updated_by),
          updated_at = NOW()
        `,
        [
          EMAIL_TYPE,
          smtp_host,
          smtp_port,
          secure ? 1 : 0,
          username,
          passwordEncrypted,
          from_name || null,
          from_email,
          JSON.stringify(default_recipients || []),
          contact_enabled ? 1 : 0,
          JSON.stringify(contact_recipients || []),
          status,
          req.user.id
        ]
      )

      const updatedRow = await getEmailSettingsRow()
      res.json({
        success: true,
        message: '邮件设置已保存',
        data: mapRowToResponse(updatedRow)
      })
    } catch (error) {
      console.error('保存邮件配置失败:', error)
      res.status(500).json({
        success: false,
        message: '保存邮件配置失败: ' + error.message
      })
    }
  }
)

router.post('/email/test',
  authenticateToken,
  requireAdmin,
  validateTestEmail,
  logActivity('test', 'notification_settings'),
  async (req, res) => {
    try {
      const row = await getEmailSettingsRow()
      const overrides = req.body.config || {}
      const effective = buildEffectiveConfig(row, overrides)

      const toList = req.body.to
        ? Array.isArray(req.body.to) ? req.body.to : [req.body.to]
        : effective.default_recipients

      if (!toList || !toList.length) {
        return res.status(400).json({
          success: false,
          message: '请提供至少一个收件人'
        })
      }

      if (!effective.smtp_host || !effective.username || !effective.password || !effective.from_email) {
        return res.status(400).json({
          success: false,
          message: 'SMTP 主机、用户名、密码、发件邮箱均为必填'
        })
      }

      await sendMail(effective, {
        to: toList.join(','),
        subject: req.body.subject || '通知设置测试邮件',
        text: req.body.message || '这是一封来自通知设置的测试邮件，用于验证 SMTP 配置是否可用。',
        html: `<p>这是一封来自通知设置的测试邮件，用于验证 SMTP 配置是否可用。</p><p>发送时间：${new Date().toLocaleString()}</p>`
      })

      if (row) {
        await db.execute(
          'UPDATE notification_settings SET test_status = ?, last_error = NULL, updated_at = NOW(), updated_by = ? WHERE type = ?',
          ['success', req.user.id, EMAIL_TYPE]
        )
      }

      res.json({
        success: true,
        message: '测试邮件已发送',
        data: {
          to: toList
        }
      })
    } catch (error) {
      console.error('发送测试邮件失败:', error)
      if (req?.user) {
        await db.execute(
          'UPDATE notification_settings SET test_status = ?, last_error = ?, updated_at = NOW(), updated_by = ? WHERE type = ?',
          ['failed', error.message || '发送失败', req.user.id, EMAIL_TYPE]
        ).catch(() => {})
      }
      res.status(500).json({
        success: false,
        message: '发送测试邮件失败: ' + error.message
      })
    }
  }
)

// 消息列表（联系表单提交）
router.get('/messages',
  authenticateToken,
  requireAdmin,
  validateAdminMessagesQuery,
  async (req, res) => {
    try {
      const { page = 1, limit = 10, status, keyword, source, start_date, end_date } = req.query
      const numericPage = Number(page) || 1
      const numericLimit = Number(limit) || 10
      const offset = (numericPage - 1) * numericLimit
      const where = []
      const params = []

      if (status) {
        where.push('status = ?')
        params.push(status)
      }
      if (keyword) {
        where.push('(name LIKE ? OR email LIKE ? OR phone LIKE ? OR message LIKE ?)')
        params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`)
      }
      if (source) {
        where.push('source_page LIKE ?')
        params.push(`%${source}%`)
      }
      if (start_date) {
        where.push('created_at >= ?')
        params.push(start_date)
      }
      if (end_date) {
        where.push('created_at <= ?')
        params.push(end_date)
      }

      const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : ''
      const baseParams = [...params]
      const limitParam = Number.isFinite(numericLimit) && numericLimit > 0 ? Math.floor(numericLimit) : 10
      const offsetParam = Number.isFinite(offset) && offset >= 0 ? Math.floor(offset) : 0
      const [rows] = await db.execute(
        `SELECT id, name, email, phone, source_page, status, emailed_at, email_result, created_at
         FROM ${CONTACT_TABLE} ${whereClause}
         ORDER BY created_at DESC
         LIMIT ${limitParam} OFFSET ${offsetParam}`,
        baseParams
      )
      const [totalRows] = await db.execute(
        `SELECT COUNT(*) as total FROM ${CONTACT_TABLE} ${whereClause}`,
        baseParams
      )
      res.json({
        success: true,
        data: rows,
        meta: {
          total: totalRows[0].total,
          page: numericPage,
          limit: numericLimit
        }
      })
    } catch (error) {
      console.error('获取消息列表失败:', error)
      res.status(500).json({
        success: false,
        message: '获取消息列表失败'
      })
    }
  }
)

// 消息详情
router.get('/messages/:id',
  authenticateToken,
  requireAdmin,
    async (req, res) => {
      try {
        const { id } = req.params
        const [rows] = await db.execute(
          `SELECT * FROM ${CONTACT_TABLE} WHERE id = ? LIMIT 1`,
        [id]
      )
      if (!rows.length) {
        return res.status(404).json({ success: false, message: '记录不存在' })
      }
      res.json({ success: true, data: rows[0] })
    } catch (error) {
      console.error('获取消息详情失败:', error)
      res.status(500).json({ success: false, message: '获取消息详情失败' })
    }
  }
)

// 标记已读/未读
router.patch('/messages/:id/read',
  authenticateToken,
  requireAdmin,
  validateMarkRead,
  async (req, res) => {
    try {
      const { id } = req.params
      const { status } = req.body
      const [result] = await db.execute(
        `UPDATE ${CONTACT_TABLE} SET status = ? WHERE id = ?`,
        [status, id]
      )
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: '记录不存在' })
      }
      res.json({ success: true, message: '状态已更新' })
    } catch (error) {
      console.error('更新消息状态失败:', error)
      res.status(500).json({ success: false, message: '更新消息状态失败' })
    }
  }
)

// 兼容 PUT 标记已读
router.put('/messages/:id/read',
  authenticateToken,
  requireAdmin,
  validateMarkRead,
  async (req, res) => {
    try {
      const { id } = req.params
      const { status } = req.body
      const [result] = await db.execute(
        `UPDATE ${CONTACT_TABLE} SET status = ? WHERE id = ?`,
        [status, id]
      )
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: '记录不存在' })
      }
      res.json({ success: true, message: '状态已更新' })
    } catch (error) {
      console.error('更新消息状态失败:', error)
      res.status(500).json({ success: false, message: '更新消息状态失败' })
    }
  }
)

// 删除
router.delete('/messages/:id',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params
      const [result] = await db.execute(
        `DELETE FROM ${CONTACT_TABLE} WHERE id = ?`,
        [id]
      )
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: '记录不存在' })
      }
      res.json({ success: true, message: '已删除' })
    } catch (error) {
      console.error('删除消息失败:', error)
      res.status(500).json({ success: false, message: '删除消息失败' })
    }
  }
)

// 重发邮件
router.post('/messages/:id/resend',
  authenticateToken,
  requireAdmin,
  validateResendMessage,
  async (req, res) => {
    try {
      const { id } = req.params
      const [rows] = await db.execute(
        `SELECT * FROM ${CONTACT_TABLE} WHERE id = ? LIMIT 1`,
        [id]
      )
      if (!rows.length) {
        return res.status(404).json({ success: false, message: '记录不存在' })
      }
      const message = rows[0]
      const settingsRow = await getEmailSettingsRow()
      if (!settingsRow || settingsRow.status !== 'active' || !settingsRow.contact_enabled) {
        return res.status(400).json({ success: false, message: '邮件发送未启用或未配置' })
      }
      const effective = buildEffectiveConfig(settingsRow)
      const toList = (effective.contact_recipients && effective.contact_recipients.length)
        ? effective.contact_recipients
        : effective.default_recipients
      if (!toList || !toList.length) {
        return res.status(400).json({ success: false, message: '未配置收件人' })
      }

      let fieldsJson = []
      try {
        fieldsJson = Array.isArray(message.fields_json) ? message.fields_json : JSON.parse(message.fields_json || '[]')
      } catch (e) {
        fieldsJson = []
      }
      const coreNames = ['name', 'email', 'phone', 'tel', 'message', 'content']
      const extraFields = (fieldsJson || []).filter(f => f && !coreNames.includes((f.name || '').toLowerCase()))

      const bodyLines = [
        `姓名：${message.name || '未填'}`,
        `邮箱：${message.email || '未填'}`,
        `电话：${message.phone || '未填'}`,
        `来源：${message.source_page || ''}`,
        `时间：${message.created_at}`,
        '',
        '留言：',
        `${message.message || ''}`
      ]

      if (extraFields.length) {
        bodyLines.push('', '其他字段：', ...extraFields.map(f => `${f.label || f.name}: ${f.value}`))
      }

      await sendMail(effective, {
        to: toList.join(','),
        subject: `【联系表单】${message.name || '访客'} 的留言`,
        text: bodyLines.join('\n'),
        html: bodyLines.map(line => `<p>${line.replace(/</g, '&lt;')}</p>`).join('')
      })

      await db.execute(
        `UPDATE ${CONTACT_TABLE} SET emailed_at = NOW(), email_result = 'success' WHERE id = ?`,
        [id]
      )

      res.json({ success: true, message: '已重发' })
    } catch (error) {
      console.error('重发邮件失败:', error)
      res.status(500).json({ success: false, message: '重发邮件失败: ' + error.message })
    }
  }
)

module.exports = router
