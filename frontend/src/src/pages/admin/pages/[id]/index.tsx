import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/AdminLayout'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  ArrowLeft,
  Edit,
  Eye,
  EyeOff,
  FileText,
  Calendar,
  User,
  Globe,
  Image,
  Settings,
  Loader,
  ExternalLink
} from 'lucide-react'
import { pagesApi } from '@/utils/api'
import { formatDateTime } from '@/utils'
import toast from 'react-hot-toast'
import type { PageContent } from '@/types'
import { generateHtmlFromComponents } from '@/lib/pageContent/generateHtmlFromComponents'

export default function ViewPagePage() {
  const router = useRouter()
  const { id } = router.query
  const [isLoading, setIsLoading] = useState(true)
  const [pageData, setPageData] = useState<PageContent | null>(null)
  const [showContent, setShowContent] = useState(true)

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchPage(id)
    }
  }, [id])

  const fetchPage = async (pageId: string) => {
    try {
      setIsLoading(true)
      const response = await pagesApi.getById(pageId)
      
      if (response.success) {
        const page = response.data
        let parsedTemplateData = page.template_data
        if (page.template_data && typeof page.template_data === 'string') {
          try {
            parsedTemplateData = JSON.parse(page.template_data)
          } catch (err) {
            parsedTemplateData = null
          }
        }
        setPageData({ ...page, template_data: parsedTemplateData } as PageContent)
      } else {
        toast.error('页面不存在')
        router.push('/admin/pages')
      }
    } catch (error) {
      console.error('获取页面失败:', error)
      toast.error('获取页面失败')
      router.push('/admin/pages')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout title="查看页面" description="正在加载页面数据...">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <Loader className="w-6 h-6 text-tech-accent animate-spin" />
            <span className="text-gray-600 dark:text-gray-400">正在加载页面数据...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!pageData) {
    return (
      <AdminLayout title="页面不存在">
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            页面不存在
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            请检查页面ID是否正确
          </p>
        </div>
      </AdminLayout>
    )
  }

  const generatedContent =
    pageData &&
    (!pageData.content || pageData.content.trim() === '') &&
    (pageData as any)?.template_data?.components &&
    Array.isArray((pageData as any).template_data.components)
      ? generateHtmlFromComponents((pageData as any).template_data.components)
      : null

  return (
    <AdminLayout title={pageData.title} description="查看页面详情">
      <div className="space-y-6">
        {/* 页面头部 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/admin/pages')}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {pageData.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                页面详情信息
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <Link
              href={`/pages/${pageData.slug}`}
              target="_blank"
              className="inline-flex items-center btn-secondary"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              预览页面
            </Link>
            
            {/* 为已发布的页面提供专门的可视化编辑按钮 */}
            <Link
              href={`/admin/pages/${pageData.id}/edit-published-visual`}
              className="inline-flex items-center btn-primary"
            >
              <Edit className="w-4 h-4 mr-2" />
              可视化编辑
            </Link>
            
            <Link
              href={`/admin/pages/${pageData.id}/edit`}
              className="inline-flex items-center btn-secondary"
            >
              <Edit className="w-4 h-4 mr-2" />
              {pageData.template_data ? '传统编辑' : '编辑页面'}
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 主要内容区域 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本信息 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-tech-light rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-tech-accent" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    基本信息
                  </h2>
                </div>
                
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  pageData.published 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                }`}>
                  {pageData.published ? '已发布' : '草稿'}
                </span>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      页面标题
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {pageData.title}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      URL别名
                    </label>
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <code className="text-sm text-tech-accent bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        /{pageData.slug}
                      </code>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      页面分类
                    </label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                      {pageData.category === 'general' ? '一般页面' : 
                       pageData.category === 'product' ? '产品服务' :
                       pageData.category === 'about' ? '关于我们' :
                       pageData.category === 'news' ? '新闻动态' :
                       pageData.category === 'help' ? '帮助中心' :
                       pageData.category === 'legal' ? '法律条款' :
                       pageData.category || '未分类'}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      排序值
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {pageData.sort_order || 0}
                    </p>
                  </div>
                </div>

                {pageData.excerpt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      页面摘要
                    </label>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      {pageData.excerpt}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* 页面内容 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-tech-light rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-tech-accent" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    页面内容
                  </h2>
                </div>
                
                <button
                  onClick={() => setShowContent(!showContent)}
                  className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showContent ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-1" />
                      隐藏内容
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-1" />
                      显示内容
                    </>
                  )}
                </button>
              </div>

              {showContent ? (
                <div className="prose dark:prose-invert max-w-none">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: (generatedContent || pageData.content)?.replace(/\n/g, '<br>') || '暂无内容' 
                    }}
                  />
                </div>
              ) : (
                <div className="text-center py-8">
                  <EyeOff className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">内容已隐藏</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 页面统计 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-tech-light rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <Calendar className="w-5 h-5 text-tech-accent" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  页面信息
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">创建时间</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDateTime(pageData.created_at)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">更新时间</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDateTime(pageData.updated_at)}
                  </span>
                </div>

                {(pageData as any).created_by_name && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">创建者</span>
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {(pageData as any).created_by_name}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* 特色图片 */}
            {pageData.featured_image && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-tech-light rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Image className="w-5 h-5 text-tech-accent" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    特色图片
                  </h3>
                </div>

                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                  <img
                    src={pageData.featured_image}
                    alt={pageData.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/placeholder-image.jpg'
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* SEO信息 */}
            {(pageData.meta_title || pageData.meta_description) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white dark:bg-tech-light rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Settings className="w-5 h-5 text-tech-accent" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    SEO信息
                  </h3>
                </div>

                <div className="space-y-4">
                  {pageData.meta_title && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        SEO标题
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        {pageData.meta_title}
                      </p>
                    </div>
                  )}

                  {pageData.meta_description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        SEO描述
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        {pageData.meta_description}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
