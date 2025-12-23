import React, { useState, useCallback } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff,
  Copy,
  ArrowUp,
  ArrowDown,
  Settings,
  Save,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react'
import { TemplateComponent, PageTemplate } from '@/types/templates'
import ComponentLibrary from './ComponentLibrary'
import { DragTypes } from './dragTypes'
import { componentPreviews } from './previews'
import { componentDefinitions } from '@/lib/templates'
import ComponentEditor from '@/components/PageBuilder/ComponentEditor'

interface PageBuilderProps {
  initialTemplate?: PageTemplate
  initialComponents?: TemplateComponent[]
  onSave: (components: TemplateComponent[], content: string) => void
  onCancel: () => void
}

const PageBuilder: React.FC<PageBuilderProps> = ({
  initialTemplate,
  initialComponents,
  onSave,
  onCancel
}) => {
  const [components, setComponents] = useState<TemplateComponent[]>(
    initialComponents || initialTemplate?.components || []
  )
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

  const canvasBackgroundStyle = { backgroundColor: 'var(--color-background)' }
  const surfaceStyle = {
    backgroundColor: 'var(--semantic-panel-bg, var(--color-surface))',
    borderColor: 'var(--semantic-panel-border, var(--color-border))'
  }

  // 生成唯一ID
  const generateId = () => {
    return 'comp_' + Math.random().toString(36).substr(2, 9)
  }

  // 添加新组件
  const addComponent = useCallback((type: string, index?: number) => {
    const definition = componentDefinitions.find(def => def.type === type)
    if (!definition) return

    const newComponent: TemplateComponent = {
      id: generateId(),
      type: type as any,
      props: { ...definition.defaultProps }
    }

    setComponents(prev => {
      const newComponents = [...prev]
      if (index !== undefined) {
        newComponents.splice(index, 0, newComponent)
      } else {
        newComponents.push(newComponent)
      }
      return newComponents
    })
  }, [])

  // 移动组件
  const moveComponent = useCallback((dragIndex: number, hoverIndex: number) => {
    setComponents(prev => {
      const newComponents = [...prev]
      const draggedComponent = newComponents[dragIndex]
      newComponents.splice(dragIndex, 1)
      newComponents.splice(hoverIndex, 0, draggedComponent)
      return newComponents
    })
  }, [])

  // 更新组件
  const updateComponent = useCallback((id: string, props: any) => {
    setComponents(prev =>
      prev.map(comp =>
        comp.id === id ? { ...comp, props: { ...comp.props, ...props } } : comp
      )
    )
  }, [])

  // 删除组件
  const deleteComponent = useCallback((id: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== id))
    if (selectedComponent === id) {
      setSelectedComponent(null)
      setShowEditor(false)
    }
  }, [selectedComponent])

  // 复制组件
  const duplicateComponent = useCallback((id: string) => {
    const component = components.find(comp => comp.id === id)
    if (!component) return

    const newComponent: TemplateComponent = {
      ...component,
      id: generateId()
    }

    setComponents(prev => {
      const index = prev.findIndex(comp => comp.id === id)
      const newComponents = [...prev]
      newComponents.splice(index + 1, 0, newComponent)
      return newComponents
    })
  }, [components])

  // 移动组件位置
  const moveComponentUp = useCallback((id: string) => {
    setComponents(prev => {
      const index = prev.findIndex(comp => comp.id === id)
      if (index <= 0) return prev
      
      const newComponents = [...prev]
      const component = newComponents[index]
      newComponents.splice(index, 1)
      newComponents.splice(index - 1, 0, component)
      return newComponents
    })
  }, [])

  const moveComponentDown = useCallback((id: string) => {
    setComponents(prev => {
      const index = prev.findIndex(comp => comp.id === id)
      if (index >= prev.length - 1) return prev
      
      const newComponents = [...prev]
      const component = newComponents[index]
      newComponents.splice(index, 1)
      newComponents.splice(index + 1, 0, component)
      return newComponents
    })
  }, [])

  // 保存页面
  const handleSave = () => {
    // 生成HTML内容
    const htmlContent = components.map(component => {
      // 这里可以根据组件类型生成相应的HTML
      return `<div data-component="${component.type}" data-id="${component.id}">
        ${JSON.stringify(component.props)}
      </div>`
    }).join('\n')

    onSave(components, htmlContent)
  }

  // 获取设备预览样式 - 在桌面模式下使用响应式宽度
  const getDeviceStyles = () => {
    switch (deviceMode) {
      case 'mobile':
        return { maxWidth: '375px', margin: '0 auto' }
      case 'tablet':
        return { maxWidth: '768px', margin: '0 auto' }
      default:
        // 在桌面模式下使用固定最大宽度，确保组件不会过于宽大
        return { width: '68vw', maxWidth: '2000px', margin: '0 auto' }
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className="flex h-[calc(100vh-64px)]"
        style={canvasBackgroundStyle}
      >
        {/* 左侧组件库 */}
        {!previewMode && (
          <div
            className="w-64 md:w-80 border-r overflow-y-auto flex flex-col"
            style={surfaceStyle}
          >
            <div
              className="p-4 border-b flex-shrink-0"
              style={{ borderColor: 'var(--semantic-panel-border, var(--color-border))' }}
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">组件库</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                拖拽组件到页面中
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <ComponentLibrary components={componentDefinitions} onAdd={addComponent} />
            </div>
          </div>
        )}

        {/* 中间编辑区域 */}
        <div className="flex-1 flex flex-col">
          {/* 顶部工具栏 */}
          <div
            className="border-b p-4"
            style={surfaceStyle}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  页面构建器
                </h2>
                
                {/* 设备预览切换 */}
                <div className="flex items-center space-x-1 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
                  <button
                    onClick={() => setDeviceMode('desktop')}
                    className={`p-2 rounded ${
                      deviceMode === 'desktop'
                        ? 'bg-tech-accent text-white'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeviceMode('tablet')}
                    className={`p-2 rounded ${
                      deviceMode === 'tablet'
                        ? 'bg-tech-accent text-white'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Tablet className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeviceMode('mobile')}
                    className={`p-2 rounded ${
                      deviceMode === 'mobile'
                        ? 'bg-tech-accent text-white'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    previewMode
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      : 'bg-tech-accent text-white hover:bg-tech-secondary'
                  }`}
                >
                  {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{previewMode ? '编辑' : '预览'}</span>
                </button>
                
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>保存</span>
                </button>
                
                <button
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>

          {/* 页面编辑区域 */}
          <div
            className="flex-1 overflow-y-auto p-4 pb-40"
            style={canvasBackgroundStyle}
          >
            <div style={getDeviceStyles()}>
              <PageDropZone
              components={components}
              selectedComponent={selectedComponent}
              previewMode={previewMode}
              onComponentSelect={setSelectedComponent}
              onComponentUpdate={updateComponent}
              onComponentDelete={deleteComponent}
              onComponentDuplicate={duplicateComponent}
              onComponentMove={moveComponent}
              onComponentMoveUp={moveComponentUp}
              onComponentMoveDown={moveComponentDown}
              onAddComponent={addComponent}
              onEditComponent={(id) => {
                setSelectedComponent(id)
                setShowEditor(true)
              }}
            />
            </div>
          </div>
        </div>

        {/* 右侧属性编辑器 */}
        <AnimatePresence>
          {showEditor && selectedComponent && (
            <motion.div
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              className="w-80 border-l overflow-y-auto flex flex-col h-[calc(100vh-64px)]"
              style={surfaceStyle}
            >
              <ComponentEditor
                component={components.find(c => c.id === selectedComponent)!}
                onUpdate={(props: any) => updateComponent(selectedComponent, props)}
                onClose={() => setShowEditor(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DndProvider>
  )
}

// 页面拖放区域
const PageDropZone: React.FC<{
  components: TemplateComponent[]
  selectedComponent: string | null
  previewMode: boolean
  onComponentSelect: (id: string) => void
  onComponentUpdate: (id: string, props: any) => void
  onComponentDelete: (id: string) => void
  onComponentDuplicate: (id: string) => void
  onComponentMove: (dragIndex: number, hoverIndex: number) => void
  onComponentMoveUp: (id: string) => void
  onComponentMoveDown: (id: string) => void
  onAddComponent: (type: string, index?: number) => void
  onEditComponent: (id: string) => void
}> = ({
  components,
  selectedComponent,
  previewMode,
  onComponentSelect,
  onComponentDelete,
  onComponentDuplicate,
  onComponentMove,
  onComponentMoveUp,
  onComponentMoveDown,
  onAddComponent,
  onEditComponent
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: [DragTypes.COMPONENT, DragTypes.NEW_COMPONENT],
    drop: (item: any) => {
      if (item.type && !item.index) {
        onAddComponent(item.type)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  })

  return (
    <div
      ref={drop as any}
      className={`min-h-full space-y-4 ${
        isOver ? 'bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20' : ''
      }`}
    >
      {components.length === 0 ? (
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <div className="text-center">
            <div className="text-4xl mb-4 opacity-40">📄</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              开始构建您的页面
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              从左侧拖拽组件到这里开始编辑
            </p>
          </div>
        </div>
      ) : (
        components.map((component, index) => (
          <DraggableComponent
            key={component.id}
            component={component}
            index={index}
            isSelected={selectedComponent === component.id}
            previewMode={previewMode}
            onSelect={onComponentSelect}
            onDelete={onComponentDelete}
            onDuplicate={onComponentDuplicate}
            onMove={onComponentMove}
            onMoveUp={onComponentMoveUp}
            onMoveDown={onComponentMoveDown}
            onEdit={onEditComponent}
          />
        ))
      )}
    </div>
  )
}

// 可拖拽组件
const DraggableComponent: React.FC<{
  component: TemplateComponent
  index: number
  isSelected: boolean
  previewMode: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onMove: (dragIndex: number, hoverIndex: number) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  onEdit: (id: string) => void
}> = ({
  component,
  index,
  isSelected,
  previewMode,
  onSelect,
  onDelete,
  onDuplicate,
  onMove,
  onMoveUp,
  onMoveDown,
  onEdit
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: DragTypes.COMPONENT,
    item: { id: component.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  const [, drop] = useDrop({
    accept: DragTypes.COMPONENT,
    hover: (item: any) => {
      if (item.index !== index) {
        onMove(item.index, index)
        item.index = index
      }
    }
  })

  const PreviewComponent = componentPreviews[component.type as keyof typeof componentPreviews]
  
  if (!PreviewComponent) {
    return (
      <div className="p-4 border border-red-300 rounded-lg bg-red-50">
        <p className="text-red-600">未知组件类型: {component.type}</p>
      </div>
    )
  }

  return (
    <div
      ref={(node) => {
        drag(node)
        drop(node)
      }}
      className={`relative group ${isDragging ? 'opacity-50' : ''} ${
        isSelected && !previewMode ? 'ring-2 ring-tech-accent' : ''
      }`}
      onClick={() => !previewMode && onSelect(component.id)}
    >
      <PreviewComponent component={component} />
      
      {/* 编辑工具栏 */}
      {!previewMode && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(component.id)
              }}
              className="p-1 text-gray-600 dark:text-gray-400 hover:text-tech-accent"
              title="编辑"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDuplicate(component.id)
              }}
              className="p-1 text-gray-600 dark:text-gray-400 hover:text-tech-accent"
              title="复制"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onMoveUp(component.id)
              }}
              className="p-1 text-gray-600 dark:text-gray-400 hover:text-tech-accent"
              title="上移"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onMoveDown(component.id)
              }}
              className="p-1 text-gray-600 dark:text-gray-400 hover:text-tech-accent"
              title="下移"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(component.id)
              }}
              className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-500"
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PageBuilder
