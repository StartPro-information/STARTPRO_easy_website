import React from 'react'
import { Plus, Trash2 } from 'lucide-react'

interface PricingCardsEditorProps {
  cards: any[]
  onAdd: () => void
  onChange: (index: number, key: string, value: any) => void
  onRemove: (index: number) => void
  cardsPerRow?: number | string
  onCardsPerRowChange?: (value: any) => void
}

const PricingCardsEditor: React.FC<PricingCardsEditorProps> = ({
  cards,
  onAdd,
  onChange,
  onRemove,
  cardsPerRow,
  onCardsPerRowChange
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 dark:text-white">价格卡片</h4>
        <button
          onClick={onAdd}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-tech-accent text-white rounded-lg hover:bg-tech-secondary transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>新增方案</span>
        </button>
      </div>

      {onCardsPerRowChange && (
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
      )}

      {(cards || []).map((plan: any, index: number) => (
        <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3 mb-3 bg-theme-surface">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">方案 {index + 1}</span>
            <button onClick={() => onRemove(index)} className="p-1 text-red-500 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs text-gray-600 dark:text-gray-300">名称</label>
              <input
                type="text"
                value={plan.name || ''}
                onChange={(e) => onChange(index, 'name', e.target.value)}
                className="w-full px-3 py-2 border border-theme-divider rounded theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-600 dark:text-gray-300">价格</label>
              <input
                type="text"
                value={plan.price || ''}
                onChange={(e) => onChange(index, 'price', e.target.value)}
                className="w-full px-3 py-2 border border-theme-divider rounded theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-600 dark:text-gray-300">周期</label>
              <input
                type="text"
                value={plan.period || ''}
                onChange={(e) => onChange(index, 'period', e.target.value)}
                className="w-full px-3 py-2 border border-theme-divider rounded theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                placeholder="月 / 年 等"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-600 dark:text-gray-300">链接</label>
              <input
                type="text"
                value={plan.link || ''}
                onChange={(e) => onChange(index, 'link', e.target.value)}
                className="w-full px-3 py-2 border border-theme-divider rounded theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-600 dark:text-gray-300">推荐标记</label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={plan.recommended === true}
                onChange={(e) => onChange(index, 'recommended', e.target.checked)}
                className="rounded border-theme-divider text-tech-accent focus:ring-tech-accent"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">将此方案标记为推荐</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-600 dark:text-gray-300">功能列表（用换行分隔）</label>
            <textarea
              value={(plan.features || []).join('\n')}
              onChange={(e) => onChange(index, 'features', e.target.value.split('\n').filter(Boolean))}
              rows={4}
              className="w-full px-3 py-2 border border-theme-divider rounded theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent resize-none"
              placeholder="功能1\n功能2\n功能3"
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default PricingCardsEditor
