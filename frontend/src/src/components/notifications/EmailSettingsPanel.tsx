import React, { useEffect, useMemo, useState } from 'react'
import { ThemeAwareInput, ThemeAwareSelect } from '@/components/ThemeAwareFormControls'
import { Mail, ShieldCheck, Send, Plus, Trash2, Activity, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { notificationsApi } from '@/utils/api'
import type { EmailNotificationSettings } from '@/types'

const defaultForm: EmailNotificationSettings & { password?: string } = {
  smtp_host: '',
  smtp_port: 587,
  secure: false,
  username: '',
  password: '',
  from_name: '',
  from_email: '',
  default_recipients: [],
  contact_enabled: false,
  contact_recipients: [],
  status: 'active'
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function EmailSettingsPanel() {
  const [form, setForm] = useState(defaultForm)
  const [recipients, setRecipients] = useState<string[]>([])
  const [recipientInput, setRecipientInput] = useState('')
  const [contactRecipients, setContactRecipients] = useState<string[]>([])
  const [contactRecipientInput, setContactRecipientInput] = useState('')
  const [contactEnabled, setContactEnabled] = useState(false)
  const [testRecipient, setTestRecipient] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [hasPassword, setHasPassword] = useState(false)
  const [lastStatus, setLastStatus] = useState<EmailNotificationSettings['test_status']>('pending')
  const [lastError, setLastError] = useState<string | null | undefined>('')
  const [lastUpdated, setLastUpdated] = useState<string | undefined>('')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const response = await notificationsApi.getEmailSettings()
      if (response.success) {
        const data = (response.data || {}) as EmailNotificationSettings
        setForm({
          ...defaultForm,
          ...data,
          password: ''
        })
        setRecipients(data.default_recipients || [])
        setContactRecipients(data.contact_recipients || [])
        setContactEnabled(!!data.contact_enabled)
        setHasPassword(!!data.has_password)
        setLastStatus(data.test_status || 'pending')
        setLastError(data.last_error)
        setLastUpdated(data.updated_at)
      } else {
        toast.error(response.message || '获取邮件配置失败')
      }
    } catch (error) {
      console.error('获取邮件配置失败', error)
      toast.error('获取邮件配置失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (key: keyof typeof form, value: any) => {
    setForm(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const addRecipient = () => {
    const email = recipientInput.trim()
    if (!email) return
    if (!emailPattern.test(email)) {
      toast.error('请输入有效的邮箱地址')
      return
    }
    if (recipients.includes(email)) {
      toast.error('该邮箱已存在于收件人列表')
      return
    }
    setRecipients(prev => [...prev, email])
    setRecipientInput('')
  }

  const removeRecipient = (index: number) => {
    setRecipients(prev => prev.filter((_, idx) => idx !== index))
  }

  const addContactRecipient = () => {
    const email = contactRecipientInput.trim()
    if (!email) return
    if (!emailPattern.test(email)) {
      toast.error('请输入有效的邮箱地址')
      return
    }
    if (contactRecipients.includes(email)) {
      toast.error('该邮箱已存在于收件人列表')
      return
    }
    setContactRecipients(prev => [...prev, email])
    setContactRecipientInput('')
  }

  const removeContactRecipient = (index: number) => {
    setContactRecipients(prev => prev.filter((_, idx) => idx !== index))
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      const payload: any = {
        ...form,
        default_recipients: recipients,
        contact_recipients: contactRecipients,
        contact_enabled: contactEnabled
      }
      if (!payload.password) {
        delete payload.password
      }
      const response = await notificationsApi.updateEmailSettings(payload)
      if (response.success) {
        toast.success('邮件设置已保存')
        const data = (response.data || {}) as EmailNotificationSettings
        setForm({
          ...defaultForm,
          ...data,
          password: ''
        })
        setRecipients(data.default_recipients || [])
        setContactRecipients(data.contact_recipients || [])
        setContactEnabled(!!data.contact_enabled)
        setHasPassword(!!data.has_password)
        setLastStatus(data.test_status || 'pending')
        setLastError(data.last_error)
        setLastUpdated(data.updated_at)
      } else {
        toast.error(response.message || '保存失败')
      }
    } catch (error) {
      console.error('保存邮件设置失败', error)
      toast.error('保存失败，请稍后重试')
    } finally {
      setIsSaving(false)
    }
  }

  const sendTestEmail = async () => {
    const targets = testRecipient.trim() ? [testRecipient.trim()] : recipients
    if (!targets.length) {
      toast.error('请先添加或填写测试收件人')
      return
    }
    setIsTesting(true)
    try {
      const response = await notificationsApi.sendTestEmail({ to: targets })
      if (response.success) {
        toast.success('测试邮件已发送')
        setLastStatus('success')
        setLastError(null)
      } else {
        toast.error(response.message || '测试发送失败')
        setLastStatus('failed')
      }
    } catch (error: any) {
      console.error('发送测试邮件失败', error)
      toast.error(error?.response?.data?.message || '测试发送失败')
      setLastStatus('failed')
      setLastError(error?.message || '发送失败')
    } finally {
      setIsTesting(false)
    }
  }

  const statusBadge = useMemo(() => {
    switch (lastStatus) {
      case 'success':
        return <span className="px-2 py-1 rounded-lg bg-green-100 text-green-700 text-xs">测试通过</span>
      case 'failed':
        return <span className="px-2 py-1 rounded-lg bg-red-100 text-red-600 text-xs">测试失败</span>
      default:
        return <span className="px-2 py-1 rounded-lg bg-yellow-100 text-yellow-700 text-xs">待测试</span>
    }
  }, [lastStatus])

  return (
    <div className="space-y-6">
      {/* 头部说明 */}
      <div className="bg-theme-surfaceAlt p-6 rounded-xl border border-semantic-panelBorder shadow-md">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="w-6 h-6 text-theme-accent" />
          <div>
            <h1 className="text-2xl font-bold text-theme-text">邮件设置</h1>
            <p className="text-theme-textSecondary text-sm">
              配置全局 SMTP 发信信息，用于通知设置和后台事件提醒
            </p>
          </div>
        </div>
      </div>

      {/* SMTP 基础配置 */}
      <div className="bg-semantic-panel p-6 rounded-xl border border-semantic-panelBorder space-y-4">
        <div className="flex items-center space-x-3 mb-2">
          <Mail className="w-5 h-5 text-theme-accent" />
          <div>
            <h2 className="text-lg font-semibold text-theme-text">SMTP 基础信息</h2>
            <p className="text-sm text-theme-textSecondary">服务器、端口、安全连接方式</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-theme-text mb-1">SMTP 服务器</label>
            <ThemeAwareInput
              value={form.smtp_host}
              onChange={(e) => handleInputChange('smtp_host', e.target.value)}
              placeholder="smtp.example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-theme-text mb-1">端口</label>
            <ThemeAwareInput
              type="number"
              value={form.smtp_port}
              onChange={(e) => handleInputChange('smtp_port', Number(e.target.value))}
              placeholder="587 / 465"
            />
          </div>
          <div>
            <label className="block text-sm text-theme-text mb-1">安全连接</label>
            <ThemeAwareSelect
              value={form.secure ? 'true' : 'false'}
              onChange={(e) => handleInputChange('secure', e.target.value === 'true')}
            >
              <option value="false">STARTTLS（推荐 587）</option>
              <option value="true">SMTPS（465）</option>
            </ThemeAwareSelect>
          </div>
        </div>
      </div>

      {/* 认证与发件人 */}
      <div className="bg-semantic-panel p-6 rounded-xl border border-semantic-panelBorder space-y-4">
        <div className="flex items-center space-x-3 mb-2">
          <ShieldCheck className="w-5 h-5 text-theme-accent" />
          <div>
            <h2 className="text-lg font-semibold text-theme-text">认证信息</h2>
            <p className="text-sm text-theme-textSecondary">SMTP 账号、密码及发件身份</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-theme-text mb-1">用户名</label>
            <ThemeAwareInput
              value={form.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="no-reply@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-theme-text mb-1">密码/授权码</label>
            <ThemeAwareInput
              type="password"
              value={form.password || ''}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder={hasPassword ? '留空表示不修改' : '请输入 SMTP 密码/授权码'}
            />
            {hasPassword && (
              <p className="text-xs text-theme-textSecondary mt-1">已保存密码，留空表示不修改</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-theme-text mb-1">状态</label>
            <ThemeAwareSelect
              value={form.status || 'active'}
              onChange={(e) => handleInputChange('status', e.target.value)}
            >
              <option value="active">启用</option>
              <option value="inactive">停用</option>
            </ThemeAwareSelect>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-theme-text mb-1">发件人名称</label>
            <ThemeAwareInput
              value={form.from_name || ''}
              onChange={(e) => handleInputChange('from_name', e.target.value)}
              placeholder="通知中心 / 系统名称"
            />
          </div>
          <div>
            <label className="block text-sm text-theme-text mb-1">发件邮箱</label>
            <ThemeAwareInput
              type="email"
              value={form.from_email}
              onChange={(e) => handleInputChange('from_email', e.target.value)}
              placeholder="no-reply@example.com"
            />
          </div>
        </div>
      </div>

      {/* 默认收件人 */}
      <div className="bg-semantic-panel p-6 rounded-xl border border-semantic-panelBorder space-y-4">
        <div className="flex items-center space-x-3 mb-2">
          <Activity className="w-5 h-5 text-theme-accent" />
          <div>
            <h2 className="text-lg font-semibold text-theme-text">默认收件人</h2>
            <p className="text-sm text-theme-textSecondary">用于各类通知，若测试未指定收件人也将使用此处列表</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <ThemeAwareInput
            value={recipientInput}
            onChange={(e) => setRecipientInput(e.target.value)}
            placeholder="输入邮箱后点击添加"
          />
          <button
            type="button"
            onClick={addRecipient}
            className="inline-flex items-center justify-center px-4 py-2 bg-tech-accent text-white rounded-lg hover:bg-tech-accent/90 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            添加
          </button>
        </div>
        {recipients.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {recipients.map((email, index) => (
              <span key={email} className="inline-flex items-center px-3 py-1 rounded-full bg-theme-surfaceAlt text-theme-text text-sm">
                {email}
                <button
                  type="button"
                  onClick={() => removeRecipient(index)}
                  className="ml-2 text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-theme-textSecondary">尚未添加默认收件人</p>
        )}
      </div>

      {/* 联系表单通知 */}
      <div className="bg-semantic-panel p-6 rounded-xl border border-semantic-panelBorder space-y-4">
        <div className="flex items-center space-x-3 mb-2">
          <Activity className="w-5 h-5 text-theme-accent" />
          <div>
            <h2 className="text-lg font-semibold text-theme-text">联系表单通知</h2>
            <p className="text-sm text-theme-textSecondary">开启后可将联系表单提交发送到下方收件人（为空时使用默认收件人）</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-theme-text">
            <input
              type="checkbox"
              checked={contactEnabled}
              onChange={(e) => setContactEnabled(e.target.checked)}
              className="w-4 h-4"
            />
            <span>开启联系表单邮件通知</span>
          </label>
          <p className="text-xs text-theme-textSecondary">需先配置收件人才能发送邮件</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <ThemeAwareInput
            value={contactRecipientInput}
            onChange={(e) => setContactRecipientInput(e.target.value)}
            placeholder="输入邮箱后点击添加"
            disabled={!contactEnabled}
          />
          <button
            type="button"
            onClick={addContactRecipient}
            disabled={!contactEnabled}
            className="inline-flex items-center justify-center px-4 py-2 bg-tech-accent text-white rounded-lg hover:bg-tech-accent/90 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4 mr-1" />
            添加
          </button>
        </div>
        {contactRecipients.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {contactRecipients.map((email, index) => (
              <span key={email} className="inline-flex items-center px-3 py-1 rounded-full bg-theme-surfaceAlt text-theme-text text-sm">
                {email}
                <button
                  type="button"
                  onClick={() => removeContactRecipient(index)}
                  className="ml-2 text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-theme-textSecondary">尚未添加联系表单通知收件人（将使用默认收件人）</p>
        )}
      </div>

      {/* 测试发送 */}
      <div className="bg-semantic-panel p-6 rounded-xl border border-semantic-panelBorder space-y-4">
        <div className="flex items-center space-x-3 mb-2">
          <Send className="w-5 h-5 text-theme-accent" />
          <div className="flex items-center space-x-3">
            <div>
              <h2 className="text-lg font-semibold text-theme-text">发送测试邮件</h2>
              <p className="text-sm text-theme-textSecondary">验证配置是否可用</p>
            </div>
            {statusBadge}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm text-theme-text mb-1">测试收件人（留空则使用默认列表）</label>
            <ThemeAwareInput
              type="email"
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              placeholder="test@example.com"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={sendTestEmail}
              disabled={isTesting}
              className="inline-flex items-center px-4 py-2 bg-tech-accent text-white rounded-lg hover:bg-tech-accent/90 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4 mr-2" />
              {isTesting ? '发送中...' : '发送测试'}
            </button>
            <button
              type="button"
              onClick={loadSettings}
              className="inline-flex items-center px-4 py-2 border border-theme-divider rounded-lg text-theme-textSecondary hover:text-theme-text"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              重载
            </button>
          </div>
        </div>
        {lastError ? (
          <div className="text-sm text-red-600">上次错误：{lastError}</div>
        ) : (
          <div className="text-sm text-theme-textSecondary">确保收件人可达且 SMTP 认证正确</div>
        )}
      </div>

      {/* 操作 */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={loadSettings}
          className="px-5 py-2 border border-theme-divider text-theme-textSecondary rounded-lg hover:text-theme-text hover:bg-theme-surfaceAlt transition-colors"
          disabled={isLoading || isSaving}
        >
          取消修改
        </button>
        <button
          type="button"
          onClick={saveSettings}
          disabled={isSaving}
          className="inline-flex items-center px-6 py-2 bg-tech-accent text-white rounded-lg hover:bg-tech-accent/90 transition-colors disabled:opacity-50"
        >
          <Mail className="w-4 h-4 mr-2" />
          {isSaving ? '保存中...' : '保存设置'}
        </button>
      </div>

      {lastUpdated && (
        <div className="text-xs text-theme-textSecondary">
          最近更新：{lastUpdated}
        </div>
      )}
    </div>
  )
}
