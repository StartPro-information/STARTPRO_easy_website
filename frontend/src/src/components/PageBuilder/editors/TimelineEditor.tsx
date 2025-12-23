import React from 'react'
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import { AssetPickerTarget } from '../hooks/useAssetPicker'

interface TimelineEditorProps {
  events: any[]
  onAdd: () => void
  onChange: (index: number, fieldKey: string, value: any) => void
  onRemove: (index: number) => void
  openAssetPicker: (target: AssetPickerTarget, currentValue?: string) => void
  isAssetUrl: (value?: string) => boolean
  isSvgMarkup: (value?: string) => boolean
}

const TimelineEditor: React.FC<TimelineEditorProps> = ({
  events,
  onAdd,
  onChange,
  onRemove,
  openAssetPicker,
  isAssetUrl,
  isSvgMarkup
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 dark:text-white">时间线事件</h4>
        <button
          onClick={onAdd}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-tech-accent text-white rounded-lg hover:bg-tech-secondary transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>新增事件</span>
        </button>
      </div>

      {events.map((event: any, index: number) => (
        <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">事件 {index + 1}</span>
            <button onClick={() => onRemove(index)} className="p-1 text-red-500 hover:text-red-700">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={event.date || ''}
              onChange={(e) => onChange(index, 'date', e.target.value)}
              placeholder="年份/日期"
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded theme-input"
            />
            <div className="space-y-1">
              {event.icon && (
                <div className="flex items-center space-x-2">
                  {isAssetUrl(event.icon) ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 border border-gray-200 rounded flex items-center justify-center bg-white dark:bg-gray-800">
                        <img
                          src={event.icon}
                          alt="图标预览"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">资源预览</span>
                    </div>
                  ) : isSvgMarkup(event.icon) ? (
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-6 h-6 flex items-center justify-center"
                        dangerouslySetInnerHTML={{
                          __html: event.icon
                            .replace(/width=\"[^\"]*\"/g, 'width="100%"')
                            .replace(/height=\"[^\"]*\"/g, 'height="100%"')
                        }}
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400">SVG 图标</span>
                    </div>
                  ) : null}
                </div>
              )}
              {!isSvgMarkup(event.icon) && (
                <input
                  type="text"
                  value={event.icon || ''}
                  onChange={(e) => onChange(index, 'icon', e.target.value)}
                  placeholder="图标 (emoji / SVG / 资源 URL)"
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded theme-input"
                />
              )}
              <div className="text-xs text-gray-500 dark:text-gray-400">支持 emoji、SVG 或上传图标</div>
              <button
                type="button"
                onClick={() => openAssetPicker({ fieldKey: 'icon', arrayKey: 'events', arrayIndex: index }, event.icon)}
                className="flex items-center space-x-1 px-2 py-1 text-xs rounded border border-theme-divider bg-theme-surfaceAlt text-theme-textSecondary hover:bg-theme-surface transition-colors"
              >
                <ImageIcon className="w-3 h-3" />
                <span>资源库选择</span>
              </button>
            </div>
          </div>
          <input
            type="text"
            value={event.title || ''}
            onChange={(e) => onChange(index, 'title', e.target.value)}
            placeholder="事件标题"
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded theme-input"
          />
          <textarea
            value={event.description || ''}
            onChange={(e) => onChange(index, 'description', e.target.value)}
            placeholder="事件描述"
            rows={2}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded theme-input resize-none"
          />
        </div>
      ))}
    </div>
  )
}

export default TimelineEditor
