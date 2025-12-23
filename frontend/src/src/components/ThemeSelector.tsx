import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, Check, SlidersHorizontal, Sparkles } from 'lucide-react'
import {
  colorThemes,
  type ColorTheme,
  applyTheme,
  getThemeById,
  DEFAULT_THEME_OVERRIDES,
  type ThemeBackgroundChoice
} from '@/styles/themes'
import { applyIsolatedThemeVariables } from '@/styles/themeComponents'
import type { ThemeOverrideSettings } from '@/types'

const applyThemePreset = (theme: ColorTheme, overrides: ThemeOverrideSettings) => {
  applyTheme(theme, overrides)
  applyIsolatedThemeVariables(theme.id, overrides)
}

const hexToRgba = (hex: string, alpha: number) => {
  const sanitized = hex.replace('#', '')
  const bigint = parseInt(sanitized, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const overrideConfig: Array<{
  key: keyof ThemeOverrideSettings
  label: string
  description: string
  min: number
  max: number
  step: number
  format?: (value: number) => string
}> = [
  {
    key: 'accentSaturation',
    label: '强调色饱和度',
    description: '提升后更鲜艳，降低后更内敛，适配不同品牌语气。',
    min: 0.8,
    max: 1.2,
    step: 0.01,
    format: value => `${Math.round(value * 100)}%`
  },
  {
    key: 'panelBrightness',
    label: '面板亮度',
    description: '决定卡片与背景的对比，保证可读性与层次感。',
    min: 0.8,
    max: 1.2,
    step: 0.01,
    format: value => `${Math.round(value * 100)}%`
  },
  {
    key: 'borderRadiusScale',
    label: '圆角比例',
    description: '从锐利到圆润，快速呼应品牌调性。',
    min: 0.8,
    max: 1.2,
    step: 0.01
  },
  {
    key: 'shadowDepth',
    label: '阴影深度',
    description: '强调立体与悬浮感，突出重要卡片或按钮。',
    min: 0.8,
    max: 1.5,
    step: 0.01
  }
]

const backgroundOptions: Array<{
  value: ThemeBackgroundChoice
  label: string
  description: string
}> = [
  { value: 'theme-default', label: '跟随主题推荐', description: '自动匹配当前主题的背景特效' },
  { value: 'starfield', label: '星空粒子', description: '高科技/暗夜风格常用的深色粒子' },
  { value: 'gradient', label: '柔和渐变', description: '营造柔光与多层渐变的氛围' },
  { value: 'pattern', label: '纹理图案', description: '适合商务或轻量展示的纹理式背景' }
]

interface ThemeSelectorProps {
  onThemeChange?: (theme: ColorTheme) => void
  selectedThemeId?: string
  className?: string
  overrides?: ThemeOverrideSettings
  onOverridesChange?: (overrides: ThemeOverrideSettings) => void
  backgroundChoice?: ThemeBackgroundChoice
  onBackgroundChange?: (choice: ThemeBackgroundChoice) => void
}

const ThemePreview: React.FC<{ theme: ColorTheme }> = ({ theme }) => (
  <div
    className="rounded-xl border p-4 space-y-3 transition-colors"
    style={{ borderColor: theme.neutral.border, background: theme.neutral.surfaceAlt }}
  >
    <div
      className="rounded-lg p-4 shadow-sm"
      style={{ background: theme.colors.surface, color: theme.colors.text.primary }}
    >
      <p className="text-sm font-semibold mb-1">组件示例</p>
      <p className="text-xs opacity-80">按钮、标签与正文在当前主题下的视觉呈现。</p>
      <div className="mt-3 flex items-center gap-2">
        <button
          className="px-3 py-1 rounded-lg text-xs font-medium shadow-sm"
          style={{ background: theme.colors.primary, color: theme.colors.companyName || '#FFFFFF' }}
        >
          主按钮
        </button>
        <span
          className="px-3 py-1 rounded-lg text-xs font-medium border"
          style={{ borderColor: theme.neutral.border, color: theme.colors.text.secondary }}
        >
          次按钮
        </span>
        <span
          className="px-2 py-1 rounded-full text-[10px] font-semibold"
          style={{ background: hexToRgba(theme.colors.accent, 0.2), color: theme.colors.accent }}
        >
          TAG
        </span>
      </div>
    </div>
    <div className="flex items-center justify-between text-xs">
      <span style={{ color: theme.colors.text.secondary }}>正文颜色</span>
      <span style={{ color: theme.colors.accent }}>Accent</span>
    </div>
  </div>
)

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  onThemeChange,
  selectedThemeId = 'neo-futuristic',
  className = '',
  overrides,
  onOverridesChange,
  backgroundChoice,
  onBackgroundChange
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [showOverrides, setShowOverrides] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>(getThemeById(selectedThemeId))
  const [localOverrides, setLocalOverrides] = useState<ThemeOverrideSettings>(
    overrides || DEFAULT_THEME_OVERRIDES
  )
  const [localBackgroundChoice, setLocalBackgroundChoice] = useState<ThemeBackgroundChoice>(
    backgroundChoice || 'theme-default'
  )

  useEffect(() => {
    const theme = getThemeById(selectedThemeId)
    setCurrentTheme(theme)
    applyThemePreset(theme, overrides || localOverrides)
  }, [selectedThemeId])

  useEffect(() => {
    const nextOverrides = overrides || DEFAULT_THEME_OVERRIDES
    setLocalOverrides(nextOverrides)
    applyThemePreset(currentTheme, nextOverrides)
  }, [overrides, currentTheme])

  useEffect(() => {
    if (backgroundChoice) {
      setLocalBackgroundChoice(backgroundChoice)
    }
  }, [backgroundChoice])

  const handleThemeSelect = (theme: ColorTheme) => {
    setCurrentTheme(theme)
    applyThemePreset(theme, localOverrides)
    setIsOpen(false)
    onThemeChange?.(theme)
  }

  const handleOverrideChange = (key: keyof ThemeOverrideSettings, value: number) => {
    const config = overrideConfig.find(item => item.key === key)
    const clamped = Math.min(config?.max ?? value, Math.max(config?.min ?? value, value))
    const updated = { ...localOverrides, [key]: clamped }
    setLocalOverrides(updated)
    applyThemePreset(currentTheme, updated)
    onOverridesChange?.(updated)
  }

  const handleResetOverrides = () => {
    setLocalOverrides(DEFAULT_THEME_OVERRIDES)
    applyThemePreset(currentTheme, DEFAULT_THEME_OVERRIDES)
    onOverridesChange?.(DEFAULT_THEME_OVERRIDES)
  }

  const canPickBackground =
    typeof onBackgroundChange === 'function' || typeof backgroundChoice !== 'undefined'

  const handleBackgroundSelect = (value: ThemeBackgroundChoice) => {
    setLocalBackgroundChoice(value)
    onBackgroundChange?.(value)
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-theme-surface border border-theme-divider rounded-lg hover:bg-theme-surfaceAlt transition-colors shadow-sm"
      >
        <div
          className="w-5 h-5 rounded-full border-2 border-theme-divider shadow"
          style={{ backgroundColor: currentTheme.preview }}
        />
        <Palette className="w-4 h-4 text-theme-textSecondary" />
        <span className="text-sm font-medium text-theme-text">{currentTheme.name}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-80 bg-theme-surface border border-theme-divider rounded-xl shadow-xl z-50"
          >
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-theme-text">选择配色方案</h3>
                <button
                  onClick={() => setShowOverrides(prev => !prev)}
                  className="inline-flex items-center text-xs font-medium text-theme-textSecondary hover:text-theme-text"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-1" /> 微调参数
                </button>
              </div>

              <div className="space-y-3">
                {colorThemes.map(theme => (
                  <motion.button
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
                      currentTheme.id === theme.id
                        ? 'border-theme-accent bg-theme-surfaceAlt'
                        : 'border-theme-divider hover:border-theme-accent'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex space-x-1">
                      <div className="w-6 h-6 rounded-full shadow-md" style={{ backgroundColor: theme.colors.primary }} />
                      <div className="w-6 h-6 rounded-full shadow-md" style={{ backgroundColor: theme.colors.secondary }} />
                      <div className="w-6 h-6 rounded-full shadow-md" style={{ backgroundColor: theme.colors.accent }} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-theme-text">{theme.name}</div>
                      <div className="text-xs text-theme-textSecondary">{theme.description}</div>
                    </div>
                    {currentTheme.id === theme.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 bg-theme-accent text-white rounded-full flex items-center justify-center"
                      >
                        <Check className="w-4 h-4" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>

              {canPickBackground && (
                <div className="space-y-2 pt-1 border-t border-dashed border-theme-divider">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-theme-text">
                      <Sparkles className="w-4 h-4 text-theme-accent" />
                      <span>背景效果</span>
                    </div>
                    <span className="text-xs text-theme-textSecondary">
                      {localBackgroundChoice === 'theme-default' ? '跟随主题推荐' : '已自定义'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {backgroundOptions.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleBackgroundSelect(option.value)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          localBackgroundChoice === option.value
                            ? 'border-theme-accent bg-theme-surfaceAlt text-theme-text'
                            : 'border-theme-divider hover:border-theme-accent text-theme-textSecondary'
                        }`}
                      >
                        <p className="text-sm font-medium">{option.label}</p>
                        <p className="text-xs mt-1">{option.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <ThemePreview theme={currentTheme} />
              <p className="text-xs text-theme-textSecondary text-center">
                主题将同步应用到后台/官网的关键模块，建议调节后即时预览效果。
              </p>

              <AnimatePresence initial={false}>
                {showOverrides && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-4 pt-4 border-t border-theme-divider"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-theme-text">语义层微调</span>
                      <button
                        type="button"
                        onClick={handleResetOverrides}
                        className="text-xs text-theme-textSecondary hover:text-theme-text"
                      >
                        恢复默认
                      </button>
                    </div>
                    {overrideConfig.map(control => (
                      <div key={control.key} className="space-y-2">
                        <div className="flex items-center justify-between text-xs gap-3">
                          <div>
                            <p className="font-medium text-theme-text">{control.label}</p>
                            <p className="text-theme-textSecondary">{control.description}</p>
                          </div>
                          <span className="text-theme-textSecondary">
                            {control.format
                              ? control.format(localOverrides[control.key])
                              : localOverrides[control.key].toFixed(2)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={control.min}
                          max={control.max}
                          step={control.step}
                          value={localOverrides[control.key]}
                          onChange={event => handleOverrideChange(control.key, parseFloat(event.target.value))}
                          className="w-full"
                          style={{ accentColor: 'var(--color-accent)' }}
                        />
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  )
}

export default ThemeSelector
