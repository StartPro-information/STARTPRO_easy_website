import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/AdminLayout'
import { motion } from 'framer-motion'
import {
  Save,
  ArrowLeft,
  Eye,
  FileText,
  Image,
  Settings,
  AlertCircle,
  Loader
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { pagesApi } from '@/utils/api'
import type { PageForm, PageContent } from '@/types'
import { generateHtmlFromComponents } from '@/lib/pageContent/generateHtmlFromComponents'

export default function EditPagePage() {
  const router = useRouter()
  const { id } = router.query
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [pageData, setPageData] = useState<PageContent | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors, isDirty }
  } = useForm<PageForm>()

  const watchedContent = watch('content')

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

        const generatedContent =
          (!page.content || page.content.trim() === '') &&
          parsedTemplateData?.components &&
          Array.isArray(parsedTemplateData.components)
            ? generateHtmlFromComponents(parsedTemplateData.components)
            : null

        setPageData({ ...page, template_data: parsedTemplateData } as PageContent)
        
        // 重置表单数据
        reset({
          title: page.title,
          slug: page.slug,
          content: generatedContent || page.content,
          excerpt: page.excerpt || '',
          featured_image: page.featured_image || '',
          meta_title: page.meta_title || '',
          meta_description: page.meta_description || '',
          published: page.published,
          sort_order: page.sort_order || 0
        })
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

  const onSubmit = async (data: PageForm) => {
    if (!id || typeof id !== 'string') return

    setIsSaving(true)

    try {
      const response = await pagesApi.update(id, data)

      if (response.success) {
        toast.success('页面更新成功')
        // 重新获取数据以同步状态
        await fetchPage(id)
      } else {
        toast.error(response.message || '更新失败')
      }
    } catch (error) {
      console.error('更新页面失败:', error)
      toast.error('更新失败，请稍后重试')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveAsDraft = () => {
    setValue('published', false)
    handleSubmit(onSubmit)()
  }

  const handlePublish = () => {
    setValue('published', true)
    handleSubmit(onSubmit)()
  }

  if (isLoading) {
    return (
      <AdminLayout title="编辑页面" description="正在加载页面数据...">
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

  return (
    <AdminLayout title={`编辑页面 - ${pageData.title}`} description="编辑页面内容">
      <div className="space-y-6">
        {/* 页面头部 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                编辑页面
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                修改页面 "{pageData.title}" 的内容
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className="inline-flex items-center btn-secondary"
            >
              <Eye className="w-4 h-4 mr-2" />
              {previewMode ? '编辑' : '预览'}
            </button>
            
            <button
              type="button"
              onClick={handleSaveAsDraft}
              disabled={isSaving || !isDirty}
              className="inline-flex items-center btn-secondary"
            >
              <FileText className="w-4 h-4 mr-2" />
              保存草稿
            </button>
            
            <button
              type="button"
              onClick={handlePublish}
              disabled={isSaving || !isDirty}
              className="inline-flex items-center btn-primary"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? '保存中...' : '保存并发布'}
            </button>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                <div className="flex items-center space-x-3 mb-6">
                  <FileText className="w-5 h-5 text-tech-accent" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    基本信息
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* 标题 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      页面标题 *
                    </label>
                    <input
                      type="text"
                      {...register('title', { required: '请输入页面标题' })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-tech-dark text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                      placeholder="输入页面标题"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
                    )}
                  </div>

                  {/* URL别名 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      URL别名 *
                    </label>
                    <input
                      type="text"
                      {...register('slug', { required: '请输入URL别名' })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-tech-dark text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                      placeholder="url-alias"
                    />
                    {errors.slug && (
                      <p className="mt-1 text-sm text-red-500">{errors.slug.message}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      将用于生成页面URL，如: /pages/your-slug
                    </p>
                  </div>

                  {/* 页面摘要 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      页面摘要
                    </label>
                    <textarea
                      {...register('excerpt')}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-tech-dark text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent resize-none"
                      placeholder="简要描述页面内容，用于搜索结果和页面预览"
                    />
                  </div>

                  {/* 排序值 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      排序值
                    </label>
                    <input
                      type="number"
                      {...register('sort_order', { valueAsNumber: true })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-tech-dark text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                      placeholder="0"
                      min="0"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      数字越小排序越靠前，默认为0
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* 页面内容 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-tech-light rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <FileText className="w-5 h-5 text-tech-accent" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    页面内容
                  </h2>
                </div>

                {previewMode ? (
                  <div className="prose dark:prose-invert max-w-none">
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: watchedContent?.replace(/\n/g, '<br>') || '内容为空' 
                      }}
                    />
                  </div>
                ) : (
                  <textarea
                    {...register('content', { required: '请输入页面内容' })}
                    rows={12}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-tech-dark text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent resize-none font-mono text-sm"
                    placeholder="输入页面内容，支持HTML标签..."
                  />
                )}
                {errors.content && (
                  <p className="mt-1 text-sm text-red-500">{errors.content.message}</p>
                )}
              </motion.div>
            </div>

            {/* 侧边栏 */}
            <div className="space-y-6">
              {/* 发布设置 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-tech-light rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Settings className="w-5 h-5 text-tech-accent" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    发布设置
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('published')}
                      className="w-4 h-4 text-tech-accent border-gray-300 rounded focus:ring-tech-accent"
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      立即发布
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('show_updated_date')}
                      className="w-4 h-4 text-tech-accent border-gray-300 rounded focus:ring-tech-accent"
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      在页面底部显示更新日期
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    取消发布勾选将保存为草稿
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <p>创建时间: {new Date(pageData.created_at).toLocaleString()}</p>
                    <p>更新时间: {new Date(pageData.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>

              {/* 特色图片 */}
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

                <input
                  type="url"
                  {...register('featured_image')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-tech-dark text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  可选：输入图片URL或上传图片
                </p>
              </motion.div>

              {/* SEO设置 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white dark:bg-tech-light rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Settings className="w-5 h-5 text-tech-accent" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    SEO设置
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SEO标题
                    </label>
                    <input
                      type="text"
                      {...register('meta_title')}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-tech-dark text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                      placeholder="自定义SEO标题"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SEO描述
                    </label>
                    <textarea
                      {...register('meta_description')}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-tech-dark text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent resize-none"
                      placeholder="页面的SEO描述"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </form>

        {/* 未保存提示 */}
        {isDirty && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                您有未保存的更改，请记得保存页面。
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  )
}
