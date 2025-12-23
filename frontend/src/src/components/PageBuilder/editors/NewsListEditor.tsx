import React from 'react'
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import { AssetPickerTarget } from '../hooks/useAssetPicker'

interface NewsListEditorProps {
  articles: any[]
  onAdd: () => void
  onChange: (index: number, key: string, value: any) => void
  onBatchChange?: (index: number, patch: Record<string, any>) => void
  onRemove: (index: number) => void
  openAssetPicker: (target: AssetPickerTarget, currentValue?: string) => void
  cardsPerRow?: number | string
  onCardsPerRowChange?: (value: any) => void
}

const NewsListEditor: React.FC<NewsListEditorProps> = ({
  articles,
  onAdd,
  onChange,
  onBatchChange,
  onRemove,
  openAssetPicker,
  cardsPerRow,
  onCardsPerRowChange
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h4 className="font-medium text-gray-900 dark:text-white">新闻列表</h4>
        <button
          onClick={onAdd}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-tech-accent text-white rounded-lg hover:bg-tech-secondary transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>新增新闻</span>
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
        </div>
      )}

      <div className="space-y-4">
        {(articles || []).map((article: any, index: number) => (
          <div key={index} className="border border-theme-divider rounded-lg p-4 bg-theme-surface shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate">新闻 {index + 1}</div>
              <button
                onClick={() => onRemove(index)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="删除此新闻"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">标题</label>
                <input
                  type="text"
                  value={article.title || ''}
                  onChange={(e) => onChange(index, 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-theme-divider rounded-lg  theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                  placeholder="新闻标题"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">日期</label>
                <input
                  type="text"
                  value={article.date || ''}
                  onChange={(e) => onChange(index, 'date', e.target.value)}
                  className="w-full px-3 py-2 border border-theme-divider rounded-lg  theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                  placeholder="2024-01-01 或 1月1日"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">摘要</label>
              <textarea
                value={article.summary || article.excerpt || ''}
                onChange={(e) => {
                  const value = e.target.value
                  if (onBatchChange) {
                    onBatchChange(index, { summary: value, excerpt: value })
                  } else {
                    onChange(index, 'summary', value)
                    onChange(index, 'excerpt', value)
                  }
                }}
                rows={3}
                className="w-full px-3 py-2 border border-theme-divider rounded-lg  theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent resize-none"
                placeholder="请输入新闻摘要"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">阅读全文链接</label>
              <input
                type="url"
                value={article.link || ''}
                onChange={(e) => onChange(index, 'link', e.target.value)}
                className="w-full px-3 py-2 border border-theme-divider rounded-lg  theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                placeholder="/news/detail 或 https://example.com/news"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">图片或图标</label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <input
                  type="text"
                  value={article.image || ''}
                  onChange={(e) => onChange(index, 'image', e.target.value)}
                  className="w-full px-3 py-2 border border-theme-divider rounded-lg  theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent sm:flex-1"
                  placeholder="图片 URL，留空使用图标"
                />
                <button
                  type="button"
                  onClick={() => openAssetPicker({ arrayKey: 'articles', arrayIndex: index, fieldKey: 'image' }, article.image)}
                  className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg border border-theme-divider bg-theme-surfaceAlt text-theme-textSecondary hover:bg-theme-surface transition-colors sm:flex-none"
                  title="选择图片"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span className="text-sm">选择图片</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">支持上传图片；无图片可在下方填写图标</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">备用图标（可选）</label>
              <input
                type="text"
                value={article.icon || ''}
                onChange={(e) => onChange(index, 'icon', e.target.value)}
                className="w-full px-3 py-2 border border-theme-divider rounded-lg  theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                placeholder="如 ✉️ 或 <svg>…</svg>"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NewsListEditor
