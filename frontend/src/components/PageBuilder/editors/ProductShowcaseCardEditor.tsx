import React from 'react'
import { CustomEditorProps } from './editorRenderers'
import { AssetPickerTarget } from '../hooks/useAssetPicker'

type Props = Pick<
  CustomEditorProps,
  'formData' | 'handleFieldChange' | 'handleArrayFieldChange' | 'addArrayItem' | 'removeArrayItem' | 'openAssetPickerWithValue'
>

const ProductShowcaseCardEditor: React.FC<Props> = ({
  formData,
  handleFieldChange,
  handleArrayFieldChange,
  addArrayItem,
  removeArrayItem,
  openAssetPickerWithValue
}) => {
  const cards = Array.isArray(formData.cards) ? formData.cards : []

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-theme-textPrimary">每行卡片数</label>
        <div className="flex items-center space-x-3">
          <input
            type="range"
            min={1}
            max={6}
            value={parseInt(String(formData.cardsPerRow || 3), 10)}
            onChange={(e) => handleFieldChange('cardsPerRow', e.target.value)}
            className="flex-1 h-2 bg-theme-surfaceAlt rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm text-theme-textSecondary w-6 text-center">
            {parseInt(String(formData.cardsPerRow || 3), 10)}
          </span>
        </div>
        <p className="text-xs text-theme-textSecondary">参照功能网格，支持 1-6 列，自动适配响应式。</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-theme-textPrimary">卡片列表</h4>
            <p className="text-xs text-theme-textSecondary">组件无总标题，仅渲染卡片内容。</p>
          </div>
          <button
            type="button"
            onClick={() =>
              addArrayItem('cards', {
                eyebrow: '新品',
                title: '产品标题',
                subtitle: '一句话卖点描述',
                badgeText: '',
                image: '',
                primaryButtonText: '了解更多',
                primaryButtonLink: '#',
                secondaryButtonText: '购买',
                secondaryButtonLink: '#'
              })
            }
            className="px-3 py-2 text-sm rounded border border-theme-divider bg-theme-surfaceAlt hover:bg-theme-surface text-theme-textPrimary"
          >
            新增卡片
          </button>
        </div>

        {cards.length === 0 && (
          <p className="text-sm text-theme-textSecondary">目前还没有卡片，可点击“新增卡片”添加。</p>
        )}

        {cards.map((card: any, index: number) => (
          <div key={index} className="p-4 rounded-xl border border-theme-divider bg-theme-surfaceAlt space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-theme-textPrimary">卡片 {index + 1}</span>
              <button
                type="button"
                onClick={() => removeArrayItem('cards', index)}
                className="text-xs text-red-500 hover:underline"
              >
                删除
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="block text-sm text-theme-textPrimary">顶部标签</label>
                <input
                  type="text"
                  value={card.eyebrow || ''}
                  onChange={(e) => handleArrayFieldChange('cards', index, 'eyebrow', e.target.value)}
                  className="w-full px-3 py-2 border border-theme-divider bg-theme-surfaceAlt theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                  placeholder="新品 / 限时 / 推荐"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-theme-textPrimary">补充说明</label>
                <input
                  type="text"
                  value={card.badgeText || ''}
                  onChange={(e) => handleArrayFieldChange('cards', index, 'badgeText', e.target.value)}
                  className="w-full px-3 py-2 border border-theme-divider bg-theme-surfaceAlt theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                  placeholder="可选：补充一行卖点"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-theme-textPrimary">标题</label>
              <input
                type="text"
                value={card.title || ''}
                onChange={(e) => handleArrayFieldChange('cards', index, 'title', e.target.value)}
                className="w-full px-3 py-2 border border-theme-divider bg-theme-surfaceAlt theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                placeholder="产品名称"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-theme-textPrimary">副标题</label>
              <textarea
                value={card.subtitle || ''}
                onChange={(e) => handleArrayFieldChange('cards', index, 'subtitle', e.target.value)}
                className="w-full px-3 py-2 border border-theme-divider bg-theme-surfaceAlt theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent resize-none"
                rows={3}
                placeholder="一句话描述或卖点"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-theme-textPrimary">产品图片</label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <input
                  type="url"
                  value={card.image || ''}
                  onChange={(e) => handleArrayFieldChange('cards', index, 'image', e.target.value)}
                  className="w-full px-3 py-2 border border-theme-divider bg-theme-surfaceAlt theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                  placeholder="图片 URL"
                />
                <button
                  type="button"
                  onClick={() =>
                    openAssetPickerWithValue?.(
                      { fieldKey: 'image', arrayKey: 'cards', arrayIndex: index } as AssetPickerTarget,
                      card.image
                    )
                  }
                  className="px-3 py-2 text-xs border border-theme-divider bg-theme-surfaceAlt text-theme-textSecondary hover:bg-theme-surface"
                >
                  选择素材
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="block text-sm text-theme-textPrimary">主按钮文字</label>
                <input
                  type="text"
                  value={card.primaryButtonText || ''}
                  onChange={(e) => handleArrayFieldChange('cards', index, 'primaryButtonText', e.target.value)}
                  className="w-full px-3 py-2 border border-theme-divider bg-theme-surfaceAlt theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                  placeholder="例如：了解更多"
                />
                <input
                  type="url"
                  value={card.primaryButtonLink || ''}
                  onChange={(e) => handleArrayFieldChange('cards', index, 'primaryButtonLink', e.target.value)}
                  className="w-full px-3 py-2 border border-theme-divider bg-theme-surfaceAlt theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                  placeholder="主按钮链接"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-theme-textPrimary">次按钮文字</label>
                <input
                  type="text"
                  value={card.secondaryButtonText || ''}
                  onChange={(e) => handleArrayFieldChange('cards', index, 'secondaryButtonText', e.target.value)}
                  className="w-full px-3 py-2 border border-theme-divider bg-theme-surfaceAlt theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                  placeholder="例如：购买"
                />
                <input
                  type="url"
                  value={card.secondaryButtonLink || ''}
                  onChange={(e) => handleArrayFieldChange('cards', index, 'secondaryButtonLink', e.target.value)}
                  className="w-full px-3 py-2 border border-theme-divider bg-theme-surfaceAlt theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                  placeholder="次按钮链接"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductShowcaseCardEditor
