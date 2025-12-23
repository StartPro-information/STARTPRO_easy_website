import React from 'react'
import { Plus, Trash2, Image as ImageIcon, ExternalLink } from 'lucide-react'
import { AssetPickerTarget } from '../hooks/useAssetPicker'

interface CyberShowcaseEditorProps {
  controls: any[]
  onAdd: () => void
  onChange: (index: number, fieldKey: string, value: any) => void
  onRemove: (index: number) => void
  openAssetPicker: (target: AssetPickerTarget, currentValue?: string) => void
  isAssetUrl: (value?: string) => boolean
  isSvgMarkup: (value?: string) => boolean
}

const CyberShowcaseEditor: React.FC<CyberShowcaseEditorProps> = ({
  controls,
  onAdd,
  onChange,
  onRemove,
  openAssetPicker,
  isAssetUrl,
  isSvgMarkup
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">按钮与展示图片</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            设置按钮文字 / 图标与展示图片，实现一一对应的切换效果。
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-tech-accent text-white rounded-lg hover:bg-tech-secondary transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>新增展示项</span>
        </button>
      </div>

      {controls.length === 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg px-4 py-6 text-center">
          当前还没有展示项，点击「新增展示项」开始配置。
        </div>
      )}

      <div className="space-y-4">
        {controls.map((control, index) => (
          <div
            key={control.id || index}
            className="p-4 border border-theme-divider rounded-lg bg-theme-surface shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-gray-900 dark:text-white">展示项 {index + 1}</h5>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-xs text-red-500 hover:text-red-600 flex items-center space-x-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>删除</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    展示标题
                  </label>
                  <input
                    type="text"
                    value={control.title || ''}
                    onChange={(e) => onChange(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                    placeholder="每个展示项的专属标题"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    展示描述
                  </label>
                  <textarea
                    value={control.description || ''}
                    onChange={(e) => onChange(index, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent resize-none"
                    placeholder="为当前展示项单独填写描述"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    按钮文字
                  </label>
                  <input
                    type="text"
                    value={control.label || ''}
                    onChange={(e) => onChange(index, 'label', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                    placeholder="例如：运营&反馈"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    按钮图标
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={control.icon || ''}
                      onChange={(e) => onChange(index, 'icon', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                      placeholder="emoji / SVG / 图片 URL"
                    />
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openAssetPicker({ fieldKey: 'icon', arrayKey: 'controls', arrayIndex: index }, control.icon)
                        }
                        className="inline-flex items-center justify-center px-3 py-2 text-xs rounded border border-theme-divider bg-theme-surfaceAlt text-theme-textSecondary hover:bg-theme-surface transition-colors space-x-1"
                      >
                        <ImageIcon className="w-3 h-3" />
                        <span>素材库</span>
                      </button>
                      {(isAssetUrl(control.icon) || isSvgMarkup(control.icon)) && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="whitespace-nowrap">图标预览</span>
                          {isAssetUrl(control.icon) && (
                            <img
                              src={control.icon}
                              alt="按钮图标"
                              className="w-10 h-10 rounded border border-gray-200 dark:border-gray-700 object-contain bg-white dark:bg-gray-900"
                            />
                          )}
                          {!isAssetUrl(control.icon) && isSvgMarkup(control.icon) && (
                            <div
                              className="w-10 h-10 border border-gray-200 dark:border-gray-700 rounded flex items-center justify-center bg-white dark:bg-gray-900"
                              dangerouslySetInnerHTML={{
                                __html: control.icon
                                  .replace(/width="[^"]*"/g, 'width="100%"')
                                  .replace(/height="[^"]*"/g, 'height="100%"')
                              }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">图标颜色</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={control.iconColor || '#60a5fa'}
                          onChange={(e) => onChange(index, 'iconColor', e.target.value)}
                          className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
                        />
                        <input
                          type="text"
                          value={control.iconColor || '#60a5fa'}
                          onChange={(e) => onChange(index, 'iconColor', e.target.value)}
                          className="flex-1 min-w-[120px] px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                          placeholder="#60A5FA"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  展示图片
                </label>
                <input
                  type="url"
                  value={control.image || ''}
                  onChange={(e) => onChange(index, 'image', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                  placeholder="https://"
                />
                <div className="flex flex-col gap-2 mt-2 sm:flex-row sm:flex-wrap sm:items-center">
                  <button
                    type="button"
                    onClick={() =>
                      openAssetPicker({ fieldKey: 'image', arrayKey: 'controls', arrayIndex: index }, control.image)
                    }
                    className="flex items-center space-x-1 px-2 py-1 text-xs rounded border border-theme-divider bg-theme-surfaceAlt text-theme-textSecondary hover:bg-theme-surface transition-colors"
                  >
                    <ImageIcon className="w-3 h-3" />
                    <span>选择素材</span>
                  </button>
                  {control.image && (
                    <button
                      type="button"
                      onClick={() => window.open(control.image, '_blank')}
                      className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>预览</span>
                    </button>
                  )}
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    图片描述（可选）
                  </label>
                  <textarea
                    value={control.imageDescription || ''}
                    onChange={(e) => onChange(index, 'imageDescription', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent resize-none"
                    placeholder="描述图片需要强调的内容"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CyberShowcaseEditor
