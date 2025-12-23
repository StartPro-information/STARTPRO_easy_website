import React from 'react'
import { useDrag } from 'react-dnd'
import { DragTypes } from './dragTypes'

const ComponentLibrary: React.FC<{
  components: any[]
  onAdd: (type: string) => void
}> = ({ components, onAdd }) => {
  const groupedComponents = components.reduce((acc: any, component) => {
    const category = component.category || '未分类'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(component)
    return acc
  }, {})

  const categoryOrder = ['图片组件', '卡片组件', '文本组件', '赛博组件', '未分类']
  const sortedCategories = Object.keys(groupedComponents).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a)
    const indexB = categoryOrder.indexOf(b)
    if (indexA === -1 && indexB === -1) return a.localeCompare(b)
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })

  return (
    <div className="space-y-6">
      {sortedCategories.map(category => (
        <div key={category}>
          <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 text-sm uppercase tracking-wide">
            {category}
          </h4>
          <div className="space-y-2">
            {groupedComponents[category].map((definition: any) => (
              <ComponentLibraryItem
                key={definition.type}
                definition={definition}
                onAdd={onAdd}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const ComponentLibraryItem: React.FC<{
  definition: any
  onAdd: (type: string) => void
}> = ({ definition, onAdd }) => {
  const [{ isDragging }, drag] = useDrag({
    type: DragTypes.NEW_COMPONENT,
    item: { type: definition.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  return (
    <div
      ref={drag as any}
      className={`p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-move hover:border-tech-accent transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
      onClick={() => onAdd(definition.type)}
    >
      <div className="flex items-center space-x-3">
        <span className="text-xl">{definition.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between">
            <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
              {definition.name}
            </h4>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 whitespace-nowrap">
              {definition.category}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {definition.description}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ComponentLibrary
