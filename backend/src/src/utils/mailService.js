const crypto = require('crypto')
const nodemailer = require('nodemailer')

const getEncryptionKey = () => {
  const raw = process.env.EMAIL_SECRET || process.env.JWT_SECRET || 'notification-email-secret'
  return crypto.createHash('sha256').update(raw).digest().subarray(0, 32)
}

const encryptSecret = (value) => {
  if (!value) return null
  const iv = crypto.randomBytes(12)
  const key = getEncryptionKey()
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return Buffer.concat([iv, authTag, encrypted])
}

const decryptSecret = (buffer) => {
  if (!buffer) return null
  try {
    const iv = buffer.subarray(0, 12)
    const tag = buffer.subarray(12, 28)
    const encrypted = buffer.subarray(28)
    const key = getEncryptionKey()
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(tag)
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
    return decrypted.toString('utf8')
  } catch (error) {
    console.error('解密邮件密码失败:', error)
    return null
  }
}

const createTransporter = (config) => {
  if (!config || !config.smtp_host) {
    throw new Error('缺少 SMTP 主机配置')
  }

  const transporter = nodemailer.createTransport({
    host: config.smtp_host,
    port: Number(config.smtp_port) || 587,
    secure: !!config.secure,
    auth: config.username && config.password ? {
      user: config.username,
      pass: config.password
    } : undefined
  })

  return transporter
}

const sendMail = async (config, { to, subject, text, html }) => {
  const transporter = createTransporter(config)
  const fromAddress = config.from_name
    ? `"${config.from_name}" <${config.from_email}>`
    : config.from_email

  await transporter.verify()
  return transporter.sendMail({
    from: fromAddress,
    to,
    subject,
    text,
    html
  })
}

module.exports = {
  encryptSecret,
  decryptSecret,
  createTransporter,
  sendMail
}
