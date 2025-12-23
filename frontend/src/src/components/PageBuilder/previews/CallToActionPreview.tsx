import React from 'react'
import { TemplateComponent } from '@/types/templates'

export const CallToActionPreview: React.FC<{ component: TemplateComponent }> = ({ component }) => {
  const {title, subtitle, buttonText, buttonLink, backgroundColor, widthOption = 'full', backgroundColorOption = 'default'} = component.props

  // 根据宽度选项设置容器类名（外层容器保持透明）
  const containerClass = `${widthOption === 'standard' ? 'max-w-screen-2xl mx-auto' : 'w-full'}`;

  // 根据背景色选项决定是否使用背景色：透明模式下不设置背景色，否则使用用户指定的背景色
  const ctaStyle = backgroundColorOption === 'transparent'
    ? {}
    : (backgroundColor ? { backgroundColor } : {});

  return (
    <div className={containerClass}>
      <div
        className="call-to-action-preview p-12 rounded-lg text-center text-text-primary relative overflow-hidden dark:text-white"
        style={ctaStyle}
      >
      <div className="call-to-action-content relative z-10">
        <h2 className="call-to-action-title text-4xl font-bold mb-6 text-text-primary dark:text-white">{title || '立即开始行动'}</h2>
        {subtitle && <p className="call-to-action-subtitle text-xl mb-8 opacity-90 w-full leading-relaxed text-text-secondary dark:text-white">{subtitle}</p>}
        {buttonText && (
          <a
            href={buttonLink || '#'}
            className="call-to-action-button inline-block bg-text-primary text-color-background px-8 py-4 rounded-lg font-medium hover:bg-color-surface hover:text-text-primary transition-all duration-300 transform hover:scale-105 shadow-lg dark:bg-text-primary dark:text-color-background"
          >
            {buttonText}
          </a>
        )}
      </div>

      {/* 装饰性背景元素 */}
      <div className="call-to-action-decoration-1 absolute top-0 right-0 w-32 h-32 bg-text-primary/10 rounded-full -mr-16 -mt-16"></div>
      <div className="call-to-action-decoration-2 absolute bottom-0 left-0 w-24 h-24 bg-text-primary/10 rounded-full -ml-12 -mb-12"></div>
    </div>
  </div>
  )
}

// FAQ问答预览
