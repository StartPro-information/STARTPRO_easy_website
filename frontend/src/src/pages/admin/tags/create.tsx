import React, { useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { motion } from 'framer-motion'
import { Plus, X, Save, ArrowLeft } from 'lucide-react'
import { tagsApi } from '@/utils/api'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function CreateTagPage() {
  const [tagName, setTagName] = useState('')
  const [tagSlug, setTagSlug] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!tagName.trim() || !tagSlug.trim()) {
      toast.error('标签名称和别名不能为空')
      return
    }

    setIsLoading(true)
    try {
      const response = await tagsApi.create({
        name: tagName.trim(),
        slug: tagSlug.trim()
      })

      if (response.success) {
        toast.success('标签创建成功')
        // 重置表单
        setTagName('')
        setTagSlug('')
        // 可以考虑重定向到标签列表或保持在创建页面
      } else {
        toast.error(response.message || '创建失败')
      }
    } catch (error) {
      console.error('创建标签失败:', error)
      toast.error('创建失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminLayout title="创建分类标签" description="创建新的内容分类标签">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-6 py-12">
          {/* 返回按钮 */}
          <div className="mb-8">
            <Link
              href="/admin/pages"
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回页面管理</span>
            </Link>
          </div>

          {/* 页面标题 */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-2xl px-6 py-3 shadow-lg mb-6"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  创建新分类标签
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  为页面内容创建分类标签
                </p>
              </div>
            </motion.div>
          </div>

          {/* 创建表单 */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    标签名称 *
                  </label>
                  <input
                    type="text"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例如：IT基础架构"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    标签别名 *
                  </label>
                  <input
                    type="text"
                    value={tagSlug}
                    onChange={(e) => setTagSlug(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例如：it-infrastructure"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    用于URL，只能包含字母、数字和连字符
                  </p>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Link
                    href="/admin/pages"
                    className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    取消
                  </Link>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 ${
                      isLoading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        创建中...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Save className="w-4 h-4 mr-2" />
                        创建标签
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}