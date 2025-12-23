import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Eye, 
  Check,
  Grid,
  List,
  X
} from 'lucide-react'
import { PageTemplate } from '@/types/templates'
import { pageTemplates } from '@/lib/templates'

interface TemplateSelectorProps {
  onSelect: (template: PageTemplate) => void
  onClose: () => void
  selectedTemplate?: PageTemplate | null
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onSelect,
  onClose,
  selectedTemplate
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [previewTemplate, setPreviewTemplate] = useState<PageTemplate | null>(null)

  const categories = useMemo(
    () => Array.from(new Set(pageTemplates.map((template) => template.category))),
    []
  )
  
  const filteredTemplates = pageTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleTemplateSelect = (template: PageTemplate) => {
    onSelect(template)
    onClose()
  }

  const TemplateCard = ({ template }: { template: PageTemplate }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 ${
        selectedTemplate?.id === template.id 
          ? 'border-tech-accent ring-2 ring-tech-accent ring-opacity-50' 
          : 'border-gray-200 dark:border-gray-700 hover:border-tech-accent'
      }`}
      onClick={() => handleTemplateSelect(template)}
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
        
        {/* 选中标识 */}
        {selectedTemplate?.id === template.id && (
          <div className="absolute top-2 right-2 bg-tech-accent text-white rounded-full p-2">
            <Check className="w-4 h-4" />
          </div>
        )}
        
        {/* 预览按钮 */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setPreviewTemplate(template)
            }}
            className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transform scale-90 hover:scale-100 transition-transform"
          >
            <Eye className="w-4 h-4" />
            <span>预览</span>
          </button>
        </div>
      </div>
      
      {/* 模板信息 */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
            {template.name}
          </h3>
          <span className="px-2 py-1 text-xs bg-tech-accent bg-opacity-10 text-tech-accent rounded-full">
            {template.category}
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
          {template.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-500">
            {template.components.length} 个组件
          </span>
          <button
            onClick={() => handleTemplateSelect(template)}
            className="text-sm text-tech-accent hover:text-tech-secondary font-medium"
          >
            选择模板
          </button>
        </div>
      </div>
    </motion.div>
  )

  const TemplateListItem = ({ template }: { template: PageTemplate }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 ${
        selectedTemplate?.id === template.id 
          ? 'border-tech-accent ring-2 ring-tech-accent ring-opacity-50' 
          : 'border-gray-200 dark:border-gray-700 hover:border-tech-accent'
      }`}
      onClick={() => handleTemplateSelect(template)}
    >
      <div className="flex items-start space-x-4">
        <div className="w-20 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg flex-shrink-0 overflow-hidden">
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
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {template.name}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 text-xs bg-tech-accent bg-opacity-10 text-tech-accent rounded-full">
                {template.category}
              </span>
              {selectedTemplate?.id === template.id && (
                <div className="bg-tech-accent text-white rounded-full p-1">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
            {template.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-500">
              {template.components.length} 个组件
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setPreviewTemplate(template)
                }}
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-tech-accent flex items-center space-x-1"
              >
                <Eye className="w-3 h-3" />
                <span>预览</span>
              </button>
              <button
                onClick={() => handleTemplateSelect(template)}
                className="text-xs text-tech-accent hover:text-tech-secondary font-medium"
              >
                选择
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-7xl w-full h-[90vh] mx-4 flex flex-col"
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              选择页面模板
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              选择一个模板开始创建您的页面
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 搜索和筛选 */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            {/* 搜索框 */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索模板..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-4">
              {/* 分类筛选 */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                >
                  <option value="all">所有分类</option>
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
        <div className="flex-1 overflow-y-auto p-6">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4 opacity-20">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                没有找到匹配的模板
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                请尝试其他搜索关键词或选择不同的分类
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TemplateCard template={template} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <TemplateListItem template={template} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* 底部操作 */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              找到 {filteredTemplates.length} 个模板
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                取消
              </button>
              {selectedTemplate && (
                <button
                  onClick={() => onSelect(selectedTemplate)}
                  className="px-6 py-2 bg-tech-accent text-white rounded-lg hover:bg-tech-secondary transition-colors"
                >
                  使用选中模板
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 模板预览模态框 */}
      <AnimatePresence>
        {previewTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-60"
            onClick={() => setPreviewTemplate(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {previewTemplate.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {previewTemplate.description}
                    </p>
                  </div>
                  <button
                    onClick={() => setPreviewTemplate(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    模板包含的组件：
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {previewTemplate.components.map((component, index) => (
                      <div
                        key={component.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">
                            {component.type === 'hero' && '🚀'}
                            {component.type === 'text-block' && '📝'}
                            {component.type === 'image-block' && '🖼️'}
                            {component.type === 'feature-grid' && '⚡'}
                            {component.type === 'pricing-cards' && '💰'}
                            {component.type === 'contact-form' && '📞'}
                            {component.type === 'team-grid' && '👥'}
                            {component.type === 'call-to-action' && '📢'}
                          </span>
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">
                              {component.type === 'hero' && '英雄区块'}
                              {component.type === 'text-block' && '文本区块'}
                              {component.type === 'image-block' && '图片区块'}
                              {component.type === 'feature-grid' && '功能网格'}
                              {component.type === 'pricing-cards' && '价格卡片'}
                              {component.type === 'contact-form' && '联系表单'}
                              {component.type === 'team-grid' && '团队展示'}
                              {component.type === 'call-to-action' && '行动号召'}
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {component.props.title || '未设置标题'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => {
                      handleTemplateSelect(previewTemplate)
                      setPreviewTemplate(null)
                    }}
                    className="px-6 py-2 bg-tech-accent text-white rounded-lg hover:bg-tech-secondary transition-colors"
                  >
                    使用此模板
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TemplateSelector
