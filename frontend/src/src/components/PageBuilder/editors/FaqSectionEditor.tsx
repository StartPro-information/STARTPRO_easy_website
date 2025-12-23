import React from 'react'
import { Plus, Trash2 } from 'lucide-react'

interface FaqSectionEditorProps {
  faqs: any[]
  onAdd: () => void
  onChange: (index: number, fieldKey: string, value: any) => void
  onRemove: (index: number) => void
}

const FaqSectionEditor: React.FC<FaqSectionEditorProps> = ({ faqs, onAdd, onChange, onRemove }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 dark:text-white">FAQ 列表</h4>
        <button
          onClick={onAdd}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-tech-accent text-white rounded-lg hover:bg-tech-secondary transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>新增问题</span>
        </button>
      </div>

      {faqs.map((faq: any, index: number) => (
        <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              问题 {index + 1}
            </span>
            <button
              onClick={() => onRemove(index)}
              className="p-1 text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
          <input
            type="text"
            value={faq.question || ''}
            onChange={(e) => onChange(index, 'question', e.target.value)}
            placeholder="请输入问题"
            className="w-full px-2 py-1 text-sm rounded theme-input"
          />
          <textarea
            value={faq.answer || ''}
            onChange={(e) => onChange(index, 'answer', e.target.value)}
            placeholder="请输入答案"
            rows={3}
            className="w-full px-2 py-1 text-sm rounded theme-input resize-none"
          />
        </div>
      ))}
    </div>
  )
}

export default FaqSectionEditor
