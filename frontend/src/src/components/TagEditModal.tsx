import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface TagEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (selectedTagIds: string[]) => void
  initialSelectedTags: string[]
  availableTags: Array<{ id: string; name: string }>
}

export default function TagEditModal({
  isOpen,
  onClose,
  onSave,
  initialSelectedTags,
  availableTags
}: TagEditModalProps) {
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  // 标准化标签ID（移除tag_前缀）
  const normalizeTagId = (tagId: string): string => {
    if (!tagId) return ''
    const idStr = String(tagId)
    return idStr.replace(/^tag_/, '')
  }

  // 检查标签是否匹配（处理两种可能的ID格式）
  const isTagMatch = (initialTagId: string, availableTagId: string): boolean => {
    const normalizedInitial = normalizeTagId(initialTagId)
    const normalizedAvailable = normalizeTagId(availableTagId)
    return normalizedInitial === normalizedAvailable
  }

  // 当弹窗打开时，初始化选中的标签
  useEffect(() => {
    if (isOpen) {
      // 找到所有匹配的可用标签ID
      const matchedTagIds = availableTags
        .filter(availableTag =>
          initialSelectedTags.some(initialTag =>
            isTagMatch(initialTag, availableTag.id)
          )
        )
        .map(tag => tag.id)

      setSelectedTagIds(matchedTagIds)
    }
  }, [isOpen, initialSelectedTags, availableTags])

  const handleCheckboxChange = (tagId: string, checked: boolean) => {
    if (checked) {
      setSelectedTagIds(prev => [...prev, tagId])
    } else {
      setSelectedTagIds(prev => prev.filter(id => id !== tagId))
    }
  }

  const handleSave = () => {
    // 保存时添加tag_前缀以匹配后端期望的格式
    const tagsToSave = selectedTagIds.map(id => `tag_${id}`)
    onSave(tagsToSave)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                编辑页面标签
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              {availableTags.length > 0 ? (
                <div className="space-y-1">
                  {availableTags.map(tag => {
                    const isChecked = selectedTagIds.includes(tag.id)

                    return (
                      <label
                        key={tag.id}
                        className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleCheckboxChange(tag.id, e.target.checked)}
                          className="w-4 h-4 text-tech-accent border-gray-300 rounded focus:ring-tech-accent"
                        />
                        <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                          {tag.name.replace(/^tag_/, '')}
                        </span>
                      </label>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  暂无标签
                </p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSave}
              className="btn-primary w-full sm:ml-3 sm:w-auto"
            >
              保存
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 btn-secondary w-full sm:mt-0 sm:w-auto"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}