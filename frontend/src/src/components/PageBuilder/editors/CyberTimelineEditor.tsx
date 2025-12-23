import React from 'react'
import { Plus, Trash2 } from 'lucide-react'

interface CyberTimelineEditorProps {
  events: any[]
  onAdd: () => void
  onChange: (index: number, fieldKey: string, value: any) => void
  onRemove: (index: number) => void
}

interface TimelineTagInput {
  label: string
  highlighted?: boolean
}

const normalizeTagInputs = (tags: any, fallbackHighlight?: string): TimelineTagInput[] => {
  if (Array.isArray(tags)) {
    return tags.map(tag => {
      if (typeof tag === 'string') {
        return { label: tag }
      }
      if (typeof tag === 'object' && tag !== null) {
        return {
          label: typeof tag.label === 'string' ? tag.label : '',
          highlighted: Boolean(tag.highlighted ?? (fallbackHighlight ? tag.label === fallbackHighlight : false))
        }
      }
      return { label: '' }
    })
  }

  if (typeof tags === 'string') {
    return tags
      .split(/[,，]/)
      .map(part => part.trim())
      .filter(Boolean)
      .map(label => ({ label, highlighted: fallbackHighlight ? label === fallbackHighlight : false }))
  }

  if (!tags && fallbackHighlight) {
    return [{ label: fallbackHighlight, highlighted: true }]
  }

  return []
}

const CyberTimelineEditor: React.FC<CyberTimelineEditorProps> = ({
  events,
  onAdd,
  onChange,
  onRemove
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900 dark:text-white">赛博时间线</h4>
        <button
          onClick={onAdd}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-tech-accent text-white rounded-lg hover:bg-tech-secondary transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>新增事件</span>
        </button>
      </div>

      {events.map((event: any, index: number) => {
        const tags = normalizeTagInputs(event.tags, event.highlightTag)
        const updateTags = (nextTags: TimelineTagInput[]) => onChange(index, 'tags', nextTags)

        const handleTagLabelChange = (tagIndex: number, value: string) => {
          const next = [...tags]
          next[tagIndex] = { ...next[tagIndex], label: value }
          updateTags(next)
        }

        const toggleTagHighlight = (tagIndex: number) => {
          const next = tags.map((tag, idx) =>
            idx === tagIndex ? { ...tag, highlighted: !tag.highlighted } : tag
          )
          updateTags(next)
        }

        const removeTag = (tagIndex: number) => {
          const next = [...tags]
          next.splice(tagIndex, 1)
          updateTags(next)
        }

        const addTag = () => {
          updateTags([...tags, { label: '', highlighted: false }])
        }

        return (
          <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">事件 {index + 1}</span>
              <button onClick={() => onRemove(index)} className="p-1 text-red-500 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">建设期 / 日期</label>
                <input
                  type="text"
                  value={event.date || ''}
                  onChange={(e) => onChange(index, 'date', e.target.value)}
                  placeholder="建设期 / 日期"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded theme-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">阶段名称</label>
                <input
                  type="text"
                  value={event.phase || ''}
                  onChange={(e) => onChange(index, 'phase', e.target.value)}
                  placeholder="阶段名称（如 阶段一）"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded theme-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">事件标题</label>
                <input
                  type="text"
                  value={event.title || ''}
                  onChange={(e) => onChange(index, 'title', e.target.value)}
                  placeholder="事件标题"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded theme-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">事件描述</label>
                <textarea
                  value={event.description || ''}
                  onChange={(e) => onChange(index, 'description', e.target.value)}
                  placeholder="事件描述"
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded theme-input resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">跳转链接（可选）</label>
                <input
                  type="url"
                  value={event.link || ''}
                  onChange={(e) => onChange(index, 'link', e.target.value)}
                  placeholder="https://example.com 或 /about"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded theme-input"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">设置后点击卡片可跳转到对应页面。</p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700/60">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">标签</span>
                <button
                  type="button"
                  onClick={addTag}
                  className="inline-flex items-center space-x-1 px-2 py-1 text-xs rounded border border-theme-divider bg-theme-surfaceAlt text-theme-textSecondary hover:bg-theme-surface transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>新增标签</span>
                </button>
              </div>

              {tags.length === 0 ? (
                <p className="text-xs text-gray-500 dark:text-gray-400">暂未添加标签，可用于展示阶段特性或关键词。</p>
              ) : (
                <div className="space-y-2">
                  {tags.map((tag, tagIndex) => (
                    <div key={tagIndex} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        type="text"
                        value={tag.label}
                        onChange={(e) => handleTagLabelChange(tagIndex, e.target.value)}
                        placeholder={`标签 ${tagIndex + 1}`}
                        className="flex-1 min-w-[80px] px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded theme-input"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleTagHighlight(tagIndex)}
                          className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                            tag.highlighted
                              ? 'bg-tech-accent text-white border-transparent shadow'
                              : 'bg-theme-surfaceAlt text-theme-textSecondary border-theme-divider'
                          }`}
                        >
                          {tag.highlighted ? '💡' : '高亮'}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeTag(tagIndex)}
                          className="inline-flex items-center px-2 py-1 text-xs text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default CyberTimelineEditor
