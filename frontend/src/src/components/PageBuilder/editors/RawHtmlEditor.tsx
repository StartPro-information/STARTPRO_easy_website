import React from 'react'
import { TemplateComponent } from '@/types/templates'

interface RawHtmlEditorProps {
  component: TemplateComponent
  formData: any
  handleFieldChange: (key: string, value: any) => void
}

const RawHtmlEditor: React.FC<RawHtmlEditorProps> = ({ component, formData, handleFieldChange }) => {
  if ((component as any).type !== 'raw-html') return null

  const baseClass = formData.className || 'raw-html-block'
  const uniqueClass = `${baseClass}-${component.id || 'instance'}`

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-theme-textPrimary mb-2">容器类名（用于样式隔离）</label>
        <input
          type="text"
          value={baseClass}
          onChange={(e) => handleFieldChange('className', e.target.value)}
          className="w-full px-3 py-2 theme-input border border-theme-divider bg-theme-surfaceAlt focus:ring-2 focus:ring-tech-accent focus:border-transparent"
          placeholder="例如：raw-html-block"
        />
        <p className="text-xs text-theme-textSecondary mt-1">
          实际渲染类名：<code>{uniqueClass}</code>（会自动附加组件ID，避免多个实例冲突）
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-theme-textPrimary mb-2">HTML 内容</label>
        <textarea
          value={formData.html || ''}
          onChange={(e) => handleFieldChange('html', e.target.value)}
          rows={10}
          className="w-full px-3 py-2 theme-input border border-theme-divider bg-theme-surfaceAlt focus:ring-2 focus:ring-tech-accent focus:border-transparent font-mono text-sm"
          placeholder="<section class='raw-html-block'>...</section>"
        />
        <p className="text-xs text-theme-textSecondary mt-1">
          请仅粘贴可信内容。避免全局选择器，样式请限定在容器类名内。
        </p>
      </div>
    </div>
  )
}

export default RawHtmlEditor
