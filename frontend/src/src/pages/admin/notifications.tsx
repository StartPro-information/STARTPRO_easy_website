import React, { useMemo, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import EmailSettingsPanel from '@/components/notifications/EmailSettingsPanel'

const tabs = [
  { key: 'email', label: '邮件设置', status: 'available' },
  { key: 'wechat', label: '微信通知', status: 'coming-soon' },
  { key: 'sms', label: '短信通知', status: 'coming-soon' },
  { key: 'dingtalk', label: '钉钉通知', status: 'coming-soon' }
] as const

type TabKey = (typeof tabs)[number]['key']

interface ComingSoonProps {
  channelName: string
}

const ComingSoon = ({ channelName }: ComingSoonProps) => (
  <div className="bg-semantic-panel border border-dashed border-theme-divider rounded-xl p-8 text-center space-y-3">
    <div className="inline-flex items-center px-3 py-1 rounded-full bg-theme-surfaceAlt text-theme-textSecondary text-sm">
      待开发
    </div>
    <h2 className="text-xl font-semibold text-theme-text">{channelName}</h2>
    <p className="text-sm text-theme-textSecondary">
      此渠道的通知配置正在规划中，后续将支持模板配置、开关、收件人/收件群等能力。
    </p>
  </div>
)

export default function NotificationSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('email')

  const activeTabMeta = useMemo(() => tabs.find(tab => tab.key === activeTab) || tabs[0], [activeTab])

  return (
    <AdminLayout title="通知设置" description="管理通知渠道的配置，当前提供邮件设置">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-theme-text">通知设置</h1>
            <p className="text-sm text-theme-textSecondary">
              统一管理各类通知渠道，已开放邮件设置，其他渠道预留待开发。
            </p>
          </div>
        </div>

        <div className="bg-semantic-panel border border-semantic-panelBorder rounded-xl p-3">
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => {
              const isActive = tab.key === activeTab
              const isDisabled = tab.status === 'coming-soon'
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => !isDisabled && setActiveTab(tab.key)}
                  disabled={isDisabled}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--semantic-hero-accent)] text-[color:var(--semantic-hero-accent-contrast)] shadow-semantic'
                      : 'bg-theme-surfaceAlt text-theme-textSecondary hover:text-theme-text hover:bg-theme-surface'
                  } ${isDisabled ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {tab.label}
                  {tab.status === 'coming-soon' && <span className="ml-2 text-xs">（待开发）</span>}
                </button>
              )
            })}
          </div>
        </div>

        {activeTabMeta.key === 'email' && <EmailSettingsPanel />}
        {activeTabMeta.key === 'wechat' && <ComingSoon channelName="微信通知" />}
        {activeTabMeta.key === 'sms' && <ComingSoon channelName="短信通知" />}
        {activeTabMeta.key === 'dingtalk' && <ComingSoon channelName="钉钉通知" />}
      </div>
    </AdminLayout>
  )
}
