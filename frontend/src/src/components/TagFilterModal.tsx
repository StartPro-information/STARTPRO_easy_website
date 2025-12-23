import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface TagFilterModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (selectedTagIds: string[], includeNoTags: boolean) => void
  currentSelectedTags: string[]
  availableTags: Array<{ id: string; name: string }>
  currentIncludeNoTags: boolean
}

export default function TagFilterModal({
  isOpen,
  onClose,
  onApply,
  currentSelectedTags,
  availableTags,
  currentIncludeNoTags
}: TagFilterModalProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(currentSelectedTags)
  const [includeNoTags, setIncludeNoTags] = useState<boolean>(currentIncludeNoTags)

  useEffect(() => {
    if (isOpen) {
      setSelectedTags(currentSelectedTags)
      setIncludeNoTags(currentIncludeNoTags)
    }
  }, [isOpen, currentSelectedTags, currentIncludeNoTags])

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const handleApply = () => {
    onApply(selectedTags, includeNoTags)
    onClose()
  }

  const handleSelectAll = () => {
    setSelectedTags(availableTags.map(tag => tag.id))
  }

  const handleClearAll = () => {
    setSelectedTags([])
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
                筛选标签
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex justify-between mb-4">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-sm text-tech-accent hover:text-tech-accent-dark"
              >
                全选
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                清除
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              {availableTags.length > 0 ? (
                <div className="space-y-1">
                  {availableTags.map(tag => (
                    <label
                      key={tag.id}
                      className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.id)}
                        onChange={() => handleTagToggle(tag.id)}
                        className="w-4 h-4 text-tech-accent border-gray-300 rounded focus:ring-tech-accent"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {tag.name.replace(/^tag_/, '')}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  暂无标签
                </p>
              )}

              {/* 无标签选项 */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                <label className="flex items-center p-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeNoTags}
                    onChange={(e) => setIncludeNoTags(e.target.checked)}
                    className="w-4 h-4 text-tech-accent border-gray-300 rounded focus:ring-tech-accent"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    无标签
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleApply}
              className="btn-primary w-full sm:ml-3 sm:w-auto"
            >
              应用筛选
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