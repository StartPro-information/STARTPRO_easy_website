import React, { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/AdminLayout'
import TagEditModal from '@/components/TagEditModal'
import TagFilterModal from '@/components/TagFilterModal'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Filter,
  FileText,
  Clock,
  User,
  ExternalLink,
  Copy,
  Link as LinkIcon,
  X
} from 'lucide-react'
import { pagesApi, tagsApi } from '@/utils/api'
import { formatDateTime } from '@/utils'
import toast from 'react-hot-toast'
import type { PageContent, PaginatedResponse, Tag } from '@/types'

export default function AdminPagesPage() {
  const [pages, setPages] = useState<PageContent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [selectedTagFilters, setSelectedTagFilters] = useState<string[]>([])
  const [includeNoTagsFilter, setIncludeNoTagsFilter] = useState<boolean>(false)
  const [allTagIds, setAllTagIds] = useState<string[]>([])
  const [isTagFilterModalOpen, setIsTagFilterModalOpen] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [editingTagsForPageId, setEditingTagsForPageId] = useState<string | null>(null)
  const [selectedTagsForEditing, setSelectedTagsForEditing] = useState<string[]>([])
  const [isTagModalOpen, setIsTagModalOpen] = useState(false)
  const [pageSize, setPageSize] = useState<number>(10)
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagSlug, setNewTagSlug] = useState('')
  const [isSavingTag, setIsSavingTag] = useState(false)

  const fetchTags = useCallback(async () => {
    try {
      const response = await tagsApi.getAll()
      if (response.success) {
        setTags(response.data)
        const allIds = (response.data as Tag[]).map(tag => tag.id)
        setAllTagIds(allIds)
        setSelectedTagFilters([])
      }
    } catch (error) {
      console.error('获取标签失败:', error)
    }
  }, [])

  // 加载标签数据
  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // 获取页面数据
  const fetchPages = useCallback(async () => {
    try {
      setIsLoading(true)

      const params: any = {
        page: currentPage,
        limit: pageSize,
        search: debouncedSearchTerm || undefined,
        _t: Date.now()
      }

      const shouldFilterByTags = selectedTagFilters.length > 0 || includeNoTagsFilter
      if (shouldFilterByTags) {
        if (selectedTagFilters.length > 0) {
          params.tagIds = selectedTagFilters
        }
        if (includeNoTagsFilter) {
          params.includeNoTags = true
        }
      }

      const response: PaginatedResponse<PageContent> = await pagesApi.getAll(params)

      if (response.success) {
        let filteredPages = response.data || []

        if (filter === 'published') {
          filteredPages = filteredPages.filter(page => page.published)
        } else if (filter === 'draft') {
          filteredPages = filteredPages.filter(page => !page.published)
        }

        setPages(filteredPages)
        setTotalPages(response.meta?.total_pages || 1)
      } else {
        console.error('API响应失败:', response)
        toast.error(response.message || '获取页面列表失败')
      }
    } catch (error: any) {
      console.error('获取页面列表失败 - 异常:', error)
      if (error.response && error.response.status === 429) {
        toast.error('请求过于频繁，请稍后重试')
      } else {
        toast.error('获取页面列表失败')
      }
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, debouncedSearchTerm, filter, selectedTagFilters, includeNoTagsFilter, pageSize])

  useEffect(() => {
    fetchPages()
  }, [currentPage, debouncedSearchTerm, filter, selectedTagFilters, includeNoTagsFilter, pageSize, fetchPages])

  useEffect(() => {
    if (pages.length === 0 && isLoading) {
      fetchPages()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps


  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个页面吗？此操作无法撤销。')) {
      return
    }

    try {
      const response = await pagesApi.delete(id)
      if (response.success) {
        toast.success('页面删除成功')
        fetchPages()
      } else {
        toast.error(response.message || '删除失败')
      }
    } catch (error) {
      console.error('删除页面失败:', error)
      toast.error('删除失败，请稍后重试')
    }
  }

  const normalizeTagId = (tagId: string) => String(tagId || '').replace(/^tag_/, '')


  const handleDeleteTag = async (tagId: string) => {
    const normalizedId = normalizeTagId(tagId)
    if (!normalizedId) return

    if (!confirm('确定要删除这个标签吗？删除后与页面的关联也会移除。')) {
      return
    }

    try {
      const response = await tagsApi.delete(normalizedId)
      if (response.success) {
        toast.success('标签删除成功')
        setSelectedTagFilters(prev => prev.filter(id => normalizeTagId(id) !== normalizedId))
        await fetchTags()
        fetchPages()
      } else {
        toast.error(response.message || '删除失败')
      }
    } catch (error) {
      console.error('删除标签失败:', error)
      toast.error('删除标签失败，请稍后重试')
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchPages()
  }

  const buildPagePath = (page: PageContent) => {
    if (!page?.slug) return ''
    return page.slug.startsWith('/') ? page.slug : `/pages/${page.slug}`
  }

  const copyPageLink = async (page: PageContent) => {
    const path = buildPagePath(page)
    if (!path) {
      toast.error('该页面尚未设置路径，无法复制')
      return
    }

    try {
      const copyText = async () => {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(path)
          return true
        }
        const textArea = document.createElement('textarea')
        textArea.value = path
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        const success = document.execCommand('copy')
        document.body.removeChild(textArea)
        return success
      }

      const copied = await copyText()
      if (copied) {
        toast.success('页面链接已复制：' + path)
      } else {
        throw new Error('复制命令失败')
      }
    } catch (error) {
      console.error('复制链接失败:', error)
      toast.error('复制链接失败，请手动复制：' + path)
    }
  }

  const handleSaveTags = async (selectedTagIds: string[]) => {
    if (!editingTagsForPageId) return

    const currentPageData = pages.find(p => p.id === editingTagsForPageId)
    if (!currentPageData) return

    try {
      const response = await pagesApi.update(editingTagsForPageId, {
        tags: selectedTagIds,
        title: currentPageData.title,
        slug: currentPageData.slug,
        content: currentPageData.content || '',
        excerpt: currentPageData.excerpt || '',
        featured_image: currentPageData.featured_image || '',
        meta_title: currentPageData.meta_title || '',
        meta_description: currentPageData.meta_description || '',
        published: currentPageData.published,
        sort_order: currentPageData.sort_order || 0,
        show_updated_date: currentPageData.show_updated_date || false
      })
      if (response.success) {
        toast.success('标签更新成功')
        fetchPages()
      } else {
        toast.error(response.message || '更新失败')
      }
    } catch (error) {
      console.error('标签更新失败:', error)
      toast.error('标签更新失败，请稍后重试')
    }
  }

  return (
    <AdminLayout
      title="页面管理"
      description="管理并编辑网站的所有页面内容"
    >
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              页面管理
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              管理并编辑网站的所有页面内容
            </p>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
            <Link
              href="/admin/pages/create"
              className="mt-4 md:mt-0 inline-flex items-center btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              创建页面
            </Link>
            <button
              type="button"
              onClick={() => {
                fetchTags()
                setIsTagManagerOpen(true)
              }}
              className="mt-4 md:mt-0 inline-flex items-center btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              标签管理
            </button>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="bg-white dark:bg-tech-light rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* 搜索 */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索页面标题或内容..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-tech-dark text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                />
              </div>
            </form>

            {/* 过滤器 */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-tech-dark text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                >
                  <option value="all">全部页面</option>
                  <option value="published">已发布</option>
                  <option value="draft">草稿</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsTagFilterModalOpen(true)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-tech-dark text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-tech-accent focus:border-transparent flex items-center"
                >
                  <span className="mr-2">标签筛选</span>
                  {selectedTagFilters.length > 0 && (
                    <span className="bg-tech-accent text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {selectedTagFilters.length}
                    </span>
                  )}
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">每页</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    const newPageSize = Number(e.target.value)
                    setPageSize(newPageSize)
                    setCurrentPage(1)
                  }}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-tech-dark text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                >
                  <option value="10">10 条</option>
                  <option value="30">30 条</option>
                  <option value="100">100 条</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 页面列表 */}
        <div className="bg-white dark:bg-tech-light rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tech-accent"></div>
            </div>
          ) : pages.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                暂无页面
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                开始创建你的第一个页面吧
              </p>
              <Link
                href="/admin/pages/create"
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                创建页面
              </Link>
            </div>
          ) : (
            <>
              {/* 表头 */}
              <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3">
                <div className="hidden md:grid grid-cols-[3fr_1fr_3fr_1fr_1fr_3fr] gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <div>标题</div>
                  <div>状态</div>
                  <div>页面标签</div>
                  <div>创建人</div>
                  <div>更新时间</div>
                  <div className="text-right">操作</div>
                </div>
                <div className="md:hidden text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  页面列表
                </div>
              </div>

              {/* 表格内容 */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {pages.map((page, index) => {
                  const pagePath = buildPagePath(page)
                  return (
                    <motion.div
                      key={page.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="grid gap-4 items-start md:items-center md:grid-cols-[3fr_1fr_3fr_1fr_1fr_3fr]">
                        {/* 标题 */}
                        <div>
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <FileText className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {page.title}
                              </h3>
                              {page.template_data && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 mt-1">
                                  可视化编辑
                                </span>
                              )}
                              <div className="mt-1 flex items-center flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <Link
                                  href={pagePath || '#'}
                                  target="_blank"
                                  className="inline-flex items-center space-x-1 text-tech-accent hover:text-tech-accent-dark"
                                >
                                  <LinkIcon className="w-3 h-3" />
                                  <span className="truncate max-w-[10rem] md:max-w-[14rem] lg:max-w-[18rem]">
                                    {pagePath || '未设置路径'}
                                  </span>
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => copyPageLink(page)}
                                  disabled={!pagePath}
                                  className="inline-flex items-center space-x-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>复制链接</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 状态 */}
                        <div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              page.published
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            }`}
                          >
                            {page.published ? '已发布' : '草稿'}
                          </span>
                        </div>

                        {/* 标签 */}
                        <div className="space-y-2">
                          {Array.isArray(page.tags) && page.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {(page.tags as Array<{ id: string; name: string } | string>).map(tag => (
                                <span
                                  key={typeof tag === 'string' ? tag : tag.id}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                >
                                  {(() => {
                                    if (typeof tag === 'string') return tag.replace(/^tag_/, '')
                                    if (tag && typeof tag === 'object' && 'name' in tag) return tag.name.replace(/^tag_/, '')
                                    return ''
                                  })()}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">无标签</span>
                          )}
                          <button
                            onClick={() => {
                              const currentTagIds = Array.isArray(page.tags)
                                ? page.tags.map(tag =>
                                    typeof tag === 'string' ? tag : tag.id
                                  )
                                : []
                              setSelectedTagsForEditing(currentTagIds)
                              setEditingTagsForPageId(page.id)
                              setIsTagModalOpen(true)
                            }}
                            className="mt-1 inline-flex items-center px-2 py-1 text-tech-accent hover:text-tech-accent-dark bg-tech-accent/10 hover:bg-tech-accent/20 rounded text-sm transition-colors"
                            title="编辑标签"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            <span>编辑标签</span>
                          </button>
                        </div>

                        {/* 创建人 */}
                        <div>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {(page as any).created_by_name || '未知'}
                            </span>
                          </div>
                        </div>

                        {/* 更新时间 */}
                        <div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDateTime(page.updated_at)}
                            </span>
                          </div>
                        </div>

                        {/* 操作 */}
                        <div>
                          <div className="flex flex-wrap gap-2 justify-end md:justify-start">
                            {page.published && (
                              <Link
                                href={`/pages/${page.slug}`}
                                target="_blank"
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                              >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                预览
                              </Link>
                            )}
                            <Link
                              href={`/admin/pages/${page.id}/edit-published-visual`}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              可视化编辑
                            </Link>
                            
                            <button
                              onClick={() => handleDelete(page.id)}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              删除
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              显示第 {(currentPage - 1) * pageSize + 1} 条到{' '}
              {Math.min(currentPage * pageSize, pages.length)} 条，共 {pages.length} 条记录
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-tech-dark text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              
              <span className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                {currentPage} / {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-tech-dark text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      <TagEditModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        onSave={handleSaveTags}
        initialSelectedTags={selectedTagsForEditing}
        availableTags={tags}
      />

      {isTagManagerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify中心 bg-black/40 px-4">
          <div className="bg-white dark:bg-tech-light rounded-xl shadow-2xl max-w-3xl w-full border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">标签管理</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">创建和删除页面标签</p>
              </div>
              <button
                onClick={() => setIsTagManagerOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-[2fr_2fr_auto] gap-3 items-end">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">标签名称</label>
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => {
                      setNewTagName(e.target.value)
                      setNewTagSlug(
                        e.target.value
                          .trim()
                          .toLowerCase()
                          .replace(/\s+/g, '-')
                          .replace(/[^a-z0-9-_]/g, '')
                      )
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-tech-dark text-gray-900 dark:text-white"
                    placeholder="例如：行业资讯"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">标签别名（slug）</label>
                  <input
                    type="text"
                    value={newTagSlug}
                    onChange={(e) => setNewTagSlug(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-tech-dark text-gray-900 dark:text-white"
                    placeholder="例如：industry-news"
                  />
                </div>
                <div className="flex items-center">
                  <button
                    type="button"
                    disabled={!newTagName || !newTagSlug || isSavingTag}
                    onClick={async () => {
                      if (!newTagName.trim() || !newTagSlug.trim()) {
                        toast.error('名称和别名不能为空')
                        return
                      }
                      try {
                        setIsSavingTag(true)
                        const res = await tagsApi.create({ name: newTagName.trim(), slug: newTagSlug.trim() })
                        if (res.success) {
                          toast.success('创建成功')
                          setNewTagName('')
                          setNewTagSlug('')
                          fetchTags()
                        } else {
                          toast.error(res.message || '创建失败')
                        }
                      } catch (error) {
                        console.error('创建标签失败:', error)
                        toast.error('创建标签失败，请稍后重试')
                      } finally {
                        setIsSavingTag(false)
                      }
                    }}
                    className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-tech-accent text-white hover:bg-tech-secondary transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    {isSavingTag ? '创建中...' : '创建'}
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 max-h-80 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                {tags.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">暂无标签</div>
                ) : (
                  tags.map((tag) => (
                    <div key={tag.id} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{tag.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 break-all">
                          Slug: {tag.id || (tag as any).slug || ''}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTag(tag.id)}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        删除
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <TagFilterModal
        isOpen={isTagFilterModalOpen}
        onClose={() => setIsTagFilterModalOpen(false)}
        onApply={(selectedTags, includeNoTags) => {
          setSelectedTagFilters(selectedTags)
          setIncludeNoTagsFilter(includeNoTags)
        }}
        currentSelectedTags={selectedTagFilters}
        availableTags={tags}
        currentIncludeNoTags={includeNoTagsFilter}
      />
    </AdminLayout>
  )
}




