const express = require('express')
const rateLimit = require('express-rate-limit')
const router = express.Router()

const db = require('../config/database')
const { validateContactSubmission } = require('../middleware/validation')
const { sendMail, decryptSecret } = require('../utils/mailService')

const CONTACT_TABLE = 'contact_submissions'
const EMAIL_TYPE = 'email'

const sanitizeText = (value, maxLength = 500) => {
  if (typeof value !== 'string') return ''
  const trimmed = value.slice(0, maxLength)
  return trimmed.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const sanitizeFields = (fields = []) => {
  if (!Array.isArray(fields)) return []
  return fields
    .map(field => ({
      name: sanitizeText(field.name || '', 100).trim(),
      label: sanitizeText(field.label || '', 100).trim(),
      type: sanitizeText(field.type || 'text', 30).toLowerCase(),
      value: sanitizeText(field.value || '', 1000),
      required: !!field.required,
      options: field.options || []
    }))
    .filter(f => f.name && f.label)
    .slice(0, 20)
}

const extractValue = (fields, targetNames = []) => {
  const lowerTargets = targetNames.map(n => n.toLowerCase())
  const hit = fields.find(f => lowerTargets.includes(f.name.toLowerCase()))
  return hit?.value || ''
}

const getEmailSettingsRow = async () => {
  const [rows] = await db.execute(
    'SELECT * FROM notification_settings WHERE type = ? LIMIT 1',
    [EMAIL_TYPE]
  )
  return rows[0] || null
}

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

const buildEffectiveConfig = (row) => {
  if (!row) return null
  const password = decryptSecret(row?.password_encrypted) || process.env.SMTP_PASS
  return {
    smtp_host: row?.smtp_host || process.env.SMTP_HOST,
    smtp_port: row?.smtp_port || process.env.SMTP_PORT || 587,
    secure: !!row?.secure,
    username: row?.username || process.env.SMTP_USER,
    password,
    from_name: row?.from_name || process.env.SMTP_FROM_NAME || '',
    from_email: row?.from_email || process.env.SMTP_FROM || row?.username,
    default_recipients: parseRecipients(row?.default_recipients),
    contact_enabled: !!row?.contact_enabled,
    contact_recipients: parseRecipients(row?.contact_recipients)
  }
}

// 防刷限流
const contactLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: 1,
  keyGenerator: (req) => (req.headers['x-real-ip'] || req.ip || '').toString(),
  message: { success: false, message: '提交过于频繁，请稍后再试' }
})

router.post('/',
  contactLimiter,
  validateContactSubmission,
  async (req, res) => {
    try {
      const { fields = [], page, honeypot } = req.body

      if (honeypot) {
        return res.status(400).json({ success: false, message: '提交被拒绝' })
      }

      const cleanedFields = sanitizeFields(fields)
      if (!cleanedFields.length) {
        return res.status(400).json({ success: false, message: '表单字段无效' })
      }

      const name = sanitizeText(extractValue(cleanedFields, ['name']), 100)
      const email = sanitizeText(extractValue(cleanedFields, ['email']), 200)
      const phone = sanitizeText(extractValue(cleanedFields, ['phone', 'tel']), 50)
      const messageValue = sanitizeText(extractValue(cleanedFields, ['message', 'content']), 1000)

      const [result] = await db.execute(
        `INSERT INTO ${CONTACT_TABLE}
          (name, email, phone, message, source_page, fields_json, ip_address, user_agent, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
        [
          name || null,
          email || null,
          phone || null,
          messageValue || null,
          page || null,
          JSON.stringify(cleanedFields),
          req.headers['x-real-ip'] || req.ip || req.headers['x-forwarded-for'] || '',
          req.get('User-Agent') || ''
        ]
      )

      const recordId = result.insertId
      let mailed = false

      try {
        const settingsRow = await getEmailSettingsRow()
        if (settingsRow && settingsRow.status === 'active' && settingsRow.contact_enabled) {
          const effective = buildEffectiveConfig(settingsRow)
          if (effective?.smtp_host && effective?.username && effective?.password && effective?.from_email) {
            const toList = (effective.contact_recipients && effective.contact_recipients.length)
              ? effective.contact_recipients
              : effective.default_recipients
            if (toList && toList.length) {
              const coreNames = ['name', 'email', 'phone', 'tel', 'message', 'content']
              const extraFields = cleanedFields.filter(f => !coreNames.includes((f.name || '').toLowerCase()))
              const bodyLines = [
                `姓名：${name || '未填'}`,
                `邮箱：${email || '未填'}`,
                `电话：${phone || '未填'}`,
                `来源：${page || ''}`,
                `时间：${new Date().toLocaleString()}`,
                '',
                '留言：',
                `${messageValue || ''}`
              ]

              if (extraFields.length) {
                bodyLines.push('', '其他字段：', ...extraFields.map(f => `${f.label || f.name}: ${f.value}`))
              }

              await sendMail(effective, {
                to: toList.join(','),
                subject: `【联系表单】${name || '访客'} 的留言`,
                text: bodyLines.join('\n'),
                html: bodyLines.map(line => `<p>${line.replace(/</g, '&lt;')}</p>`).join('')
              })

              await db.execute(
                `UPDATE ${CONTACT_TABLE} SET emailed_at = NOW(), email_result = 'success' WHERE id = ?`,
                [recordId]
              )
              mailed = true
            }
          }
        }
      } catch (error) {
        console.error('联系表单邮件发送失败:', error)
        await db.execute(
          `UPDATE ${CONTACT_TABLE} SET email_result = ? WHERE id = ?`,
          [error.message.slice(0, 250), recordId]
        ).catch(() => {})
      }

      res.json({
        success: true,
        message: mailed ? '提交成功，邮件已发送' : '提交成功',
        data: { id: recordId }
      })
    } catch (error) {
      console.error('提交联系表单失败:', error)
      res.status(500).json({ success: false, message: '提交失败，请稍后再试' })
    }
  }
)

module.exports = router
