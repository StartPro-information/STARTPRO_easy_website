import React from 'react'
import { ExternalLink, Image as ImageIcon } from 'lucide-react'
import { AssetPickerTarget } from '../../hooks/useAssetPicker'

interface MediaPickerFieldProps {
  label: string
  fieldKey: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
  openAssetPickerWithValue: (target: AssetPickerTarget, currentValue?: string) => void
}

export const MediaPickerField: React.FC<MediaPickerFieldProps> = ({
  label,
  fieldKey,
  value,
  placeholder,
  onChange,
  openAssetPickerWithValue
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-theme-textPrimary">{label}</label>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <input
          type="url"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full sm:flex-1 max-w-full px-3 py-2 border border-theme-divider bg-theme-surfaceAlt theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
          placeholder={placeholder || '请输入或选择资源 URL'}
        />
        <div className="flex items-center gap-2 sm:flex-none">
          <button
            type="button"
            onClick={() => openAssetPickerWithValue({ fieldKey }, value)}
            className="flex items-center gap-1 px-3 py-2 text-xs bg-theme-surfaceAlt text-theme-textSecondary hover:bg-theme-surface transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
            <span>选择素材</span>
          </button>
          {value && (
            <button
              type="button"
              onClick={() => window.open(value, '_blank')}
              className="flex items-center gap-1 px-3 py-2 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>预览</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
