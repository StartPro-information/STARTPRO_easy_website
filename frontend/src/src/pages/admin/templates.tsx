import React, { useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Grid,
  List,
  Search,
  Filter,
  Eye,
  Plus,
  Sparkles
} from 'lucide-react'
import { useRouter } from 'next/router'
import { pageTemplates } from '@/lib/templates'
import Link from 'next/link'

export default function TemplateGalleryPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // 获取所有分类
  const categories = Array.from(new Set(pageTemplates.map(template => template.category)))

  // 过滤模板
  const filteredTemplates = pageTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <AdminLayout title="模板画廊" description="浏览和选择页面模板">
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              模板画廊
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              浏览和选择适合您需求的页面模板
            </p>
          </div>
          
          <button
            onClick={() => router.push('/admin/pages/create')}
            className="mt-4 md:mt-0 inline-flex items-center btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            创建页面
          </button>
        </div>

        {/* 搜索和过滤 */}
        <div className="bg-white dark:bg-tech-light rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* 搜索 */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索模板名称或描述..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-tech-dark text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                />
              </div>
            </div>

            {/* 过滤器 */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-tech-dark text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                >
                  <option value="all">全部分类</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* 视图切换 */}
              <div className="flex items-center space-x-1 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded ${
                    viewMode === 'grid'
                      ? 'bg-tech-accent text-white'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1 rounded ${
                    viewMode === 'list'
                      ? 'bg-tech-accent text-white'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 模板列表 */}
        <div className="bg-white dark:bg-tech-light rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <Grid className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                没有找到匹配的模板
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                请尝试其他搜索关键词或选择不同的分类
              </p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setCategoryFilter('all')
                }}
                className="btn-primary"
              >
                清除筛选条件
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {/* 模板缩略图 */}
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 relative overflow-hidden">
                    {template.thumbnail ? (
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-6xl opacity-20">📄</div>
                      </div>
                    )}
                    
                    {/* 新增标识 */}
                    {['luxury-corporate-homepage', 'creative-agency-homepage', 'tech-innovation-homepage', 'fullscreen-visual-homepage', 'interactive-homepage', 'minimal-business-homepage'].includes(template.id) && (
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-tech-accent to-tech-secondary text-white text-xs px-2 py-1 rounded-full">
                        新增
                      </div>
                    )}
                  </div>
                  
                  {/* 模板信息 */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {template.name}
                      </h3>
                      <span className="px-2 py-1 text-xs bg-tech-accent bg-opacity-10 text-tech-accent rounded-full whitespace-nowrap">
                        {template.category}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {template.components.length} 个组件
                      </span>
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/admin/pages/create?template=${template.id}`}
                          className="text-sm text-tech-accent hover:text-tech-secondary font-medium flex items-center"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          使用
                        </Link>
                        <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-tech-accent flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          预览
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg flex-shrink-0 overflow-hidden mr-4">
                      {template.thumbnail ? (
                        <img
                          src={template.thumbnail}
                          alt={template.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl opacity-20">📄</div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {template.name}
                            </h3>
                            {['luxury-corporate-homepage', 'creative-agency-homepage', 'tech-innovation-homepage', 'fullscreen-visual-homepage', 'interactive-homepage', 'minimal-business-homepage'].includes(template.id) && (
                              <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-tech-accent to-tech-secondary text-white rounded-full">
                                新增
                              </span>
                            )}
                            <span className="px-2 py-0.5 text-xs bg-tech-accent bg-opacity-10 text-tech-accent rounded-full">
                              {template.category}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                            {template.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-500">
                            <span>{template.components.length} 个组件</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Link
                            href={`/admin/pages/create?template=${template.id}`}
                            className="text-sm text-tech-accent hover:text-tech-secondary font-medium flex items-center"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            使用模板
                          </Link>
                          <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-tech-accent flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            预览
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* 底部说明 */}
        <div className="bg-gradient-to-r from-tech-accent/5 to-tech-secondary/5 border border-tech-accent/20 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-tech-accent to-tech-secondary rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                新增高级模板
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                我们新增了六个高级首页模板：奢华企业首页、创意机构首页、科技创新首页、全屏视觉首页、交互式首页和极简商务首页，为您提供更多样化的选择。
                这些模板具有更现代的设计和更丰富的功能，适合不同类型的网站需求。
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}