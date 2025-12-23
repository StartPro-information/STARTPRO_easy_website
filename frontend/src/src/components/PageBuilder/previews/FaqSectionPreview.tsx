import React from 'react'
import { TemplateComponent } from '@/types/templates'

export const FaqSectionPreview: React.FC<{ component: TemplateComponent }> = ({ component }) => {
  const {title, subtitle, faqs = [], widthOption = 'full', backgroundColorOption = 'default'} = component.props

  // 根据宽度选项设置容器类名
  const containerClass = widthOption === 'standard' ? 'max-w-screen-2xl mx-auto' : 'w-full';

    // 根据背景色选项设置组件内部背景色
  const componentClass = backgroundColorOption === 'transparent' ? 'faq-section-preview p-8 rounded-lg shadow-sm' : 'faq-section-preview bg-color-surface p-8 rounded-lg shadow-sm';
return (
    <div className={containerClass}>
      <div className={componentClass}>
      {title && (
        <div className="faq-section-header text-center mb-12">
          <h2 className="faq-section-title text-3xl font-bold mb-4 text-text-primary">{title}</h2>
          {subtitle && <p className="faq-section-subtitle text-lg text-text-secondary max-w-2xl mx-auto">{subtitle}</p>}
        </div>
      )}
      <div className="faq-list w-full space-y-4">
        {faqs.map((faq: any, index: number) => (
          <div key={index} className={`faq-item border border-color-border rounded-lg ${backgroundColorOption === 'transparent' ? '' : 'bg-color-background'}`}>
            <div className="faq-item-content p-6">
              <h3 className="faq-question font-semibold text-text-primary mb-3 flex items-center">
                <span className="faq-question-number w-6 h-6 bg-primary text-text-primary rounded-full flex items-center justify-center text-sm mr-3">
                  {index + 1}
                </span>
                {faq.question || 'FAQ问题'}
              </h3>
              <p className="faq-answer text-text-secondary leading-relaxed pl-9">
                {faq.answer || 'FAQ答案内容'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
  )
}

// 统计数据预览
