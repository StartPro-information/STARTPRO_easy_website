import { useEffect, useState, useMemo } from 'react'
import ThemeAwareHeader from '@/components/ThemeAwareHeader'
import ThemeSelector from '@/components/ThemeSelector'
import BackgroundRenderer from '@/components/theme-backgrounds/BackgroundRenderer'
import {
  applyTheme,
  getCurrentThemeId,
  getThemeById,
  DEFAULT_THEME_OVERRIDES,
  resolveBackgroundEffect,
  type ThemeBackgroundChoice
} from '@/styles/themes'
import { applyIsolatedThemeVariables } from '@/styles/themeComponents'
import { motion } from 'framer-motion'
import type { ThemeOverrideSettings } from '@/types'

type DemoTab = 'semantic' | 'intensity' | 'custom'

const tabs: Array<{ key: DemoTab; label: string }> = [
  { key: 'semantic', label: '语义层示例' },
  { key: 'intensity', label: '强度对比' },
  { key: 'custom', label: '自定义调节' }
]

const overrideControls: Array<{
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
    description: '提高后更鲜艳，降低后更克制。',
    min: 0.8,
    max: 1.2,
    step: 0.01,
    format: value => `${Math.round(value * 100)}%`
  },
  {
    key: 'panelBrightness',
    label: '面板亮度',
    description: '控制卡片背景的明暗层次。',
    min: 0.8,
    max: 1.2,
    step: 0.01,
    format: value => `${Math.round(value * 100)}%`
  },
  {
    key: 'borderRadiusScale',
    label: '圆角比例',
    description: '从硬朗到圆润，匹配品牌语气。',
    min: 0.8,
    max: 1.2,
    step: 0.01
  },
  {
    key: 'shadowDepth',
    label: '阴影深度',
    description: '决定投影和发光的强弱。',
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
  { value: 'theme-default', label: '跟随主题', description: '自动采用主题推荐的背景效果' },
  { value: 'starfield', label: '星空粒子', description: '适合未来科技或夜景风格的动感粒子' },
  { value: 'gradient', label: '柔和渐变', description: '利用光影渐变营造柔和亮度' },
  { value: 'pattern', label: '纹理图案', description: '具有秩序感的纹理底图，适配商务场景' }
]

export default function ThemeDemo() {
  const [currentThemeId, setCurrentThemeId] = useState('neo-futuristic')
  const [activeTab, setActiveTab] = useState<DemoTab>('semantic')
  const [overrides, setOverrides] = useState<ThemeOverrideSettings>(DEFAULT_THEME_OVERRIDES)
  const [backgroundChoice, setBackgroundChoice] = useState<ThemeBackgroundChoice>('theme-default')
  const [isClient, setIsClient] = useState(false)

  const currentTheme = useMemo(() => getThemeById(currentThemeId), [currentThemeId])
  const resolvedDemoBackground = useMemo(
    () => resolveBackgroundEffect(currentTheme, backgroundChoice),
    [currentTheme, backgroundChoice]
  )

  useEffect(() => {
    setIsClient(true)
    const detected = getCurrentThemeId()
    if (detected) {
      setCurrentThemeId(detected)
    }
    if (typeof window !== 'undefined') {
      const savedOverrides = window.localStorage.getItem('theme-demo-overrides')
      if (savedOverrides) {
        try {
          const parsed = JSON.parse(savedOverrides)
          setOverrides({ ...DEFAULT_THEME_OVERRIDES, ...parsed })
        } catch (error) {
          console.warn('解析 overrides 失败', error)
        }
      }
      const savedBackground = window.localStorage.getItem('theme-demo-background') as ThemeBackgroundChoice | null
      if (savedBackground) {
        setBackgroundChoice(savedBackground)
      }
    }
  }, [])

  useEffect(() => {
    if (!isClient) return
    const theme = getThemeById(currentThemeId)
    applyTheme(theme, overrides)
    applyIsolatedThemeVariables(theme.id, overrides)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('selectedTheme', currentThemeId)
      window.localStorage.setItem('theme-demo-overrides', JSON.stringify(overrides))
      window.localStorage.setItem('theme-demo-background', backgroundChoice)
    }
  }, [currentThemeId, overrides, backgroundChoice, isClient])

  const handleOverrideChange = (key: keyof ThemeOverrideSettings, value: number) => {
    const config = overrideControls.find(item => item.key === key)
    const clamped = Math.min(config?.max ?? value, Math.max(config?.min ?? value, value))
    setOverrides(prev => ({ ...prev, [key]: clamped }))
  }

  const resetOverrides = () => {
    setOverrides(DEFAULT_THEME_OVERRIDES)
  }

  const renderSemanticTab = () => (
    <div className="grid gap-6 lg:grid-cols-2">
      <motion.div
        className="rounded-3xl border border-semantic-panelBorder bg-[var(--semantic-hero-bg)] text-theme-text p-10 shadow-[0_35px_100px_rgba(15,23,42,0.35)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm uppercase tracking-[0.3em] text-theme-textSecondary">Hero</p>
        <h2 className="mt-4 text-4xl font-bold">语义层示例</h2>
        <p className="mt-4 text-theme-textSecondary max-w-2xl">
          背景、卡片、标签与按钮分别映射到 heroBg、panelBg、tagBg、ctaPrimaryBg，浅色主题同样能获得明显层次。
        </p>
        <div className="mt-10 space-y-4">
          <div className="bg-semantic-panel rounded-2xl p-6 border border-semantic-panelBorder">
            <p className="text-sm text-theme-textSecondary">面板 (panelBg)</p>
            <p className="text-2xl font-semibold">科技新品发布</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <span className="px-3 py-1 rounded-full bg-semantic-tagBg text-semantic-tagText text-xs font-semibold">
                TAG
              </span>
              <button
                className="px-5 py-2 rounded-full font-semibold shadow-lg"
                style={{
                  background: 'var(--semantic-cta-primary-bg)',
                  color: 'var(--semantic-cta-primary-text)'
                }}
              >
                立即体验
              </button>
              <button className="px-5 py-2 rounded-full border border-semantic-cta-secondary-border text-theme-text">
                了解更多
              </button>
            </div>
          </div>
        </div>
      </motion.div>
      <div className="grid gap-4 content-start">
        <div className="rounded-2xl border border-semantic-panelBorder bg-semantic-panel p-6">
          <p className="text-sm text-theme-textSecondary">导航 & Footer</p>
          <p className="text-lg font-semibold text-theme-text">语义 token 会传递到基础组件，保持对比一致。</p>
          <div className="mt-4 space-y-2 text-sm text-theme-textSecondary">
            <p>Header 背景：<span className="font-mono">panelBg</span></p>
            <p>Footer 边框：<span className="font-mono">panelBorder</span></p>
            <p>标签背景：<span className="font-mono">tagBg</span></p>
          </div>
        </div>
        <div className="rounded-2xl border border-semantic-panelBorder bg-semantic-mutedBg/60 p-6">
          <p className="text-sm text-theme-textSecondary">提示</p>
          <p className="text-lg font-semibold text-theme-text">mutedBg + dividerStrong</p>
          <p className="mt-2 text-sm text-theme-textSecondary">
            低强调区域统一使用 mutedBg，并搭配 dividerStrong 作为分隔，实现更规整的版式。
          </p>
        </div>
      </div>
    </div>
  )

  const renderIntensityTab = () => (
    <div className="grid gap-6 lg:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-2xl border border-semantic-panelBorder bg-semantic-panel p-6"
      >
        <p className="text-sm text-theme-textSecondary mb-2">当前主题强度</p>
        <h3 className="text-2xl font-semibold text-theme-text">边框 & 阴影</h3>
        <div className="mt-6 space-y-4">
          <div>
            <p className="text-xs text-theme-textSecondary">borderWeight</p>
            <div className="h-2 rounded-full bg-semantic-mutedBg">
              <div
                className="h-full rounded-full bg-[var(--semantic-hero-accent)]"
                style={{ width: `${(currentTheme.intensity.borderWeight / 2.5) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <p className="text-xs text-theme-textSecondary">shadowStep</p>
            <div className="h-2 rounded-full bg-semantic-mutedBg">
              <div
                className="h-full rounded-full bg-[var(--semantic-cta-primary-bg)]"
                style={{ width: `${(currentTheme.intensity.shadowStep / 1.5) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <p className="text-xs text-theme-textSecondary">hoverScale</p>
            <p className="text-lg font-semibold text-theme-text">{currentTheme.intensity.hoverScale.toFixed(2)}x</p>
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-2xl border border-semantic-panelBorder bg-semantic-panel p-6"
      >
        <p className="text-sm text-theme-textSecondary mb-2">Hover 预览</p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <motion.div
            whileHover={{ scale: currentTheme.intensity.hoverScale }}
            className="flex-1 rounded-2xl border border-dashed border-semantic-panelBorder p-6 text-center"
          >
            <p className="text-xs text-theme-textSecondary">默认强度</p>
            <p className="text-3xl font-bold text-theme-text">CTA</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: Math.min(currentTheme.intensity.hoverScale + 0.05, 1.1) }}
            className="flex-1 rounded-2xl border border-semantic-cta-secondary-border p-6 text-center bg-semantic-mutedBg/60"
          >
            <p className="text-xs text-theme-textSecondary">提升 5%</p>
            <p className="text-3xl font-bold text-theme-text">CTA</p>
          </motion.div>
        </div>
        <p className="mt-4 text-xs text-theme-textSecondary">
          浅色主题会默认提升 borderWeight，深色主题会增加 accentGlow，保证可点击区域始终突出。
        </p>
      </motion.div>
    </div>
  )

  const renderCustomTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-theme-text">自定义参数</h3>
        <button
          onClick={resetOverrides}
          className="text-sm text-theme-textSecondary hover:text-theme-text"
        >
          恢复默认
        </button>
      </div>
      {overrideControls.map(control => (
        <div key={control.key} className="rounded-2xl border border-semantic-panelBorder bg-semantic-panel p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="font-medium text-theme-text">{control.label}</p>
              <p className="text-theme-textSecondary">{control.description}</p>
            </div>
            <span className="text-theme-textSecondary">
              {control.format
                ? control.format(overrides[control.key])
                : overrides[control.key].toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={control.min}
            max={control.max}
            step={control.step}
            value={overrides[control.key]}
            onChange={event => handleOverrideChange(control.key, parseFloat(event.target.value))}
            className="w-full"
            style={{ accentColor: 'var(--color-accent)' }}
          />
        </div>
      ))}
    </div>
  )

  const renderBackgroundShowcase = () => {
    const meta = backgroundOptions.find(option => option.value === backgroundChoice)
    const backgroundTypeLabel = resolvedDemoBackground
      ? {
          starfield: '星空粒子',
          gradient: '柔和渐变',
          pattern: '纹理图案'
        }[resolvedDemoBackground.type] || '主题色块'
      : '主题色块'
    return (
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="relative rounded-3xl border border-white/10 bg-black/30 overflow-hidden min-h-[260px]">
          <BackgroundRenderer effect={resolvedDemoBackground} />
          <div className="relative z-10 h-full flex flex-col justify-between p-8 text-white">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/70">Background</p>
              <h3 className="mt-3 text-3xl font-semibold">{backgroundTypeLabel}</h3>
              <p className="mt-2 text-sm text-white/80 max-w-xl">
                背景效果与主题联动，可通过 ThemeSelector 快速切换。每一种效果都包含亮度、纹理与粒子密度等预设。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm text-white/85">
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4">
                <p className="text-xs uppercase tracking-wide text-white/60 mb-1">亮度</p>
                <p className="text-lg font-semibold">
                  {resolvedDemoBackground?.type === 'gradient' ? '柔光 65%' : resolvedDemoBackground?.type === 'starfield' ? '深夜 35%' : '中性 50%'}
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4">
                <p className="text-xs uppercase tracking-wide text-white/60 mb-1">细节</p>
                <p className="text-lg font-semibold">
                  {resolvedDemoBackground?.type === 'pattern' ? '纹理密度 40%' : '粒子密度 30%'}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-semantic-panelBorder bg-semantic-panel p-6 space-y-3">
          <p className="text-sm text-theme-textSecondary">背景说明</p>
          <h3 className="text-2xl font-semibold text-theme-text">
            {meta?.label || '背景效果'}
          </h3>
          <p className="text-sm text-theme-textSecondary">{meta?.description}</p>
          <div className="mt-4 space-y-2">
            {backgroundOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setBackgroundChoice(option.value)}
                className={`w-full text-left px-4 py-2 rounded-2xl border transition-colors ${
                  backgroundChoice === option.value
                    ? 'border-theme-accent bg-semantic-mutedBg/80 text-theme-text'
                    : 'border-semantic-panelBorder hover:border-theme-accent text-theme-textSecondary'
                }`}
              >
                <p className="text-sm font-medium">{option.label}</p>
                <p className="text-xs">{option.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-theme-background text-theme-text">
      <BackgroundRenderer effect={resolvedDemoBackground} />
      <div className="relative z-10">
        <ThemeAwareHeader siteName="主题演示" />
        <main className="container mx-auto px-4 pt-32 pb-16 space-y-10">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <p className="text-sm uppercase tracking-[0.4em] text-theme-textSecondary">Theme Lab</p>
            <h1 className="text-4xl md:text-5xl font-bold">语义 + 强度 + 可调参数</h1>
            <p className="text-theme-textSecondary">
              通过语义 token 和强度引擎，让主题在不同模式下保持层次，并且支持实时调节参数，快速校准品牌视觉。
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <ThemeSelector
                selectedThemeId={currentThemeId}
                overrides={overrides}
                backgroundChoice={backgroundChoice}
                onThemeChange={theme => setCurrentThemeId(theme.id)}
                onOverridesChange={setOverrides}
                onBackgroundChange={setBackgroundChoice}
              />
              <div className="flex flex-wrap gap-2 bg-semantic-panel px-3 py-2 rounded-2xl border border-semantic-panelBorder text-xs text-theme-textSecondary">
                <span className="uppercase tracking-wide">快捷背景</span>
                {backgroundOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setBackgroundChoice(option.value)}
                    className={`px-3 py-1 rounded-full border transition-colors ${
                      backgroundChoice === option.value
                        ? 'border-theme-accent text-theme-text bg-semantic-mutedBg/80'
                        : 'border-transparent hover:text-theme-text'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-sm text-theme-textSecondary">
              当前主题：<span className="font-medium text-theme-text">{currentTheme.name}</span>
            </div>
          </div>

          {renderBackgroundShowcase()}

          <div className="flex flex-wrap gap-3 border border-semantic-panelBorder rounded-full px-3 py-2 bg-semantic-panel/60">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-semantic-cta-primary text-white shadow-semantic'
                    : 'text-theme-textSecondary hover:text-theme-text'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="rounded-3xl border border-semantic-panelBorder bg-semantic-panel p-8">
            {activeTab === 'semantic' && renderSemanticTab()}
            {activeTab === 'intensity' && renderIntensityTab()}
            {activeTab === 'custom' && renderCustomTab()}
          </div>
        </main>

        <footer className="py-8 border-t border-semantic-panelBorder text-center text-theme-textSecondary">
          Theme Demo © {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  )
}
