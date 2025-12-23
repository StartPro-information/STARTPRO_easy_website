import React from 'react'
import { TemplateComponent } from '@/types/templates'

export const ContentSectionPreview: React.FC<{ component: TemplateComponent }> = ({ component }) => {
  const {title = '内容区块标题', content = '这是一段示例内容，展示了内容区块的基本格式和样式。', features = [], widthOption = 'full', backgroundColorOption = 'default'} = component.props || {}

  // 根据宽度选项设置容器类名
  const containerClass = `${widthOption === 'standard' ? 'max-w-screen-2xl mx-auto' : 'w-full'} ${backgroundColorOption === 'transparent' ? '' : 'bg-color-surface'}`;

  // 如果features为空，提供默认的演示数据
  const displayFeatures = features.length > 0 ? features : [
    { title: '特色功能 1', description: '这是特色功能的详细描述文本', icon: '✓' },
    { title: '特色功能 2', description: '这是特色功能的详细描述文本', icon: '✓' },
    { title: '特色功能 3', description: '这是特色功能的详细描述文本', icon: '✓' }
  ]

  return (
    <div className={containerClass}>
      <div className="bg-color-surface p-8 rounded-lg shadow-sm w-full">
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-text-primary leading-tight">
              {title}
            </h2>
            <div className="prose prose-lg max-w-none mb-8">
              <p className="text-text-secondary leading-relaxed">
                {content}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {displayFeatures.map((feature: any, index: number) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-text-primary text-xl">{feature.icon || '✓'}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {feature.title || '特色标题'}
                  </h3>
                  <p className="text-text-secondary">
                    {feature.description || '特色描述'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}

// 服务网格预览
