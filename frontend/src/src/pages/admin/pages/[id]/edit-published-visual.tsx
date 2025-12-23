import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/AdminLayout'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Loader,
  AlertCircle
} from 'lucide-react'
import VisualPageEditor from '@/components/PageBuilder/VisualPageEditor'
import { pagesApi } from '@/utils/api'
import toast from 'react-hot-toast'
import type { PageContent } from '@/types'

export default function EditPublishedVisualPage() {
  const router = useRouter()
  const { id } = router.query
  const [isLoading, setIsLoading] = useState(true)
  const [pageData, setPageData] = useState<PageContent | null>(null)
  const [components, setComponents] = useState<any[]>([])

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchPage(id)
    }
  }, [id])

  const fetchPage = async (pageId: string) => {
    try {
      setIsLoading(true)
      
      // 并行获取页面数据和组件数据
      const [pageResponse, componentsResponse] = await Promise.all([
        pagesApi.getById(pageId),
        pagesApi.getComponents(pageId)
      ])
      
      if (pageResponse.success) {
        const page = pageResponse.data
        setPageData(page)
        
        // 设置组件数据
        if (componentsResponse.success) {
          setComponents(componentsResponse.data || [])
        }
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

  const handleSaveVisual = async (pageData: any) => {
    if (!id || typeof id !== 'string') return

    try {
      // 准备要保存的数据
      const formData = {
        ...pageData,
        // 将组件数据保存到 template_data 字段
        template_data: JSON.stringify({
          components: pageData.components,
          template_id: pageData.template_id || null,
          theme_id: pageData.theme_id || 'tech-blue'
        })
      }
      
      // 移除临时字段，已保存在template_data中
      delete formData.components
      delete formData.theme_id

      const response = await pagesApi.update(id, formData)
      
      if (response.success) {
        toast.success('页面更新成功')
        router.push('/admin/pages')
      } else {
        toast.error(response.message || '更新失败')
      }
    } catch (error) {
      console.error('更新页面失败:', error)
      toast.error('更新失败，请稍后重试')
    }
  }

  const handleCancel = () => {
    router.push('/admin/pages')
  }

  if (isLoading) {
    return (
      <AdminLayout title="加载中" description="正在加载页面数据...">
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
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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

  // 为已发布页面创建的编辑器初始数据
  const editorInitialData = {
    ...pageData,
    components: components,
    theme_id: 'dark-elegant', // 使用页面实际的主题
    template_id: null
  };

  return (
    <VisualPageEditor
      initialData={editorInitialData}
      editMode="edit" // 设置为编辑模式
      onSave={handleSaveVisual}
      onCancel={handleCancel}
    />
  )
}
