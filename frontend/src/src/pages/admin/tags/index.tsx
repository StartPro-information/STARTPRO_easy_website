import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import AdminLayout from '@/components/AdminLayout'
import { tagsApi } from '@/utils/api'
import type { Tag } from '@/types'
import { Plus, Trash2, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TagManagementPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchTags = async () => {
    try {
      setIsLoading(true)
      const response = await tagsApi.getAll()
      if (response.success) {
        setTags(response.data || [])
      } else {
        toast.error(response.message || '获取标签失败')
      }
    } catch (error) {
      console.error('获取标签失败:', error)
      toast.error('获取标签失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTags()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个标签吗？删除后与页面的关联也会移除。')) return
    try {
      const response = await tagsApi.delete(id)
      if (response.success) {
        toast.success('标签删除成功')
        fetchTags()
      } else {
        toast.error(response.message || '删除失败')
      }
    } catch (error) {
      console.error('删除标签失败:', error)
      toast.error('删除标签失败，请稍后重试')
    }
  }

  return (
    <AdminLayout title="标签管理" description="管理页面分类标签，支持新增和删除">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">标签管理</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">创建、查看和删除页面标签</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button
              onClick={fetchTags}
              className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新
            </button>
            <Link href="/admin/tags/create" className="inline-flex items-center btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              新建标签
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-tech-light rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tech-accent"></div>
            </div>
          ) : tags.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">暂无标签</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">创建标签以便页面筛选和分类</p>
              <Link href="/admin/tags/create" className="btn-primary inline-flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                创建标签
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {tags.map((tag, index) => (
                <motion.div
                  key={tag.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/40"
                >
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{tag.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 break-all">Slug: {tag.id || (tag as any).slug || ''}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href="/admin/tags/create"
                      className="text-sm text-tech-accent hover:text-tech-accent-dark"
                    >
                      编辑/新增
                    </Link>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      删除
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
