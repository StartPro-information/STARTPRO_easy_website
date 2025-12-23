import React from 'react'
import { Plus, Trash2 } from 'lucide-react'

interface ContactFormEditorProps {
  fields: any[]
  onAdd: () => void
  onChange: (index: number, fieldKey: string, value: any) => void
  onRemove: (index: number) => void
}

const ContactFormEditor: React.FC<ContactFormEditorProps> = ({ fields, onAdd, onChange, onRemove }) => (
  <div className="mb-6">
    <div className="flex items-center justify-between mb-3">
      <h4 className="font-medium text-gray-900 dark:text-white">表单字段</h4>
      <button
        onClick={onAdd}
        className="flex items-center space-x-1 px-3 py-1 text-sm bg-tech-accent text-white rounded-lg hover:bg-tech-secondary transition-colors"
      >
        <Plus className="w-3 h-3" />
        <span>新增字段</span>
      </button>
    </div>

    {fields.map((field: any, index: number) => (
      <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg space-y-2 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            字段 {index + 1}
          </span>
          <button onClick={() => onRemove(index)} className="p-1 text-red-500 hover:text-red-700">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={field.name || ''}
            onChange={(e) => onChange(index, 'name', e.target.value)}
            placeholder="字段名称"
            className="px-2 py-1 text-sm rounded theme-input"
          />
          <input
            type="text"
            value={field.label || ''}
            onChange={(e) => onChange(index, 'label', e.target.value)}
            placeholder="字段标签"
            className="px-2 py-1 text-sm rounded theme-input"
          />
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={field.type || 'text'}
            onChange={(e) => onChange(index, 'type', e.target.value)}
            className="flex-1 px-2 py-1 text-sm rounded theme-input"
          >
            <option value="text">文本</option>
            <option value="email">邮箱</option>
            <option value="tel">电话</option>
            <option value="textarea">多行文本</option>
            <option value="select">下拉选择</option>
          </select>
          <label className="flex items-center space-x-1">
            <input
              type="checkbox"
              checked={field.required || false}
              onChange={(e) => onChange(index, 'required', e.target.checked)}
              className="w-3 h-3 text-tech-accent border-gray-300 rounded focus:ring-tech-accent"
            />
            <span className="text-xs text-gray-700 dark:text-gray-300">必填</span>
          </label>
        </div>
      </div>
    ))}
  </div>
)

export default ContactFormEditor
