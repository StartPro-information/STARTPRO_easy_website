import React from 'react'
import Link from 'next/link'
import { Palette } from 'lucide-react'
import { ThemeAwareSelect } from '@/components/ThemeAwareFormControls'

const themeOptions = [
  { value: 'serene-white', label: '素雅白色' },
  { value: 'starry-night', label: '深邃星空' },
  { value: 'elegant-dark', label: '优雅暗色' },
  { value: 'minimal-pro', label: '极简专业' },
  { value: 'neo-futuristic', label: '未来主义' },
  { value: 'corporate-blue', label: '商务蓝' },
  { value: 'emerald-forest', label: '翠绿森林' },
  { value: 'royal-amber', label: '琥珀金' },
  { value: 'mystic-purple', label: '秘境紫' },
  { value: 'classic-blue', label: '经典蓝' }
]

interface ThemeColorFieldProps {
  selectProps: React.SelectHTMLAttributes<HTMLSelectElement>
  customThemeConfigured?: boolean
  customThemeHref?: string
}

const ThemeColorField: React.FC<ThemeColorFieldProps> = ({
  selectProps,
  customThemeConfigured = false,
  customThemeHref = '/admin/theme-custom'
}) => {
  const customLabel = customThemeConfigured ? '自定义主题' : '自定义主题（未配置）'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-theme-text">主题颜色选择</label>
        <Link
          href={customThemeHref}
          className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-tech-accent text-white shadow-sm hover:bg-tech-accent/90 transition-colors"
        >
          <Palette className="w-3.5 h-3.5" />
          配置自定义主题
        </Link>
      </div>
      <ThemeAwareSelect {...selectProps}>
        {themeOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        <option value="custom">{customLabel}</option>
      </ThemeAwareSelect>
      <p className="text-xs text-theme-textSecondary">
        预设主题用于快速套用风格，自定义主题可通过独立页面配置。
      </p>
    </div>
  )
}

export default ThemeColorField
