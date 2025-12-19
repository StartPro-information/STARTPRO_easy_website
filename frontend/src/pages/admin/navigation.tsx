import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Link as LinkIcon,
  Save,
  X
} from 'lucide-react'
import { navigationApi, pagesApi } from '@/utils/api'
import { formatDateTime } from '@/utils'
import toast from 'react-hot-toast'
import {
  useForm,
  type FieldErrors,
  type UseFormHandleSubmit,
  type UseFormRegister,
  type UseFormReset,
  type UseFormSetValue,
  type UseFormWatch
} from 'react-hook-form'
import type { NavigationItem, NavigationForm, PageContent } from '@/types'

type NavFormProps = {
  pages: PageContent[]
  navItems: NavigationItem[]
  selectedItem: NavigationItem | null
  title: string
  submitText: string
  onSubmit: (data: NavigationForm) => void
  onCancel: () => void
  register: UseFormRegister<NavigationForm>
  handleSubmit: UseFormHandleSubmit<NavigationForm>
  reset: UseFormReset<NavigationForm>
  setValue: UseFormSetValue<NavigationForm>
  watch: UseFormWatch<NavigationForm>
  errors: FieldErrors<NavigationForm>
}

function NavigationItemForm(props: NavFormProps) {
  const {
    pages,
    navItems,
    selectedItem,
    title,
    submitText,
    onSubmit,
    onCancel,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    errors
  } = props

  const currentUrl = watch('url')
  const selectedSlug = (() => {
    if (!currentUrl) return ''
    if (currentUrl === '/') return 'home'
    if (currentUrl.startsWith('/pages/')) return currentUrl.replace('/pages/', '')
    return ''
  })()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">导航名称 *</label>
        <input
          type="text"
          {...register('name', { required: '请输入导航名称' })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent"
          placeholder="输入导航名称"
        />
        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">选择页面（可选）</label>
        <select
          value={selectedSlug}
          onChange={(e) => {
            const slug = e.target.value
            setValue('url', slug ? (slug === 'home' ? '/' : `/pages/${slug}`) : '')
          }}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent"
        >
          <option value="">选择一个页面...</option>
          {pages.map((page) => (
            <option key={page.id} value={page.slug}>
              {page.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">链接地址 *</label>
        <input
          type="text"
          {...register('url', { required: '请输入链接地址' })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent"
          placeholder="/ 或 https://example.com"
        />
        {errors.url && <p className="mt-1 text-sm text-red-500">{errors.url.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">打开方式</label>
          <select
            {...register('target')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent"
          >
            <option value="_self">当前窗口</option>
            <option value="_blank">新窗口</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">排序值</label>
          <input
            type="number"
            {...register('sort_order', { valueAsNumber: true })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent"
            placeholder="0"
            min="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">父级导航</label>
        <select
          {...register('parent_id')}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent"
        >
          <option value="">无（顶级导航）</option>
          {navItems
            .filter((item) => !item.parent_id && item.id !== selectedItem?.id)
            .map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
        </select>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          {...register('is_active')}
          className="w-4 h-4 text-tech-accent border-gray-300 rounded focus:ring-tech-accent"
        />
        <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">启用该导航项目</label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={() => {
            onCancel()
            reset()
          }}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          取消
        </button>
        <button type="submit" className="px-6 py-2 bg-tech-accent text-white rounded-lg hover:bg-tech-secondary transition-colors">
          {submitText}
        </button>
      </div>
    </form>
  )
}

function NavForm({
  pages,
  navItems,
  selectedItem,
  title,
  submitText,
  onSubmit,
  onCancel,
  register,
  handleSubmit,
  reset,
  setValue,
  watch,
  errors
}: NavFormProps) {
  const currentUrl = watch('url')
  const selectedSlug = (() => {
    if (!currentUrl) return ''
    if (currentUrl === '/') return 'home'
    if (currentUrl.startsWith('/pages/')) {
      return currentUrl.replace('/pages/', '')
    }
    if (currentUrl.startsWith('/')) {
      return currentUrl.substring(1)
    }
    return ''
  })()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          å¯¼èˆªåç§° *
        </label>
        <input
          type="text"
          {...register('name', { required: 'è¯·è¾“å…¥å¯¼èˆªåç§?' })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent"
          placeholder="è¾“å…¥å¯¼èˆªåç§°"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          é€‰æ‹©é¡µé¢ (å¯é€?
        </label>
        <select
          value={selectedSlug}
          onChange={(e) => {
            const slug = e.target.value
            setValue('url', slug ? (slug === 'home' ? '/' : `/pages/${slug}`) : '')
          }}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent"
        >
          <option value="">é€‰æ‹©ä¸€ä¸ªé¡µé?..</option>
          {pages.map((page) => (
            <option key={page.id} value={page.slug}>{page.title}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          é“¾æŽ¥åœ°å€ *
        </label>
        <input
          type="text"
          {...register('url', { required: 'è¯·è¾“å…¥é“¾æŽ¥åœ°å€' })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent"
          placeholder="/ æˆ?https://example.com"
        />
        {errors.url && (
          <p className="mt-1 text-sm text-red-500">{errors.url.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            æ‰“å¼€æ–¹å¼
          </label>
          <select
            {...register('target')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent"
          >
            <option value="_self">å½“å‰çª—å£</option>
            <option value="_blank">æ–°çª—å£</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            æŽ’åºå€?
          </label>
          <input
            type="number"
            {...register('sort_order', { valueAsNumber: true })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent"
            placeholder="0"
            min="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          çˆ¶çº§å¯¼èˆª
        </label>
        <select
          {...register('parent_id')}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent"
        >
          <option value="">æ— ï¼ˆé¡¶çº§å¯¼èˆªï¼‰</option>
          {navItems
            .filter((item) => !item.parent_id && item.id !== selectedItem?.id)
            .map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
        </select>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          {...register('is_active')}
          className="w-4 h-4 text-tech-accent border-gray-300 rounded focus:ring-tech-accent"
        />
        <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
          å¯ç”¨è¯¥å¯¼èˆªé¡¹ç›?
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={() => {
            onCancel()
            reset()
          }}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          å–æ¶ˆ
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-tech-accent text-white rounded-lg hover:bg-tech-secondary transition-colors"
        >
          {submitText}
        </button>
      </div>
    </form>
  )
}

export default function NavigationManagePage() {
  const [navItems, setNavItems] = useState<NavigationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<NavigationItem | null>(null)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [pages, setPages] = useState<PageContent[]>([])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<NavigationForm>()

  useEffect(() => {
    fetchNavigation()
    fetchPages()
  }, [])

  const fetchNavigation = async () => {
    try {
      setIsLoading(true)
      const response = await navigationApi.getAdmin()
      
      if (response.success) {
        setNavItems(response.data || [])
      }
    } catch (error) {
      console.error('获取导航列表失败:', error)
      toast.error('获取导航列表失败')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPages = async () => {
    try {
      setIsLoading(true)
      let allPages: PageContent[] = []
      let page = 1
      let hasMore = true

      while (hasMore) {
        const response = await pagesApi.getAll({
          page,
          limit: 50
        })

        if (response.success && response.data) {
          allPages = [...allPages, ...response.data]
          hasMore = response.meta?.has_next || false
          page++
        } else {
          hasMore = false
        }
      }

      setPages(allPages)
    } catch (error) {
      console.error('获取所有页面失败:', error)
      toast.error('获取页面列表失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (data: NavigationForm) => {
    try {
      const response = await navigationApi.create(data)
      
      if (response.success) {
        toast.success('导航项目创建成功')
        setShowCreateModal(false)
        reset()
        fetchNavigation()
      } else {
        toast.error(response.message || '创建失败')
      }
    } catch (error) {
      console.error('创建导航项目失败:', error)
      toast.error('创建失败，请稍后重试')
    }
  }

  const handleEdit = async (data: NavigationForm) => {
    if (!selectedItem) return

    try {
      const response = await navigationApi.update(selectedItem.id, data)
      
      if (response.success) {
        toast.success('导航项目更新成功')
        setShowEditModal(false)
        setSelectedItem(null)
        reset()
        fetchNavigation()
      } else {
        toast.error(response.message || '更新失败')
      }
    } catch (error) {
      console.error('更新导航项目失败:', error)
      toast.error('更新失败，请稍后重试')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定要删除导航项目"${name}"吗？此操作无法撤销。`)) {
      return
    }

    try {
      const response = await navigationApi.delete(id)
      
      if (response.success) {
        toast.success('导航项目删除成功')
        fetchNavigation()
      } else {
        toast.error(response.message || '删除失败')
      }
    } catch (error) {
      console.error('删除导航项目失败:', error)
      toast.error('删除失败，请稍后重试')
    }
  }

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const openEditModal = (item: NavigationItem) => {
    setSelectedItem(item)
    reset({
      name: item.name,
      url: item.url,
      target: item.target || '_self',
      parent_id: item.parent_id,
      sort_order: item.sort_order || 0,
      is_active: item.is_active !== false
    })
    setShowEditModal(true)
  }

  const renderNavItem = (item: NavigationItem, level = 0) => {
    const hasChildren = navItems.some(nav => nav.parent_id === item.id)
    const isExpanded = expandedItems.has(item.id)
    const children = navItems.filter(nav => nav.parent_id === item.id)

    return (
      <div key={item.id}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${
            level > 0 ? 'ml-8 mt-2' : 'mb-4'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div className="flex items-center space-x-2">
                <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                
                {hasChildren && (
                  <button
                    onClick={() => toggleExpanded(item.id)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                )}
                
                <LinkIcon className="w-4 h-4 text-tech-accent" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {item.name}
                  </h3>
                  
                  {!item.is_active && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded">
                      已禁用
                    </span>
                  )}
                  
                  {item.target === '_blank' && (
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  )}
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {item.url}
                </p>
                
                <div className="flex items-center space-x-4 text-xs text-gray-400 mt-2">
                  <span>排序: {item.sort_order || 0}</span>
                  {item.updated_at && (
                    <span>更新: {formatDateTime(item.updated_at)}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => openEditModal(item)}
                className="p-2 text-gray-400 hover:text-tech-accent transition-colors"
                title="编辑"
              >
                <Edit className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => handleDelete(item.id, item.name)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="删除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
        
        {hasChildren && isExpanded && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="ml-4"
            >
              {children.map(child => renderNavItem(child, level + 1))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    )
  }

  /*
  const NavForm = ({ onSubmit, title, submitText }: {
    onSubmit: (data: NavigationForm) => void,
    title: string,
    submitText: string
  }) => {
    const currentUrl = watch('url');
    const selectedSlug = (() => {
      if (!currentUrl) return ''
      if (currentUrl === '/') return 'home'
      if (currentUrl.startsWith('/pages/')) {
        return currentUrl.replace('/pages/', '')
      }
      if (currentUrl.startsWith('/')) {
        return currentUrl.substring(1)
      }
      return ''
    })();

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          导航名称 *
        </label>
        <input
          type="text"
          {...register('name', { required: '请输入导航名称' })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent"
          placeholder="输入导航名称"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          选择页面 (可选)
        </label>
        <select
          value={selectedSlug}
          onChange={(e) => {
            const slug = e.target.value;
            setValue('url', slug ? (slug === 'home' ? '/' : `/pages/${slug}`) : '');
          }}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent"
        >
          <option value="">选择一个页面...</option>
          {pages.map(page => (
            <option key={page.id} value={page.slug}>{page.title}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          链接地址 *
        </label>
        <input
          type="text"
          {...register('url', { required: '请输入链接地址' })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent"
          placeholder="/ 或 https://example.com"
        />
        {errors.url && (
          <p className="mt-1 text-sm text-red-500">{errors.url.message}</p>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            打开方式
          </label>
          <select
            {...register('target')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent"
          >
            <option value="_self">当前窗口</option>
            <option value="_blank">新窗口</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            排序值
          </label>
          <input
            type="number"
            {...register('sort_order', { valueAsNumber: true })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent"
            placeholder="0"
            min="0"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          父级导航
        </label>
        <select
          {...register('parent_id')}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent"
        >
          <option value="">无（顶级导航）</option>
          {navItems
            .filter(item => !item.parent_id && item.id !== selectedItem?.id)
            .map(item => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
        </select>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          {...register('is_active')}
          className="w-4 h-4 text-tech-accent border-gray-300 rounded focus:ring-tech-accent"
        />
        <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
          启用该导航项目
        </label>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={() => {
            setShowCreateModal(false)
            setShowEditModal(false)
            reset()
          }}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          取消
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-tech-accent text-white rounded-lg hover:bg-tech-secondary transition-colors"
        >
          {submitText}
        </button>
      </div>
    </form>
  );
};
  */

  return (
    <AdminLayout title="导航管理" description="管理网站导航菜单">
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              导航管理
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              管理网站的导航菜单结构
            </p>
          </div>
          
          <button
            onClick={() => {
              reset({
                name: '',
                url: '',
                target: '_self',
                parent_id: '',
                sort_order: 0,
                is_active: true
              })
              setShowCreateModal(true)
            }}
            className="mt-4 md:mt-0 inline-flex items-center btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            添加导航
          </button>
        </div>

        {/* 导航列表 */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tech-accent"></div>
          </div>
        ) : navItems.length === 0 ? (
          <div className="text-center py-12">
            <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              暂无导航项目
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              开始创建您的第一个导航项目吧
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加导航
            </button>
          </div>
        ) : (
          <div>
            {navItems
              .filter(item => !item.parent_id)
              .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
              .map(item => renderNavItem(item))}
          </div>
        )}

        {/* 创建导航模态框 */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <NavigationItemForm
                onSubmit={handleCreate}
                onCancel={() => setShowCreateModal(false)}
                title="创建导航项目"
                submitText="创建"
                pages={pages}
                navItems={navItems}
                selectedItem={selectedItem}
                register={register}
                handleSubmit={handleSubmit}
                reset={reset}
                setValue={setValue}
                watch={watch}
                errors={errors}
              />
            </div>
          </div>
        )}

        {/* 编辑导航模态框 */}
        {showEditModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <NavigationItemForm
                onSubmit={handleEdit}
                onCancel={() => {
                  setShowEditModal(false)
                  setSelectedItem(null)
                }}
                title="编辑导航项目"
                submitText="保存"
                pages={pages}
                navItems={navItems}
                selectedItem={selectedItem}
                register={register}
                handleSubmit={handleSubmit}
                reset={reset}
                setValue={setValue}
                watch={watch}
                errors={errors}
              />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
