import React, { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Save, ArrowLeft, Sparkles, Palette } from 'lucide-react'
import Link from 'next/link'
import AdminLayout from '@/components/AdminLayout'
import { ThemeAwareInput } from '@/components/ThemeAwareFormControls'
import { settingsApi } from '@/utils/api'
import { useSettings } from '@/contexts/SettingsContext'
import toast from 'react-hot-toast'
import {
  DEFAULT_CUSTOM_THEME_PALETTE,
  createCustomTheme,
  setCustomThemePalette,
  CUSTOM_THEME_ID,
  type CustomThemePalette
} from '@/styles/themes'

const colorFields: Array<{
  key: keyof CustomThemePalette
  label: string
  helper: string
}> = [
  { key: 'primary', label: '主色', helper: '用于重点文字、按钮与高亮元素。' },
  { key: 'secondary', label: '次色', helper: '与主色搭配，形成层次。' },
  { key: 'accent', label: '强调色', helper: '用于 CTA、重点指引与点缀。' },
  { key: 'background', label: '背景色', helper: '页面整体背景色。' },
  { key: 'surface', label: '面板色', helper: '卡片/面板/模块背景色。' },
  { key: 'surfaceAlt', label: '弱面板色', helper: '用于次级模块与输入底色。' },
  { key: 'border', label: '边框色', helper: '控制卡片与表单的边线清晰度。' },
  { key: 'divider', label: '分割线', helper: '模块之间的分隔线颜色。' },
  { key: 'textPrimary', label: '主文字', helper: '标题与正文主色。' },
  { key: 'textSecondary', label: '次文字', helper: '辅助说明与次要信息。' },
  { key: 'textMuted', label: '弱文字', helper: '提示/弱化信息。' },
  { key: 'ctaPrimaryBg', label: 'CTA 背景', helper: '主行动按钮背景色。' },
  { key: 'ctaPrimaryText', label: 'CTA 文字', helper: '主行动按钮文字色。' },
  { key: 'heroBg', label: 'Hero 背景', helper: '首屏或大视觉区背景色。' },
  { key: 'heroAccent', label: 'Hero 强调', helper: '首屏点缀/高亮色。' }
]

const buildPayload = (data: CustomThemePalette): CustomThemePalette => ({
  ...DEFAULT_CUSTOM_THEME_PALETTE,
  ...data,
  name: data.name?.trim() || DEFAULT_CUSTOM_THEME_PALETTE.name,
  description: data.description?.trim() || DEFAULT_CUSTOM_THEME_PALETTE.description,
  companyName: data.companyName?.trim() || data.textPrimary || DEFAULT_CUSTOM_THEME_PALETTE.companyName,
  primary: data.primary.trim(),
  secondary: data.secondary.trim(),
  accent: data.accent.trim(),
  background: data.background.trim(),
  surface: data.surface.trim(),
  surfaceAlt: data.surfaceAlt?.trim() || DEFAULT_CUSTOM_THEME_PALETTE.surfaceAlt,
  border: data.border?.trim() || DEFAULT_CUSTOM_THEME_PALETTE.border,
  divider: data.divider?.trim() || DEFAULT_CUSTOM_THEME_PALETTE.divider,
  textPrimary: data.textPrimary.trim(),
  textSecondary: data.textSecondary.trim(),
  textMuted: data.textMuted.trim(),
  ctaPrimaryBg: data.ctaPrimaryBg?.trim() || DEFAULT_CUSTOM_THEME_PALETTE.ctaPrimaryBg,
  ctaPrimaryText: data.ctaPrimaryText?.trim() || DEFAULT_CUSTOM_THEME_PALETTE.ctaPrimaryText,
  heroBg: data.heroBg?.trim() || DEFAULT_CUSTOM_THEME_PALETTE.heroBg,
  heroAccent: data.heroAccent?.trim() || DEFAULT_CUSTOM_THEME_PALETTE.heroAccent
})

export default function CustomThemePage() {
  const { settings, refreshSettings } = useSettings()
  const [isSaving, setIsSaving] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { isDirty }
  } = useForm<CustomThemePalette>({
    defaultValues: DEFAULT_CUSTOM_THEME_PALETTE,
    mode: 'onChange'
  })

  useEffect(() => {
    const preset = { ...DEFAULT_CUSTOM_THEME_PALETTE, ...(settings?.custom_theme || {}) }
    reset(preset)
  }, [settings?.custom_theme, reset])

  const watchedPalette = watch()
  const previewTheme = useMemo(() => createCustomTheme(watchedPalette), [watchedPalette])

  const handleSave = async (payload: CustomThemePalette, activate: boolean) => {
    try {
      setIsSaving(true)
      const finalPayload = buildPayload(payload)
      const updatePayload: Record<string, any> = {
        custom_theme: finalPayload
      }
      if (activate) {
        updatePayload.site_theme = CUSTOM_THEME_ID
      }
      const response = await settingsApi.update(updatePayload)
      if (!response.success) {
        toast.error(response.message || '保存失败')
        return
      }
      setCustomThemePalette(finalPayload)
      toast.success(activate ? '自定义主题已保存并启用' : '自定义主题已保存')
      await refreshSettings()
      reset(finalPayload)
    } catch (error) {
      console.error('保存自定义主题失败:', error)
      toast.error('保存失败，请稍后重试')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AdminLayout title="自定义主题" description="配置品牌专属配色，生成可选主题方案">
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-semantic-panel border border-semantic-panelBorder rounded-2xl p-4 shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-theme-accent/20 text-theme-accent flex items-center justify-center">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-theme-text">自定义主题配色</h1>
                <p className="text-sm text-theme-textSecondary">
                  编辑核心颜色，系统会自动生成语义色阶与图表配色。
                </p>
              </div>
            </div>
            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-theme-divider text-theme-textSecondary hover:text-theme-text hover:bg-theme-surfaceAlt transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              返回系统设置
            </Link>
          </div>

          <div className="rounded-2xl border border-semantic-panelBorder p-4 bg-semantic-mutedBg/60 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-theme-text">
                <Sparkles className="w-4 h-4 text-theme-accent" />
                主题实时预览
              </div>
              <div
                className="rounded-xl p-3 space-y-3"
                style={{
                  background: previewTheme.semantic.panelBg,
                  border: `1px solid ${previewTheme.semantic.panelBorder}`
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 style={{ color: previewTheme.colors.text.primary }} className="text-sm font-semibold">
                      {previewTheme.name}
                    </h3>
                    <p style={{ color: previewTheme.colors.text.secondary }} className="text-xs">
                      {previewTheme.description}
                    </p>
                  </div>
                  <span
                    className="px-2 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: previewTheme.semantic.tagBg,
                      color: previewTheme.semantic.tagText
                    }}
                  >
                    Accent
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[previewTheme.colors.primary, previewTheme.colors.secondary, previewTheme.colors.accent].map((color, index) => (
                    <div
                      key={`${color}-${index}`}
                      className="h-10 rounded-lg flex items-center justify-center text-white font-semibold"
                      style={{ background: color }}
                    >
                      {index === 0 ? 'Primary' : index === 1 ? 'Secondary' : 'Accent'}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1 rounded-lg text-xs font-semibold"
                    style={{
                      background: previewTheme.semantic.ctaPrimaryBg,
                      color: previewTheme.semantic.ctaPrimaryText
                    }}
                  >
                    CTA 按钮
                  </button>
                  <span style={{ color: previewTheme.colors.text.secondary }} className="text-xs">
                    面板与文本效果
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px]">
                  <span style={{ color: previewTheme.colors.text.primary }}>主文字</span>
                  <span style={{ color: previewTheme.colors.text.secondary }}>次文字</span>
                  <span style={{ color: previewTheme.colors.text.muted }}>弱文字</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div
                    className="rounded-lg p-2"
                    style={{
                      background: previewTheme.colors.background,
                      color: previewTheme.colors.text.secondary,
                      border: `1px solid ${previewTheme.neutral.divider}`
                    }}
                  >
                    Background
                  </div>
                  <div
                    className="rounded-lg p-2"
                    style={{
                      background: previewTheme.colors.surface,
                      color: previewTheme.colors.text.secondary,
                      border: `1px solid ${previewTheme.neutral.border}`
                    }}
                  >
                    Surface
                  </div>
                  <div
                    className="rounded-lg p-2"
                    style={{
                      background: previewTheme.neutral.surfaceAlt,
                      color: previewTheme.colors.text.secondary,
                      border: `1px solid ${previewTheme.neutral.border}`
                    }}
                  >
                    Surface Alt
                  </div>
                  <div
                    className="rounded-lg p-2"
                    style={{
                      background: previewTheme.colors.surface,
                      color: previewTheme.colors.text.secondary
                    }}
                  >
                    Divider
                    <div className="mt-2 h-px" style={{ background: previewTheme.neutral.divider }} />
                  </div>
                </div>
                <div
                  className="rounded-lg p-3 text-[10px] font-semibold"
                  style={{
                    background: previewTheme.semantic.heroBg,
                    color: previewTheme.semantic.heroAccent
                  }}
                >
                  Hero Accent
                </div>
              </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {colorFields.map(field => (
              <div key={field.key} className="rounded-xl border border-semantic-panelBorder p-3 bg-theme-surfaceAlt/60">
                <label className="block text-xs font-semibold text-theme-text mb-2">{field.label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={(watchedPalette[field.key] as string) || '#000000'}
                    onChange={event => setValue(field.key, event.target.value, { shouldDirty: true })}
                    className="h-9 w-12 rounded border border-theme-divider bg-transparent cursor-pointer"
                  />
                  <ThemeAwareInput
                    type="text"
                    {...register(field.key as keyof CustomThemePalette)}
                    placeholder="例如 #0EA5E9"
                  />
                </div>
                <p className="text-[11px] text-theme-textSecondary mt-2">{field.helper}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-end gap-3"
        >
          <button
            type="button"
            onClick={() => reset(settings?.custom_theme || DEFAULT_CUSTOM_THEME_PALETTE)}
            className="px-5 py-2 rounded-lg border border-theme-divider text-theme-textSecondary hover:text-theme-text hover:bg-theme-surfaceAlt transition-colors"
            disabled={!isDirty || isSaving}
          >
            重置
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSubmit(data => handleSave(data, false))}
            className="inline-flex items-center px-6 py-2 bg-theme-surfaceAlt text-theme-text rounded-lg border border-theme-divider hover:bg-theme-surface transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? '保存中...' : '仅保存配置'}
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSubmit(data => handleSave(data, true))}
            className="inline-flex items-center px-6 py-2 bg-tech-accent text-white rounded-lg hover:bg-tech-accent/90 transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isSaving ? '保存中...' : '保存并启用'}
          </button>
        </motion.div>
      </div>
    </AdminLayout>
  )
}
