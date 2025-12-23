import React from 'react'
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import { AssetPickerTarget } from '../hooks/useAssetPicker'

interface StatsSectionEditorProps {
  stats: any[]
  onAdd: () => void
  onChange: (index: number, fieldKey: string, value: any) => void
  onRemove: (index: number) => void
  openAssetPicker: (target: AssetPickerTarget, currentValue?: string) => void
  isAssetUrl: (value?: string) => boolean
  isSvgMarkup: (value?: string) => boolean
  onFieldChange: (key: string, value: any) => void
  textColorMode?: 'gradient' | 'solid'
  textColor?: string
}

const StatsSectionEditor: React.FC<StatsSectionEditorProps> = ({
  stats,
  onAdd,
  onChange,
  onRemove,
  openAssetPicker,
  isAssetUrl,
  isSvgMarkup,
  onFieldChange,
  textColorMode,
  textColor
}) => {
  const mode = textColorMode === 'solid' ? 'solid' : 'gradient'
  const color = textColor || '#0ea5e9'

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 dark:text-white">统计数据</h4>
        <button
          onClick={onAdd}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-tech-accent text-white rounded-lg hover:bg-tech-secondary transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>新增数据</span>
        </button>
      </div>
      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">数值颜色</span>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300">
            <input
              type="radio"
              checked={mode === 'gradient'}
              onChange={() => onFieldChange('textColorMode', 'gradient')}
            />
            渐变
          </label>
          <label className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300">
            <input
              type="radio"
              checked={mode === 'solid'}
              onChange={() => onFieldChange('textColorMode', 'solid')}
            />
            统一颜色
          </label>
        </div>
        {mode === 'solid' && (
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="color"
              value={color}
              onChange={(e) => onFieldChange('textColor', e.target.value)}
              className="h-8 w-12 rounded border border-theme-divider bg-theme-surface"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => onFieldChange('textColor', e.target.value)}
              className="w-32 px-2 py-1 text-sm rounded theme-input"
              placeholder="#0ea5e9"
            />
          </div>
        )}
      </div>

      {stats.map((stat: any, index: number) => (
        <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">数据 {index + 1}</span>
            <button onClick={() => onRemove(index)} className="p-1 text-red-500 hover:text-red-700">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-[1.3fr_1fr]">
            <div className="space-y-2">
              {stat.icon && (
                <div className="flex flex-wrap items-center gap-2">
                  {isAssetUrl(stat.icon) ? (
                    <>
                      <div className="w-10 h-10 border border-gray-200 rounded flex items-center justify-center bg-white dark:bg-gray-800">
                        <img
                          src={stat.icon}
                          alt="图标预览"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">资源预览</span>
                    </>
                  ) : isSvgMarkup(stat.icon) ? (
                    <>
                      <div
                        className="w-8 h-8 flex items-center justify-center"
                        dangerouslySetInnerHTML={{
                          __html: stat.icon
                            .replace(/width=\"[^\"]*\"/g, 'width=\"100%\"')
                            .replace(/height=\"[^\"]*\"/g, 'height=\"100%\"')
                        }}
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400">SVG 图标</span>
                    </>
                  ) : null}
                </div>
              )}
              {!isSvgMarkup(stat.icon) && (
                <input
                  type="text"
                  value={stat.icon || ''}
                  onChange={(e) => onChange(index, 'icon', e.target.value)}
                  placeholder="图标 (emoji / SVG / 资源 URL)"
                  className="w-full px-2 py-1 text-sm rounded theme-input"
                />
              )}
              <div className="text-xs text-gray-500 dark:text-gray-400">支持 emoji、SVG 或上传图片</div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openAssetPicker({ fieldKey: 'icon', arrayKey: 'stats', arrayIndex: index }, stat.icon)}
                  className="flex items-center space-x-1 px-2 py-1 text-xs rounded border border-theme-divider bg-theme-surfaceAlt text-theme-textSecondary hover:bg-theme-surface transition-colors"
                >
                  <ImageIcon className="w-3 h-3" />
                  <span>资源库选择</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">数值</label>
                <input
                  type="text"
                  value={stat.value || ''}
                  onChange={(e) => onChange(index, 'value', e.target.value)}
                  placeholder="例如 100+"
                  className="w-full px-2 py-1 text-sm rounded theme-input"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">标签</label>
                <input
                  type="text"
                  value={stat.label || ''}
                  onChange={(e) => onChange(index, 'label', e.target.value)}
                  placeholder="例如 服务覆盖"
                  className="w-full px-2 py-1 text-sm rounded theme-input"
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsSectionEditor
