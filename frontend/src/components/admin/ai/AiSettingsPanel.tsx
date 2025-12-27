import React, { useEffect, useState } from 'react'
import { aiApi } from '@/utils/api'
import toast from 'react-hot-toast'
import { AiSettings, DEFAULT_SETTINGS } from './aiDefaults'

const DEFAULT_API_BASES: Record<string, string> = {
  openai: 'https://api.openai.com/v1',
  deepseek: 'https://api.deepseek.com/v1',
  xinference: 'http://localhost:9997/v1'
}

const MODEL_OPTIONS: Record<string, Array<{ label: string; value: string }>> = {
  openai: [
    { label: 'gpt-4o-mini', value: 'gpt-4o-mini' },
    { label: 'gpt-4o', value: 'gpt-4o' },
    { label: 'gpt-4.1-mini', value: 'gpt-4.1-mini' }
  ],
  deepseek: [
    { label: 'deepseek-chat', value: 'deepseek-chat' },
    { label: 'deepseek-reasoner', value: 'deepseek-reasoner' }
  ],
  xinference: [
    { label: 'qwen2.5-instruct', value: 'qwen2.5-instruct' },
    { label: 'llama3-instruct', value: 'llama3-instruct' }
  ]
}

const API_KEY_PLACEHOLDERS: Record<string, string> = {
  openai: '输入 OpenAI API Key，例如 sk-***',
  deepseek: '输入 DeepSeek API Key，例如 sk-***',
  xinference: '本地服务可留空（如有鉴权请填写）'
}

type AiProfileForm = AiSettings & {
  id?: number
  profile_name: string
  is_default?: number
}

const AiSettingsPanel = () => {
  const [settings, setSettings] = useState<AiProfileForm>({
    ...DEFAULT_SETTINGS,
    profile_name: '默认配置'
  })
  const [profiles, setProfiles] = useState<AiProfileForm[]>([])
  const [editingProfileId, setEditingProfileId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [modelPreset, setModelPreset] = useState<string>('custom')

  const applyProfile = (profile: AiProfileForm) => {
    setSettings({
      id: profile.id,
      profile_name: profile.profile_name || '默认配置',
      provider: profile.provider || 'openai',
      api_base: profile.api_base || '',
      api_key: profile.api_key || '',
      model: profile.model || '',
      temperature: Number(profile.temperature ?? 0.7),
      max_tokens: Number(profile.max_tokens ?? 800),
      top_p: Number(profile.top_p ?? 1.0),
      enabled: Boolean(profile.enabled),
      is_default: profile.is_default || 0
    })

    const providerOptions = MODEL_OPTIONS[profile.provider] || []
    const matched = providerOptions.find((item) => item.value === profile.model)
    setModelPreset(matched ? matched.value : 'custom')
  }

  const resetToNewProfile = () => {
    const base = DEFAULT_API_BASES.openai
    const nextModel = MODEL_OPTIONS.openai?.[0]?.value || ''
    setEditingProfileId(null)
    setSettings({
      ...DEFAULT_SETTINGS,
      profile_name: '',
      provider: 'openai',
      api_base: base,
      model: nextModel
    })
    setModelPreset(nextModel || 'custom')
  }

  const loadProfiles = async () => {
    setLoading(true)
    try {
      const response = await aiApi.listProfiles()
      if (response.success) {
        const rows = (response.data || []) as AiProfileForm[]
        setProfiles(rows)
        const defaultProfile = rows.find((item) => item.is_default) || rows[0]
        if (defaultProfile) {
          applyProfile(defaultProfile)
        } else {
          resetToNewProfile()
        }
      }
    } catch (error) {
      console.error('Load AI profiles failed:', error)
      toast.error('加载 AI 配置失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfiles()
  }, [])

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const payload = {
        ...settings,
        profile_name: settings.profile_name?.trim() || '默认配置',
        temperature: Number(settings.temperature),
        max_tokens: Number(settings.max_tokens),
        top_p: Number(settings.top_p)
      }
      const response = editingProfileId
        ? await aiApi.updateProfile(editingProfileId, payload)
        : await aiApi.createProfile(payload)
      if (response.success) {
        toast.success('AI 配置已保存')
        await loadProfiles()
        setIsModalOpen(false)
      } else {
        toast.error(response.message || '保存失败')
      }
    } catch (error) {
      console.error('Save AI settings failed:', error)
      toast.error('保存 AI 配置失败')
    } finally {
      setSaving(false)
    }
  }

  const handleTestSettings = async () => {
    setTesting(true)
    try {
      if (!editingProfileId) {
        toast.error('请先保存配置再测试连接')
        return
      }
      const response = await aiApi.testSettings(editingProfileId)
      if (response.success) {
        toast.success('连接测试成功')
      } else {
        toast.error(response.message || '测试失败')
      }
    } catch (error) {
      console.error('Test AI settings failed:', error)
      toast.error('连接测试失败')
    } finally {
      setTesting(false)
    }
  }

  const handleProviderChange = (provider: string) => {
    const base = DEFAULT_API_BASES[provider] || ''
    const nextModelOptions = MODEL_OPTIONS[provider] || []
    const nextModel = nextModelOptions[0]?.value || ''
    setSettings((prev) => ({
      ...prev,
      provider,
      api_base: base,
      model: nextModel || prev.model
    }))
    setModelPreset(nextModel ? nextModel : 'custom')
  }

  const handleModelPresetChange = (value: string) => {
    setModelPreset(value)
    if (value !== 'custom') {
      setSettings((prev) => ({ ...prev, model: value }))
    }
  }

  const providerModelOptions = MODEL_OPTIONS[settings.provider] || []

  return (
    <>
      <div className="bg-semantic-panel rounded-xl border border-semantic-panelBorder p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-theme-text mb-4">AI 基础配置</h2>
        {loading ? (
          <div className="text-sm text-theme-textSecondary">加载中...</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-theme-text">配置档案</label>
              <button
                type="button"
                onClick={() => {
                  resetToNewProfile()
                  setIsModalOpen(true)
                }}
                className="rounded-lg bg-tech-accent px-4 py-2 text-sm text-white hover:bg-tech-accent/90"
              >
                新增配置
              </button>
            </div>

            {profiles.length === 0 ? (
              <div className="text-sm text-theme-textSecondary">暂无配置，请先新增一条。</div>
            ) : (
              <div className="space-y-3">
                {profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="flex flex-col gap-3 rounded-lg border border-theme-divider bg-theme-surfaceAlt px-4 py-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-theme-text">
                        {profile.profile_name}
                        {profile.is_default ? (
                          <span className="ml-2 rounded-full bg-theme-accent/10 px-2 py-0.5 text-xs text-theme-accent">
                            默认
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs text-theme-textSecondary">
                        平台：{profile.provider} · 模型：{profile.model}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {!profile.is_default && (
                        <button
                          type="button"
                          onClick={async () => {
                            const response = await aiApi.setDefaultProfile(profile.id as number)
                            if (response.success) {
                              toast.success('已设为默认配置')
                              await loadProfiles()
                            }
                          }}
                          className="rounded-lg border border-theme-divider bg-theme-surface px-3 py-1.5 text-sm text-theme-textSecondary hover:text-theme-text"
                        >
                          设为默认
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          applyProfile(profile)
                          setEditingProfileId(profile.id ?? null)
                          setIsModalOpen(true)
                        }}
                        className="rounded-lg border border-theme-divider bg-theme-surface px-3 py-1.5 text-sm text-theme-textSecondary hover:text-theme-text"
                      >
                        编辑
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!confirm('确定要删除这个配置吗？')) return
                          const response = await aiApi.deleteProfile(profile.id as number)
                          if (response.success) {
                            toast.success('配置已删除')
                            await loadProfiles()
                          }
                        }}
                        className="rounded-lg border border-rose-200 px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
          <div
            className="w-full max-w-2xl rounded-xl border border-theme-divider bg-color-surface p-6 shadow-2xl"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-theme-text">
                  {editingProfileId ? '编辑配置' : '新增配置'}
                </h3>
                <p className="text-sm text-theme-textSecondary">每行设置一个参数，配置完成后保存即可。</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-theme-textSecondary hover:text-theme-text"
              >
                关闭
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto pr-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-theme-text mb-1">配置名称</label>
                <input
                  value={settings.profile_name}
                  onChange={(e) => setSettings((prev) => ({ ...prev, profile_name: e.target.value }))}
                  className="w-full rounded-lg border border-theme-divider bg-theme-surfaceAlt px-3 py-2 text-theme-text theme-input"
                  placeholder="例如：DeepSeek 生产"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-text mb-1">平台</label>
                <select
                  value={settings.provider}
                  onChange={(e) => handleProviderChange(e.target.value)}
                  className="w-full rounded-lg border border-theme-divider bg-theme-surfaceAlt px-3 py-2 text-theme-text theme-input"
                >
                  <option value="openai">OpenAI</option>
                  <option value="deepseek">DeepSeek</option>
                  <option value="xinference">Xinference</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-text mb-1">模型</label>
                <div className="space-y-2">
                  <select
                    value={modelPreset}
                    onChange={(e) => handleModelPresetChange(e.target.value)}
                    className="w-full rounded-lg border border-theme-divider bg-theme-surfaceAlt px-3 py-2 text-theme-text theme-input"
                  >
                    {providerModelOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                    <option value="custom">自定义...</option>
                  </select>
                  <input
                    value={settings.model}
                    onChange={(e) => setSettings((prev) => ({ ...prev, model: e.target.value }))}
                    className="w-full rounded-lg border border-theme-divider bg-theme-surfaceAlt px-3 py-2 text-theme-text theme-input"
                    placeholder="自定义模型名称"
                    disabled={modelPreset !== 'custom'}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-text mb-1">API Base URL</label>
                <input
                  value={settings.api_base}
                  onChange={(e) => setSettings((prev) => ({ ...prev, api_base: e.target.value }))}
                  className="w-full rounded-lg border border-theme-divider bg-theme-surfaceAlt px-3 py-2 text-theme-text theme-input"
                  placeholder={DEFAULT_API_BASES[settings.provider] || '留空使用默认地址'}
                />
                <p className="mt-1 text-xs text-theme-textSecondary">可直接使用默认地址，也支持自定义</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-text mb-1">API Key</label>
                <input
                  type="password"
                  value={settings.api_key}
                  onChange={(e) => setSettings((prev) => ({ ...prev, api_key: e.target.value }))}
                  className="w-full rounded-lg border border-theme-divider bg-theme-surfaceAlt px-3 py-2 text-theme-text theme-input"
                  placeholder={API_KEY_PLACEHOLDERS[settings.provider] || '输入密钥'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-text mb-1">Temperature</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => setSettings((prev) => ({ ...prev, temperature: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-theme-divider bg-theme-surfaceAlt px-3 py-2 text-theme-text theme-input"
                  placeholder="0.0 ~ 2.0"
                />
                <p className="mt-1 text-xs text-theme-textSecondary">值越高越发散，建议 0.2 - 0.9</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-text mb-1">Max Tokens</label>
                <input
                  type="number"
                  value={settings.max_tokens}
                  onChange={(e) => setSettings((prev) => ({ ...prev, max_tokens: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-theme-divider bg-theme-surfaceAlt px-3 py-2 text-theme-text theme-input"
                  placeholder="例如 800"
                />
                <p className="mt-1 text-xs text-theme-textSecondary">生成长度上限，过大可能导致响应变慢</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-text mb-1">Top P</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.top_p}
                  onChange={(e) => setSettings((prev) => ({ ...prev, top_p: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-theme-divider bg-theme-surfaceAlt px-3 py-2 text-theme-text theme-input"
                  placeholder="例如 1.0"
                />
                <p className="mt-1 text-xs text-theme-textSecondary">建议保持 1.0，与 Temperature 搭配调节</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-theme-text">启用</label>
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => setSettings((prev) => ({ ...prev, enabled: e.target.checked }))}
                  className="h-4 w-4 text-theme-accent border-theme-divider rounded"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg border border-theme-divider bg-theme-surfaceAlt px-4 py-2 text-sm text-theme-textSecondary hover:text-theme-text"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleTestSettings}
                disabled={testing}
                className="rounded-lg border border-theme-divider bg-theme-surfaceAlt px-4 py-2 text-sm text-theme-textSecondary hover:text-theme-text"
              >
                {testing ? '测试中...' : '测试连接'}
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={saving}
                className="rounded-lg bg-tech-accent px-4 py-2 text-sm text-white hover:bg-tech-accent/90 disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存配置'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AiSettingsPanel
