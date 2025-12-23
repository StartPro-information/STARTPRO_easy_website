import React from 'react'
import { Plus, Trash2, Image as ImageIcon, ArrowUpRight } from 'lucide-react'
import { AssetPickerTarget } from '../hooks/useAssetPicker'

interface CyberSuperCardEditorProps {
  cards: any[]
  settings: {
    cardsPerRow: number
    layoutMode: 'default' | 'tight'
    visualMode: 'icon' | 'image'
    alignment: 'left' | 'center' | 'right'
    hoverEffect: boolean
    flowingLight: boolean
    iconFrame: boolean
  }
  onSettingsChange: (key: string, value: any) => void
  onAdd: () => void
  onChange: (index: number, fieldKey: string, value: any) => void
  onRemove: (index: number) => void
  openAssetPicker: (target: AssetPickerTarget, currentValue?: string) => void
  isAssetUrl: (value?: string) => boolean
  isSvgMarkup: (value?: string) => boolean
}

const clampCardsPerRow = (value: number) => Math.min(6, Math.max(1, Number(value) || 1))

type SuperCardTag = { label: string; highlighted: boolean }

const normalizeTags = (tags: any): SuperCardTag[] => {
  if (!tags) return []
  if (Array.isArray(tags)) {
    return tags.map(tag => {
      if (typeof tag === 'string') return { label: tag, highlighted: false }
      if (typeof tag === 'object' && tag !== null) {
        return { label: tag.label || '', highlighted: Boolean(tag.highlighted) }
      }
      return { label: '', highlighted: false }
    })
  }
  if (typeof tags === 'string') {
    return tags
      .split(/[,，、]/)
      .map(part => part.trim())
      .filter(Boolean)
      .map(label => ({ label, highlighted: false }))
  }
  return []
}

const TogglePill: React.FC<{
  active: boolean
  label: string
  onClick: () => void
}> = ({ active, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
      active
        ? 'bg-tech-accent text-white border-tech-accent shadow-sm'
        : 'border-theme-divider text-theme-textSecondary hover:text-white hover:border-tech-accent'
    }`}
  >
    {label}
  </button>
)

const CyberSuperCardEditor: React.FC<CyberSuperCardEditorProps> = ({
  cards,
  settings,
  onSettingsChange,
  onAdd,
  onChange,
  onRemove,
  openAssetPicker,
  isAssetUrl,
  isSvgMarkup
}) => {
  const { cardsPerRow, layoutMode, visualMode, alignment } = settings

  const handleTagChange = (cardIndex: number, tags: SuperCardTag[]) => {
    onChange(cardIndex, 'tags', tags)
  }

  const addTag = (cardIndex: number) => {
    const next = [...normalizeTags(cards[cardIndex]?.tags), { label: '', highlighted: false }]
    handleTagChange(cardIndex, next)
  }

  const updateTagLabel = (cardIndex: number, tagIndex: number, value: string) => {
    const next = normalizeTags(cards[cardIndex]?.tags)
    next[tagIndex] = { ...next[tagIndex], label: value }
    handleTagChange(cardIndex, next)
  }

  const toggleTagHighlight = (cardIndex: number, tagIndex: number) => {
    const next = normalizeTags(cards[cardIndex]?.tags)
    const current = next[tagIndex] || { label: '', highlighted: false }
    next[tagIndex] = { ...current, highlighted: !current.highlighted }
    handleTagChange(cardIndex, next)
  }

  const removeTag = (cardIndex: number, tagIndex: number) => {
    const next = normalizeTags(cards[cardIndex]?.tags)
    next.splice(tagIndex, 1)
    handleTagChange(cardIndex, next)
  }

  return (
    <div className="space-y-6">
      {/* 全局设置 */}
      <section className="p-4 bg-theme-surface rounded-lg border border-theme-divider shadow-sm space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">全局样式设置</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              控制列数、布局、对齐方式以及悬停/流光等效果
            </p>
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded bg-tech-accent text-white hover:bg-tech-secondary"
          >
            <Plus className="w-3 h-3" />
            新增卡片
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">单行卡片数（1-6）</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={6}
                value={clampCardsPerRow(cardsPerRow)}
                onChange={(e) => onSettingsChange('cardsPerRow', clampCardsPerRow(Number(e.target.value)))}
                className="flex-1 accent-tech-accent"
              />
              <span className="text-sm font-semibold text-gray-900 dark:text-white w-6 text-center">
                {clampCardsPerRow(cardsPerRow)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">卡片布局</label>
            <div className="flex flex-wrap gap-2">
              <TogglePill
                active={layoutMode === 'default'}
                label="默认间距"
                onClick={() => onSettingsChange('layoutMode', 'default')}
              />
              <TogglePill
                active={layoutMode === 'tight'}
                label="无边距模式"
                onClick={() => onSettingsChange('layoutMode', 'tight')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">图标模式</label>
            <div className="flex flex-wrap gap-2">
              <TogglePill
                active={visualMode === 'icon'}
                label="图标模式"
                onClick={() => onSettingsChange('visualMode', 'icon')}
              />
              <TogglePill
                active={visualMode === 'image'}
                label="大图模式"
                onClick={() => onSettingsChange('visualMode', 'image')}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 卡片列表 */}
      <div className="space-y-4">
        {cards.length === 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400 border border-dashed border-theme-divider rounded-lg px-4 py-6 text-center">
            还没有赛博卡片，点击上方“新增卡片”开始配置。
          </div>
        )}

        {cards.map((card, index) => {
          const tags = normalizeTags(card.tags)

          return (
            <div key={card.id || index} className="p-4 border border-theme-divider rounded-lg bg-theme-surface shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white">卡片 {index + 1}</h5>
                  <p className="text-xs text-gray-500 dark:text-gray-400">每张卡片都可以设置自己的图标、描述与标签</p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  删除
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">标题</label>
                  <input
                    type="text"
                    value={card.title || ''}
                    onChange={(e) => onChange(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-theme-divider rounded theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                    placeholder="请输入标题"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">描述</label>
                  <textarea
                    value={card.description || ''}
                    onChange={(e) => onChange(index, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-theme-divider rounded theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent resize-none"
                    placeholder="请输入描述"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">链接（可选）</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={card.link || ''}
                      onChange={(e) => onChange(index, 'link', e.target.value)}
                      className="w-full px-3 py-2 border border-theme-divider rounded theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                      placeholder="https://example.com"
                    />
                    {card.link && <ArrowUpRight className="w-4 h-4 text-theme-textSecondary" />}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">图标 / Emoji / SVG</label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <input
                      type="text"
                      value={card.icon || ''}
                      onChange={(e) => onChange(index, 'icon', e.target.value)}
                      className="w-full sm:flex-1 px-3 py-2 border border-theme-divider rounded theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                      placeholder="可以填 emoji、内联 SVG 或素材库 URL"
                    />
                    <button
                      type="button"
                      onClick={() => openAssetPicker({ fieldKey: 'icon', arrayKey: 'cards', arrayIndex: index }, card.icon)}
                      className="flex items-center gap-1 px-3 py-2 text-xs border border-theme-divider bg-theme-surfaceAlt text-theme-textSecondary hover:bg-theme-surface transition-colors sm:flex-none"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>选择素材</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">图标颜色</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="color"
                      value={card.iconColor || '#0ea5e9'}
                      onChange={(e) => onChange(index, 'iconColor', e.target.value)}
                      className="w-12 h-10 border border-theme-divider rounded"
                    />
                    <input
                      type="text"
                      value={card.iconColor || '#0ea5e9'}
                      onChange={(e) => onChange(index, 'iconColor', e.target.value)}
                      className="w-32 px-3 py-2 border border-theme-divider rounded theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                      placeholder="#0ea5e9"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">大图模式下的图片</label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <input
                      type="url"
                      value={card.image || ''}
                      onChange={(e) => onChange(index, 'image', e.target.value)}
                      className="w-full sm:flex-1 px-3 py-2 border border-theme-divider rounded theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                      placeholder="请输入图片 URL"
                    />
                    <button
                      type="button"
                      onClick={() => openAssetPicker({ fieldKey: 'image', arrayKey: 'cards', arrayIndex: index }, card.image)}
                      className="flex items-center gap-1 px-3 py-2 text-xs border border-theme-divider bg-theme-surfaceAlt text-theme-textSecondary hover:bg-theme-surface transition-colors sm:flex-none"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>选择素材</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 标签 */}
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">标签</label>
                  <button
                    type="button"
                    onClick={() => addTag(index)}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-theme-divider text-theme-textSecondary hover:text-white hover:border-tech-accent"
                  >
                    <Plus className="w-3 h-3" />
                    新增标签
                  </button>
                </div>
                <div className="space-y-2">
                  {tags.map((tag, tagIndex) => (
                    <div key={tagIndex} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={tag.label}
                        onChange={(e) => updateTagLabel(index, tagIndex, e.target.value)}
                        className="min-w-[60px] px-2 py-2 border border-theme-divider rounded theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                        placeholder="标签"
                      />
                      <button
                        type="button"
                        onClick={() => toggleTagHighlight(index, tagIndex)}
                        className={`px-2 py-1 text-xs rounded border ${
                          tag.highlighted
                            ? 'bg-tech-accent text-white border-tech-accent'
                            : 'border-theme-divider text-theme-textSecondary'
                        }`}
                      >
                        高亮
                      </button>
                      <button
                        type="button"
                        onClick={() => removeTag(index, tagIndex)}
                        className="p-1 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {tags.length === 0 && (
                    <p className="text-xs text-theme-textSecondary">尚未添加标签，可点击“新增标签”补充。</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CyberSuperCardEditor
