import React from 'react'
import { EditableField } from '@/types/templates'

interface TextFieldsEditorProps {
  formData: any
  editableFields?: EditableField[]
  onChange: (key: string, value: any) => void
}

const FIELD_CONFIG: Array<{
  key: string
  label: string
  type: 'text' | 'textarea' | 'url'
  placeholder?: string
}> = [
  { key: 'title', label: '标题', type: 'text', placeholder: '请输入标题' },
  { key: 'subtitle', label: '副标题', type: 'textarea', placeholder: '请输入副标题' },
  { key: 'content', label: '内容', type: 'textarea', placeholder: '请输入内容（可选 HTML）' },
  { key: 'description', label: '描述', type: 'textarea', placeholder: '请输入描述' },
  { key: 'caption', label: '说明/脚注', type: 'text', placeholder: '请输入说明文字' },
  { key: 'buttonText', label: '按钮文字', type: 'text', placeholder: '请输入按钮文字' },
  { key: 'buttonLink', label: '按钮链接', type: 'url', placeholder: '如 /about 或 https://example.com' }
]

export const TextFieldsEditor: React.FC<TextFieldsEditorProps> = ({
  formData,
  editableFields,
  onChange
}) => {
  const editableKeys = new Set(editableFields?.map(f => f.key))
  const shouldRenderKey = (key: string) =>
    Object.prototype.hasOwnProperty.call(formData, key) || editableKeys.has(key)

  return (
    <div className="space-y-4">
      {FIELD_CONFIG.filter(cfg => shouldRenderKey(cfg.key)).map(cfg => (
        <div key={cfg.key} className="space-y-2">
          <label className="block text-sm font-medium text-theme-textPrimary">{cfg.label}</label>
          {cfg.type === 'textarea' ? (
            <textarea
              value={formData[cfg.key] || ''}
              onChange={(e) => onChange(cfg.key, e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-theme-divider bg-theme-surfaceAlt theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent resize-none"
              placeholder={cfg.placeholder}
            />
          ) : (
            <input
              type={cfg.type === 'url' ? 'url' : 'text'}
              value={formData[cfg.key] || ''}
              onChange={(e) => onChange(cfg.key, e.target.value)}
              className="w-full px-3 py-2 border border-theme-divider bg-theme-surfaceAlt theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
              placeholder={cfg.placeholder}
            />
          )}
          {cfg.key === 'buttonLink' && (
            <p className="text-xs text-theme-textSecondary">可使用相对路径或完整 URL</p>
          )}
        </div>
      ))}
    </div>
  )
}
