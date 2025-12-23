import React from 'react'
import { TemplateComponent } from '@/types/templates'
import { renderIconVisual, getIconColorStyle } from './common'

export const ServiceGridPreview: React.FC<{ component: TemplateComponent }> = ({ component }) => {
  const {title = '我们的服务', subtitle = '提供专业的解决方案，满足您的各种需求', services = [], widthOption = 'full', backgroundColorOption = 'default'} = component.props || {}
  const iconColorStyle = getIconColorStyle(component.props)

  // 根据宽度选项设置容器类名
  const containerClass = `${widthOption === 'standard' ? 'max-w-screen-2xl mx-auto' : 'w-full'} ${backgroundColorOption === 'transparent' ? '' : 'bg-color-surface'}`;

  // 如果services为空，提供默认的演示数据
  const displayServices = services.length > 0 ? services : [
    { title: '专业开发', description: '提供高质量的软件开发服务', icon: 'code', features: ['定制开发', '技术支持', '持续维护'] },
    { title: '系统集成', description: '将不同系统无缝整合', icon: 'server', features: ['数据迁移', '接口对接', '系统优化'] },
    { title: '安全保障', description: '确保您的系统和数据安全', icon: 'shield', features: ['漏洞评估', '安全加固', '监控预警'] }
  ]

  return (
    <div className={containerClass}>
      <div className={`p-8 rounded-lg shadow-sm ${backgroundColorOption === 'transparent' ? '' : 'bg-color-surface'}`}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4 text-text-primary">{title}</h2>
        {subtitle && <p className="text-lg text-text-secondary w-full">{subtitle}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayServices.map((service: any, index: number) => (
          <div key={index} className="bg-color-background rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mb-6">
              {renderIconVisual(service.icon, {
                wrapperClassName: 'text-text-primary text-2xl flex items-center justify-center w-10 h-10',
                imageClassName: 'w-10 h-10 object-contain',
                colorStyle: iconColorStyle
              })}
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-4">
              {service.title || '服务标题'}
            </h3>
            <p className="text-text-secondary mb-6">
              {service.description || '服务描述'}
            </p>
            {service.features && service.features.length > 0 && (
              <ul className="space-y-2">
                {service.features.map((feature: string, featureIndex: number) => (
                  <li key={featureIndex} className="flex items-center text-sm text-text-secondary">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
  )
}

// Logo墙预览
