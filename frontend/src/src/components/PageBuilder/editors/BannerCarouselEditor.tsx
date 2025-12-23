import React from 'react'
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import { AssetPickerTarget } from '../hooks/useAssetPicker'

interface BannerCarouselEditorProps {
  slides: any[]
  settings: {
    autoPlay?: boolean
    showIndicators?: boolean
    showArrows?: boolean
    interval?: number
  }
  onAdd: () => void
  onChange: (index: number, fieldKey: string, value: any) => void
  onRemove: (index: number) => void
  onToggle: (key: 'autoPlay' | 'showIndicators' | 'showArrows', value: boolean) => void
  onIntervalChange: (value: number) => void
  openAssetPicker: (target: AssetPickerTarget, currentValue?: string) => void
}

const BannerCarouselEditor: React.FC<BannerCarouselEditorProps> = ({
  slides,
  settings,
  onAdd,
  onChange,
  onRemove,
  onToggle,
  onIntervalChange,
  openAssetPicker
}) => {
  const autoPlay = settings.autoPlay !== false
  const showIndicators = settings.showIndicators !== false
  const showArrows = settings.showArrows !== false
  const interval = settings.interval || 5000

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 dark:text-white">幻灯片</h4>
        <button
          onClick={onAdd}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-tech-accent text-white rounded-lg hover:bg-tech-secondary transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>新增幻灯片</span>
        </button>
      </div>

      {slides.map((slide: any, index: number) => (
        <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">幻灯片 {index + 1}</span>
            <button onClick={() => onRemove(index)} className="p-1 text-red-500 hover:text-red-700">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>

          {/* 图片 */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">图片</label>
            <input
              type="url"
              value={slide.image || ''}
              onChange={(e) => onChange(index, 'image', e.target.value)}
              placeholder="图片 URL"
              className="w-full px-2 py-1 text-sm rounded theme-input"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => openAssetPicker({ fieldKey: 'image', arrayKey: 'slides', arrayIndex: index }, slide.image)}
                className="flex items-center space-x-1 px-3 py-1 text-sm rounded-lg border border-theme-divider bg-theme-surfaceAlt text-theme-textSecondary hover:bg-theme-surface transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
                <span>选择资源</span>
              </button>
            </div>
          </div>

          {/* 文案 */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={slide.title || ''}
              onChange={(e) => onChange(index, 'title', e.target.value)}
              placeholder="标题"
              className="w-full px-2 py-1 text-sm rounded theme-input"
            />
            <input
              type="text"
              value={slide.description || ''}
              onChange={(e) => onChange(index, 'description', e.target.value)}
              placeholder="副标题/描述"
              className="w-full px-2 py-1 text-sm rounded theme-input"
            />
          </div>

          {/* 按钮 */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={slide.buttonText || ''}
              onChange={(e) => onChange(index, 'buttonText', e.target.value)}
              placeholder="按钮文字"
              className="w-full px-2 py-1 text-sm rounded theme-input"
            />
            <input
              type="url"
              value={slide.buttonLink || ''}
              onChange={(e) => onChange(index, 'buttonLink', e.target.value)}
              placeholder="按钮链接"
              className="w-full px-2 py-1 text-sm rounded theme-input"
            />
          </div>

          {/* 覆盖层位置 */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">覆盖层位置</label>
            <select
              value={slide.overlayPosition || 'center'}
              onChange={(e) => onChange(index, 'overlayPosition', e.target.value)}
              className="w-full px-2 py-1 text-sm rounded theme-input"
            >
              <option value="top-left">左上角</option>
              <option value="top-center">顶部居中</option>
              <option value="top-right">右上角</option>
              <option value="center-left">左侧居中</option>
              <option value="center">居中</option>
              <option value="center-right">右侧居中</option>
              <option value="bottom-left">左下角</option>
              <option value="bottom-center">底部居中</option>
              <option value="bottom-right">右下角</option>
            </select>
          </div>
        </div>
      ))}

      {/* 轮播设置 */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">轮播设置</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">自动播放</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoPlay}
                onChange={(e) => onToggle('autoPlay', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-tech-accent/30 dark:peer-focus:ring-tech-accent/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-tech-accent"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">显示指示器</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showIndicators}
                onChange={(e) => onToggle('showIndicators', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-tech-accent/30 dark:peer-focus:ring-tech-accent/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-tech-accent"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">显示箭头</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showArrows}
                onChange={(e) => onToggle('showArrows', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-tech-accent/30 dark:peer-focus:ring-tech-accent/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-tech-accent"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">切换间隔 (毫秒)</label>
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[40px]">1s</span>
              <input
                type="range"
                min="1000"
                max="20000"
                step="500"
                value={interval}
                onChange={(e) => onIntervalChange(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[40px]">20s</span>
            </div>
            <div className="text-center mt-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {interval / 1000}秒
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BannerCarouselEditor
