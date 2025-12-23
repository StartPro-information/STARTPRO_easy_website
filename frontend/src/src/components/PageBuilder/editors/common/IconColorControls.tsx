import React from 'react'
import { Palette } from 'lucide-react'

const ICON_COLOR_PRESETS = ['#0ea5e9', '#6366f1', '#10b981', '#f97316', '#f43f5e']
const DEFAULT_ICON_COLOR = '#0ea5e9'

interface IconColorControlsProps {
  iconColorMode: 'default' | 'custom'
  iconColor: string
  onModeChange: (mode: 'default' | 'custom') => void
  onColorChange: (value: string) => void
}

export const IconColorControls: React.FC<IconColorControlsProps> = ({
  iconColorMode,
  iconColor,
  onModeChange,
  onColorChange
}) => {
  const colorValue = iconColor?.trim() || DEFAULT_ICON_COLOR

  return (
    <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-[200px]">
          <div className="flex items-center gap-2 mb-1">
            <Palette className="w-4 h-4 text-tech-accent" />
            <h4 className="font-medium text-gray-900 dark:text-white">图标颜色</h4>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            统一覆盖当前组件的图标颜色，支持 currentColor 的 SVG
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onModeChange('default')}
            className={`px-3 py-1 text-xs rounded-full border ${
              iconColorMode === 'default'
                ? 'bg-tech-accent text-white border-tech-accent'
                : 'text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-tech-accent hover:text-tech-accent'
            }`}
          >
            保持原色
          </button>
          <button
            type="button"
            onClick={() => onModeChange('custom')}
            className={`px-3 py-1 text-xs rounded-full border ${
              iconColorMode === 'custom'
                ? 'bg-tech-accent text-white border-tech-accent'
                : 'text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-tech-accent hover:text-tech-accent'
            }`}
          >
            统一颜色
          </button>
        </div>
      </div>

      {iconColorMode === 'custom' && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="color"
              value={colorValue}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-14 h-10 rounded border border-gray-300 dark:border-gray-600 p-0"
            />
            <input
              type="text"
              value={colorValue}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
              placeholder="#0ea5e9"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {ICON_COLOR_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onColorChange(preset)}
                className={`w-8 h-8 rounded-full border-2 ${
                  colorValue.toLowerCase() === preset.toLowerCase()
                    ? 'border-tech-accent'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: preset }}
                aria-label={`选择 ${preset} 颜色`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
