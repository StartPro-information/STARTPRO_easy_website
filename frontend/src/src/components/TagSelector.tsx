import React, { useState, useEffect } from 'react'
import { tagsApi } from '@/utils/api'
import { Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface Tag {
  id: string
  name: string
  slug: string
  description?: string
  page_count?: number
}

interface TagSelectorProps {
  selectedTags?: string[]
  onChange: (tagIds: string[]) => void
  className?: string
}

export default function TagSelector({
  selectedTags = [],
  onChange,
  className = ''
}: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagSlug, setNewTagSlug] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      setIsLoading(true)
      const response = await tagsApi.getAll()
      if (response.success) {
        setTags(response.data)
      } else {
        toast.error(response.message || '获取标签失败')
      }
    } catch (error) {
      console.error('获取标签失败:', error)
      toast.error('获取标签失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim() || !newTagSlug.trim()) {
      toast.error('标签名称和别名不能为空')
      return
    }

    try {
      const response = await tagsApi.create({
        name: newTagName.trim(),
        slug: newTagSlug.trim()
      })

      if (response.success) {
        toast.success('标签创建成功')
        setNewTagName('')
        setNewTagSlug('')
        setIsCreating(false)
        fetchTags()
      } else {
        toast.error(response.message || '创建标签失败')
      }
    } catch (error) {
      console.error('创建标签失败:', error)
      toast.error('创建标签失败')
    }
  }

  const handleTagToggle = (tagId: string) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId]

    onChange(newSelectedTags)
  }

  const handleDeleteTag = async (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation()

    if (!confirm('确定要删除这个标签吗？此操作无法撤销。')) {
      return
    }

    try {
      const response = await tagsApi.delete(tagId)
      if (response.success) {
        toast.success('标签删除成功')
        fetchTags()
        // 从选中的标签中移除已删除的标签
        onChange(selectedTags.filter(id => id !== tagId))
      } else {
        toast.error(response.message || '删除标签失败')
      }
    } catch (error) {
      console.error('删除标签失败:', error)
      toast.error('删除标签失败')
    }
  }

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedTagObjects = tags.filter(tag => selectedTags.includes(tag.id))


  return (
    <div className={`space-y-3 ${className}`}>
      {/* 已选标签显示 */}
      {selectedTagObjects.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTagObjects.map(tag => (
            <span
              key={tag.id}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
            >
              {tag.name}
              <button
                type="button"
                className="ml-1 inline-flex text-blue-400 hover:text-blue-600"
                onClick={() => handleTagToggle(tag.id)}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 搜索和创建区域 */}
      <div className="space-y-2">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索标签..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-tech-dark text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent"
          />
        </div>

        {!isCreating ? (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <Plus className="w-4 h-4 mr-1" />
            创建新标签
          </button>
        ) : (
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                标签名称 *
              </label>
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-tech-dark text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                placeholder="例如：IT基础架构"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                标签别名 *
              </label>
              <input
                type="text"
                value={newTagSlug}
                onChange={(e) => setNewTagSlug(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-tech-dark text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                placeholder="例如：it-infrastructure"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                用于URL，只能包含字母、数字和连字符
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleCreateTag}
                disabled={!newTagName.trim() || !newTagSlug.trim()}
                className="btn-primary"
              >
                创建标签
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false)
                  setNewTagName('')
                  setNewTagSlug('')
                }}
                className="btn-secondary"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 标签列表 */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-tech-accent mx-auto"></div>
          </div>
        ) : filteredTags.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {searchTerm ? '未找到匹配的标签' : '暂无标签'}
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto">
            {filteredTags.map(tag => (
              <div
                key={tag.id}
                className={`px-3 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                  selectedTags.includes(tag.id) ? 'bg-gray-100 dark:bg-gray-700/50' : ''
                }`}
                onClick={() => handleTagToggle(tag.id)}
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{tag.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{tag.slug}</div>
                </div>
                <div className="flex items-center space-x-2">
                  {tag.page_count !== undefined && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {tag.page_count} {tag.page_count === 1 ? '页面' : '页面'}
                    </span>
                  )}
                  <button
                    onClick={(e) => handleDeleteTag(tag.id, e)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="删除标签"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}