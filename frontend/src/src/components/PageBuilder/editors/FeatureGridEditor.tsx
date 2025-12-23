import React from 'react'
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import { AssetPickerTarget } from '../hooks/useAssetPicker'

interface FeatureGridEditorProps {
  type: 'feature-grid' | 'feature-grid-large'
  features: any[]
  cardsPerRow: number | string
  onCardsPerRowChange: (value: any) => void
  onChange: (index: number, fieldKey: string, value: any) => void
  onAdd: () => void
  onRemove: (index: number) => void
  openAssetPicker: (target: AssetPickerTarget, currentValue?: string) => void
  isAssetUrl: (value?: string) => boolean
  isSvgMarkup: (value?: string) => boolean
}

const FeatureGridEditor: React.FC<FeatureGridEditorProps> = ({
  type,
  features,
  cardsPerRow,
  onCardsPerRowChange,
  onChange,
  onAdd,
  onRemove,
  openAssetPicker,
  isAssetUrl,
  isSvgMarkup
}) => {
  const isLarge = type === 'feature-grid-large'

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 dark:text-white">功能列表</h4>
        <button
          onClick={onAdd}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-tech-accent text-white rounded-lg hover:bg-tech-secondary transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>新增功能</span>
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">每行卡片数</label>
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="1"
            max="6"
            value={parseInt(String(cardsPerRow)) || 3}
            onChange={(e) => onCardsPerRowChange(e.target.value)}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-8 text-center">
            {parseInt(String(cardsPerRow)) || 3}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">控制大屏时每行显示卡片数量</p>
      </div>

      {(features || []).map((feature: any, index: number) => (
        <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">功能 {index + 1}</span>
            <button onClick={() => onRemove(index)} className="p-1 text-red-500 hover:text-red-700">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {isLarge ? (
              <>
                {isAssetUrl(feature.icon) && (
                  <div className="flex items-center space-x-2">
                    <img
                      src={feature.icon}
                      alt="已选图片"
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">素材已选</span>
                  </div>
                )}
                {isSvgMarkup(feature.icon) && !isAssetUrl(feature.icon) && (
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-8 h-8 flex items-center justify-center"
                      dangerouslySetInnerHTML={{
                        __html: feature.icon
                          .replace(/width=\"[^\"]*\"/g, 'width=\"100%\"')
                          .replace(/height=\"[^\"]*\"/g, 'height=\"100%\"')
                      }}
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">SVG 图标</span>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <input
                    type="text"
                    value={feature.icon || ''}
                    onChange={(e) => onChange(index, 'icon', e.target.value)}
                    placeholder="图片 URL 或 SVG"
                    className="w-full sm:flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded  theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => openAssetPicker({ fieldKey: 'icon', arrayKey: 'features', arrayIndex: index }, feature.icon)}
                    className="flex items-center gap-1 px-3 py-2 text-xs border border-theme-divider bg-theme-surfaceAlt text-theme-textSecondary hover:bg-theme-surface transition-colors sm:flex-none"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>选择素材</span>
                  </button>
                </div>
                {isAssetUrl(feature.icon) && (
                  <div className="mt-2">
                    <img
                      src={feature.icon}
                      alt="预览"
                      className="w-full h-24 object-contain border border-gray-200 rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <input
                    type="text"
                    value={feature.icon || ''}
                    onChange={(e) => onChange(index, 'icon', e.target.value)}
                    placeholder="图标 (emoji / SVG 代码或素材 URL)"
                    className="w-full sm:flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded  theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => openAssetPicker({ fieldKey: 'icon', arrayKey: 'features', arrayIndex: index }, feature.icon)}
                    className="flex items-center gap-1 px-3 py-2 text-xs border border-theme-divider bg-theme-surfaceAlt text-theme-textSecondary hover:bg-theme-surface transition-colors sm:flex-none"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>选择素材</span>
                  </button>
                </div>
              </>
            )}
            <input
              type="text"
              value={feature.title || ''}
              onChange={(e) => onChange(index, 'title', e.target.value)}
              placeholder="功能标题"
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded  theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
            />
            <textarea
              value={feature.description || ''}
              onChange={(e) => onChange(index, 'description', e.target.value)}
              placeholder="功能描述"
              rows={3}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded  theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent resize-none"
            />
            <input
              type="text"
              value={feature.link || ''}
              onChange={(e) => onChange(index, 'link', e.target.value)}
              placeholder="链接（可选）"
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded  theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
            />
            {!isLarge && (
              <div className="space-y-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">如需上传大图，请使用大图模式组件</label>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default FeatureGridEditor
