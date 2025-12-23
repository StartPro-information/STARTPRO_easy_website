import React from 'react'
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import { AssetPickerTarget } from '../hooks/useAssetPicker'

interface TeamGridEditorProps {
  members: any[]
  onAdd: () => void
  onChange: (index: number, key: string, value: any) => void
  onRemove: (index: number) => void
  openAssetPicker: (target: AssetPickerTarget, currentValue?: string) => void
}

const TeamGridEditor: React.FC<TeamGridEditorProps> = ({
  members,
  onAdd,
  onChange,
  onRemove,
  openAssetPicker
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 dark:text-white">团队成员</h4>
        <button
          onClick={onAdd}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-tech-accent text-white rounded-lg hover:bg-tech-secondary transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>新增成员</span>
        </button>
      </div>

      <div className="space-y-4">
        {(members || []).map((member: any, index: number) => (
          <div key={index} className="p-4 border border-theme-divider rounded-lg bg-theme-surface shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate">成员 {index + 1}</div>
              <button
                onClick={() => onRemove(index)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="删除成员"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">姓名</label>
                <input
                  type="text"
                  value={member.name || ''}
                  onChange={(e) => onChange(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-theme-divider rounded  theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                  placeholder="成员姓名"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">职位</label>
                <input
                  type="text"
                  value={member.role || ''}
                  onChange={(e) => onChange(index, 'role', e.target.value)}
                  className="w-full px-3 py-2 border border-theme-divider rounded  theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                  placeholder="成员职位"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">简介</label>
              <textarea
                value={member.bio || ''}
                onChange={(e) => onChange(index, 'bio', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-theme-divider rounded  theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent resize-none"
                placeholder="个人简介"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">头像</label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <input
                  type="text"
                  value={member.avatar || ''}
                  onChange={(e) => onChange(index, 'avatar', e.target.value)}
                  className="w-full sm:flex-1 px-3 py-2 border border-theme-divider rounded  theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                  placeholder="头像 URL，可从素材库选择"
                />
                <button
                  type="button"
                  onClick={() => openAssetPicker({ fieldKey: 'avatar', arrayKey: 'members', arrayIndex: index }, member.avatar)}
                  className="flex items-center gap-1 px-3 py-2 text-xs rounded border border-theme-divider bg-theme-surfaceAlt text-theme-textSecondary hover:bg-theme-surface transition-colors sm:flex-none"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>选择素材</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TeamGridEditor
