import React from 'react'

interface CyberEffectsEditorProps {
  settings: {
    alignment?: 'left' | 'center' | 'right'
    hoverEffect?: boolean
    flowingLight?: boolean
    iconFrame?: boolean
  }
  onChange: (key: string, value: any) => void
}

export const CyberEffectsEditor: React.FC<CyberEffectsEditorProps> = ({ settings, onChange }) => {
  const { alignment = 'left', hoverEffect = true, flowingLight = true, iconFrame = true } = settings

  return (
    <div className="mb-6 bg-theme-surface p-4 space-y-4">
      <div>
        <h4 className="font-medium text-theme-textPrimary">赛博特效与对齐</h4>
        <p className="text-xs text-theme-textSecondary">控制对齐、悬停、高亮和图标框线等效果</p>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-theme-textPrimary">对齐方式</label>
        <div className="flex flex-wrap gap-2">
          {[
            { label: '左对齐', value: 'left' },
            { label: '居中', value: 'center' },
            { label: '右对齐', value: 'right' }
          ].map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange('alignment', option.value)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                alignment === option.value
                  ? 'bg-tech-accent text-white border-tech-accent'
                  : 'border-theme-divider text-theme-textSecondary hover:text-white hover:border-tech-accent'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-theme-textPrimary">效果开关</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'hoverEffect', label: '悬停特效', value: hoverEffect },
            { key: 'flowingLight', label: '流光效果', value: flowingLight },
            { key: 'iconFrame', label: '图标边框', value: iconFrame }
          ].map(item => (
            <label key={item.key} className="flex items-center gap-2 text-sm text-theme-textPrimary">
              <input
                type="checkbox"
                checked={item.value !== false}
                onChange={(e) => onChange(item.key, e.target.checked)}
                className="rounded border-theme-divider text-tech-accent focus:ring-tech-accent"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
