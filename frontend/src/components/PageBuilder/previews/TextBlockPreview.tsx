import React from 'react'
import { TemplateComponent } from '@/types/templates'

export const TextBlockPreview: React.FC<{ component: TemplateComponent }> = ({ component }) => {
  const { title, content, widthOption = 'full', backgroundColorOption = 'default', alignment = 'left' } = component.props

  const containerClass = widthOption === 'standard' ? 'max-w-screen-2xl mx-auto' : 'w-full'
  const componentClass =
    backgroundColorOption === 'transparent'
      ? 'text-block-preview pt-4 pb-5 px-5 rounded-lg'
      : 'text-block-preview bg-color-surface pt-4 pb-5 px-5 rounded-lg'
  const alignClass = alignment === 'center' ? 'text-center' : alignment === 'right' ? 'text-right' : 'text-left'

  return (
    <div className={containerClass}>
      <div className={componentClass}>
        {title && (
          <h2 className={`text-block-title text-3xl font-bold mb-4 text-text-primary leading-tight ${alignClass}`}>
            {title}
          </h2>
        )}
        {content ? (
          <div
            className={`text-block-content prose prose-lg max-w-none text-text-secondary leading-relaxed ${alignClass}`}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <div className={`text-block-content text-text-tertiary italic ${alignClass}`}>在这里输入文本内容...</div>
        )}
      </div>
    </div>
  )
}
