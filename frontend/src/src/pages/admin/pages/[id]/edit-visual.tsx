import React from 'react'
import { useRouter } from 'next/router'
import { pagesApi } from '@/utils/api'
import toast from 'react-hot-toast'
import VisualPageEditor from '@/components/PageBuilder/VisualPageEditor'

export default function EditVisualPage() {
  const router = useRouter()
  const { id } = router.query

  const handleSaveVisual = async (pageData: any) => {
    if (!id || typeof id !== 'string') return

    try {
      // 将组件数据保存到 template_data 字段
      const formData = {
        ...pageData,
        template_data: JSON.stringify({
          components: pageData.components,
          template_id: pageData.template_id || null,
          theme_id: pageData.theme_id || 'tech-blue'
        })
      }
      
      delete formData.components // 移除临时字段
      delete formData.theme_id // 移除临时字段，已保存在template_data中

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
    router.push(`/admin/pages/${id}`)
  }

  // 创建新页面时使用空白初始数据
  const editorInitialData = {
    title: '',
    slug: '',
    content: '',
    published: false,
    category: 'general',
    components: [],
    theme_id: 'tech-blue',
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