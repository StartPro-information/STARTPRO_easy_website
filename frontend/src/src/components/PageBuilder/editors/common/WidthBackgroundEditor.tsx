import React from 'react'
import { EditableField } from '@/types/templates'

interface WidthBackgroundEditorProps {
  formData: any
  editableFields?: EditableField[]
  onChange: (key: string, value: any) => void
}

const fallbackWidthOptions = [
  { label: '全宽', value: 'full' },
  { label: '标准宽度', value: 'standard' }
]

const fallbackBgOptions = [
  { label: '默认背景', value: 'default' },
  { label: '透明背景', value: 'transparent' }
]

export const WidthBackgroundEditor: React.FC<WidthBackgroundEditorProps> = ({
  formData,
  editableFields,
  onChange
}) => {
  const widthField = editableFields?.find(f => f.key === 'widthOption')
  const bgField = editableFields?.find(f => f.key === 'backgroundColorOption')

  const shouldRenderWidth = formData.hasOwnProperty('widthOption') || Boolean(widthField)
  const shouldRenderBg = formData.hasOwnProperty('backgroundColorOption') || Boolean(bgField)

  if (!shouldRenderWidth && !shouldRenderBg) return null

  const widthOptions = widthField?.options?.length ? widthField.options : fallbackWidthOptions
  const bgOptions = bgField?.options?.length ? bgField.options : fallbackBgOptions

  return (
    <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {shouldRenderWidth && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-theme-textPrimary">宽度设置</label>
          <select
            value={formData.widthOption ?? widthField?.value ?? 'full'}
            onChange={(e) => onChange('widthOption', e.target.value)}
            className="w-full px-3 py-2 border border-theme-divider bg-theme-surfaceAlt theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
          >
            {widthOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {shouldRenderBg && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-theme-textPrimary">背景设置</label>
          <select
            value={formData.backgroundColorOption ?? bgField?.value ?? 'default'}
            onChange={(e) => onChange('backgroundColorOption', e.target.value)}
            className="w-full px-3 py-2 border border-theme-divider bg-theme-surfaceAlt theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
          >
            {bgOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
