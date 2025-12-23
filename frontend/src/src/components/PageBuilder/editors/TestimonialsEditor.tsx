import React from 'react'
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import { AssetPickerTarget } from '../hooks/useAssetPicker'

interface TestimonialsEditorProps {
  testimonials: any[]
  onAdd: () => void
  onChange: (index: number, fieldKey: string, value: any) => void
  onRemove: (index: number) => void
  openAssetPicker: (target: AssetPickerTarget, currentValue?: string) => void
}

const TestimonialsEditor: React.FC<TestimonialsEditorProps> = ({
  testimonials,
  onAdd,
  onChange,
  onRemove,
  openAssetPicker
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 dark:text-white">客户评价</h4>
        <button
          onClick={onAdd}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-tech-accent text-white rounded-lg hover:bg-tech-secondary transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>新增评价</span>
        </button>
      </div>

      {testimonials.map((testimonial: any, index: number) => (
        <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">评价 {index + 1}</span>
            <button onClick={() => onRemove(index)} className="p-1 text-red-500 hover:text-red-700">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={testimonial.name || ''}
              onChange={(e) => onChange(index, 'name', e.target.value)}
              placeholder="客户姓名"
              className="px-2 py-1 text-sm rounded theme-input"
            />
            <input
              type="text"
              value={testimonial.role || ''}
              onChange={(e) => onChange(index, 'role', e.target.value)}
              placeholder="职位/公司"
              className="px-2 py-1 text-sm rounded theme-input"
            />
          </div>
          <textarea
            value={testimonial.content || ''}
            onChange={(e) => onChange(index, 'content', e.target.value)}
            placeholder="评价内容"
            rows={3}
            className="w-full px-2 py-1 text-sm rounded theme-input resize-none"
          />
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <label className="text-xs text-gray-700 dark:text-gray-300">评分</label>
              <select
                value={testimonial.rating || 5}
                onChange={(e) => onChange(index, 'rating', parseInt(e.target.value))}
                className="px-2 py-1 text-sm rounded theme-input"
              >
                <option value={5}>5 星</option>
                <option value={4}>4 星</option>
                <option value={3}>3 星</option>
                <option value={2}>2 星</option>
                <option value={1}>1 星</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">客户头像</label>
              <input
                type="url"
                value={testimonial.avatar || ''}
                onChange={(e) => onChange(index, 'avatar', e.target.value)}
                placeholder="头像 URL"
                className="w-full px-2 py-1 text-sm rounded theme-input"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openAssetPicker({ fieldKey: 'avatar', arrayKey: 'testimonials', arrayIndex: index }, testimonial.avatar)}
                  className="flex items-center space-x-1 px-3 py-1 text-sm rounded border border-theme-divider bg-theme-surfaceAlt text-theme-textSecondary hover:bg-theme-surface transition-colors"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>选择资源</span>
                </button>
              </div>
              {testimonial.avatar && (
                <div className="mt-2">
                  <img
                    key={`${testimonial.avatar}-${index}`}
                    src={testimonial.avatar}
                    alt="头像预览"
                    className="w-16 h-16 object-cover rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default TestimonialsEditor
