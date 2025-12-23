import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileImage,
  Palette,
  Layout,
  Save,
  Eye,
  X,
  ArrowLeft,
  Download
} from 'lucide-react'
import { PageTemplate, TemplateComponent } from '@/types/templates'
import TemplateSelector from '../TemplateSelector'
import PageBuilder from './PageBuilder'
import { generateHtmlFromComponents } from '@/lib/pageContent/generateHtmlFromComponents'

interface VisualPageEditorProps {
  onSave: (pageData: {
    title: string
    slug: string
    excerpt?: string
    content: string
    components: TemplateComponent[]
    meta_title?: string
    meta_description?: string
    published: boolean
    category: string
  }) => void
  onCancel: () => void
  initialData?: any
  editMode?: 'create' | 'edit'
}

const VisualPageEditor: React.FC<VisualPageEditorProps> = ({
  onSave,
  onCancel,
  initialData,
  editMode = 'create'
}) => {
  const [currentStep, setCurrentStep] = useState<'template' | 'build' | 'settings'>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<PageTemplate | null>(null)
  const [pageComponents, setPageComponents] = useState<TemplateComponent[]>([])
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [pageSettings, setPageSettings] = useState({
    title: '',
    slug: '',
    excerpt: '',
    meta_title: '',
    meta_description: '',
    published: false,
    category: 'general'
  })

  // 处理初始数据
  useEffect(() => {
    if (initialData) {
      console.log('VisualPageEditor received initialData:', initialData)
      console.log('VisualPageEditor editMode:', editMode)
      console.log('VisualPageEditor initialData.components:', initialData.components)
      console.log('VisualPageEditor initialData.template_data:', initialData.template_data)

      if (editMode === 'edit') {
        const hasComponents =
          (initialData.components && initialData.components.length > 0) ||
          (initialData.template_data &&
            initialData.template_data.components &&
            initialData.template_data.components.length > 0)

        if (hasComponents) {
          setCurrentStep('build')

          const components = initialData.template_data?.components || initialData.components || []
          setPageComponents(components)

          setPageSettings({
            title: initialData.title || '',
            slug: initialData.slug || '',
            excerpt: initialData.excerpt || '',
            meta_title: initialData.meta_title || '',
            meta_description: initialData.meta_description || '',
            published: initialData.published !== undefined ? initialData.published : false,
            category: initialData.category || 'general'
          })

          // 如果有模板数据，设置选中的模板
          if (initialData.template_data?.template_id) {
            setSelectedTemplate({
              id: initialData.template_data.template_id,
              name: 'Custom Template',
              description: 'Custom template based on existing page',
              components,
              thumbnail: '',
              category: 'custom'
            } as PageTemplate)
          } else if (initialData.template_id) {
            setSelectedTemplate({
              id: initialData.template_id,
              name: 'Custom Template',
              description: 'Custom template based on existing page',
              components,
              thumbnail: '',
              category: 'custom'
            } as PageTemplate)
          }
        } else {
          setCurrentStep('template')
        }
      } else {
        setCurrentStep('template')
      }
    } else {
      setCurrentStep('template')
    }
  }, [initialData, editMode])

  const handleTemplateSelect = useCallback((template: PageTemplate) => {
    setSelectedTemplate(template)
    setPageComponents(template.components)
    setShowTemplateSelector(false)
    setCurrentStep('build')
  }, [])

  const handleSkipTemplate = useCallback(() => {
    setSelectedTemplate(null)
    setPageComponents([])
    setCurrentStep('build')
  }, [])

  const handleSaveComponents = useCallback((components: TemplateComponent[], _content: string) => {
    setPageComponents(components)
    setCurrentStep('settings')
  }, [])

  const handleFinalSave = useCallback(() => {
    const htmlContent = generateHtmlFromComponents(pageComponents)

    let finalSlug = pageSettings.slug
    if (finalSlug === '/') {
      finalSlug = 'home'
    }

    if (!finalSlug && pageSettings.title) {
      finalSlug =
        pageSettings.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || 'page'
    }

    if (!finalSlug || finalSlug.trim() === '') {
      finalSlug = 'page-' + Date.now()
    }

    onSave({
      ...pageSettings,
      slug: finalSlug,
      content: htmlContent,
      components: pageComponents
    })
  }, [pageComponents, pageSettings, onSave])

  const handleCancel = () => onCancel()

  const themeBackgroundStyle = { backgroundColor: 'var(--color-background)' }
  const themeSurfaceStyle = {
    backgroundColor: 'var(--semantic-panel-bg, var(--color-surface))',
    borderColor: 'var(--semantic-panel-border, var(--color-border))'
  }

  return (
    <div className="visual-editor-shell fixed inset-0 z-50 flex flex-col" style={themeBackgroundStyle}>
      {/* 顶部导航 */}
      <div className="border-b px-6 py-4" style={themeSurfaceStyle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCancel}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2">
              <div className="p-2 bg-tech-accent bg-opacity-10 rounded-lg">
                <FileImage className="w-6 h-6 text-tech-accent" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">可视化页面编辑器</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentStep === 'template' && '选择页面模板'}
                  {currentStep === 'build' && '构建页面内容'}
                  {currentStep === 'settings' && '设置页面信息'}
                </p>
              </div>
            </div>
          </div>

          {/* 步骤指示 */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {[
                { key: 'template', label: '选择模板', icon: FileImage },
                { key: 'build', label: '构建页面', icon: Layout },
                { key: 'settings', label: '页面设置', icon: Palette }
              ].map((step, index) => {
                const Icon = step.icon
                const isActive = currentStep === step.key
                const isCompleted =
                  (step.key === 'template' && selectedTemplate) ||
                  (step.key === 'build' && pageComponents.length > 0 && currentStep === 'settings')

                return (
                  <div key={step.key} className="flex items-center">
                    <div
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                        isActive
                          ? 'bg-tech-accent text-white'
                          : isCompleted
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{step.label}</span>
                    </div>
                    {index < 2 && <div className="w-8 h-px bg-gray-300 dark:bg-gray-600 mx-2"></div>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 overflow-hidden" style={themeBackgroundStyle}>
        <AnimatePresence mode="wait">
          {currentStep === 'template' && (
            <motion.div
              key="template"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-col"
            >
              <div className="flex-1 overflow-y-auto p-6" style={themeBackgroundStyle}>
                <div className="h-full flex flex-col">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">选择页面模板</h2>
                    <p className="text-gray-600 dark:text-gray-400">选择预设模板或创建空白页面开始构建</p>
                  </div>

                  <div className="flex-1 flex items-center justify-center">
                    <div className="flex space-x-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentStep('build')}
                        className="flex flex-col items-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-tech-accent hover:bg-tech-accent hover:bg-opacity-5 transition-all"
                      >
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                          <Layout className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">空白页面</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-center">从零开始自由搭建</p>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowTemplateSelector(true)}
                        className="flex flex-col items-center p-8 border-2 border-tech-accent bg-tech-accent bg-opacity-5 rounded-xl hover:bg-opacity-10 transition-all"
                      >
                        <div className="w-16 h-16 bg-tech-accent bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                          <FileImage className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">选择模板</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-center">使用预设模板快速开始</p>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 'build' && (
            <motion.div
              key="build"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full"
            >
              <PageBuilder
                initialTemplate={selectedTemplate || undefined}
                initialComponents={pageComponents}
                onSave={handleSaveComponents}
                onCancel={handleCancel}
              />
            </motion.div>
          )}

          {currentStep === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-col"
            >
              <div className="flex-1 overflow-y-auto p-6" style={themeBackgroundStyle}>
                <div className="max-w-2xl mx-auto pb-20">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">页面设置</h2>
                    <p className="text-gray-600 dark:text-gray-400">设置页面基本信息和 SEO 选项</p>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">页面标题 *</label>
                        <input
                          type="text"
                          value={pageSettings.title}
                          onChange={(e) => setPageSettings((prev) => ({ ...prev, title: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                          placeholder="输入页面标题"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">页面别名 *</label>
                        <input
                          type="text"
                          value={pageSettings.slug}
                          onChange={(e) => setPageSettings((prev) => ({ ...prev, slug: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                          placeholder="page-url"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">页面摘要</label>
                      <textarea
                        value={pageSettings.excerpt}
                        onChange={(e) => setPageSettings((prev) => ({ ...prev, excerpt: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent resize-none"
                        placeholder="简要描述页面内容"
                      />
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">SEO 设置</h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SEO 标题</label>
                          <input
                            type="text"
                            value={pageSettings.meta_title}
                            onChange={(e) => setPageSettings((prev) => ({ ...prev, meta_title: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent"
                            placeholder="搜索引擎显示的标题"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SEO 描述</label>
                          <textarea
                            value={pageSettings.meta_description}
                            onChange={(e) => setPageSettings((prev) => ({ ...prev, meta_description: e.target.value }))}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-accent focus:border-transparent resize-none"
                            placeholder="搜索引擎显示的描述"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={pageSettings.published}
                          onChange={(e) => setPageSettings((prev) => ({ ...prev, published: e.target.checked }))}
                          className="w-4 h-4 text-tech-accent border-gray-300 rounded focus:ring-tech-accent"
                        />
                        <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">立即发布页面</label>
                      </div>
                    </div>

                    <div className="flex justify-between pt-6">
                      <button
                        onClick={() => setCurrentStep('build')}
                        className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                      >
                        返回编辑
                      </button>

                      <button
                        onClick={handleFinalSave}
                        className="flex items-center space-x-2 px-8 py-3 bg-tech-accent text-white rounded-lg hover:bg-tech-secondary transition-colors font-medium"
                      >
                        <Save className="w-5 h-5" />
                        <span>保存页面</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 模板选择器 */}
      {showTemplateSelector && (
        <TemplateSelector onSelect={handleTemplateSelect} onClose={() => setShowTemplateSelector(false)} />
      )}
    </div>
  )
}

export default VisualPageEditor
