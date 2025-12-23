import React from 'react'
import { TemplateComponent } from '@/types/templates'
import { motion } from 'framer-motion'
import { renderIconVisual, getIconColorStyle } from './common'

export const StatsSectionPreview: React.FC<{ component: TemplateComponent }> = ({ component }) => {
  const { title, subtitle, stats = [], widthOption = 'full', backgroundColorOption = 'default', textColorMode = 'gradient', textColor = '' } = component.props
  const iconColorStyle = getIconColorStyle(component.props)

  // 外层仅控制宽度，不再设置背景，避免和内层同色遮住圆角
  const containerClass = `${widthOption === 'standard' ? 'max-w-screen-2xl mx-auto' : 'w-full'}`

  const toRgba = (hex: string, alpha: number) => {
    const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((hex || '').trim())
    if (!match) return ''
    let value = match[1]
    if (value.length === 3) {
      value = value.split('').map(ch => ch + ch).join('')
    }
    const r = parseInt(value.substring(0, 2), 16)
    const g = parseInt(value.substring(2, 4), 16)
    const b = parseInt(value.substring(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const gradientColor = textColorMode === 'solid' && textColor ? textColor : 'var(--color-text-primary)'
  const alphaStop =
    textColorMode === 'solid' && textColor
      ? toRgba(textColor, 0.65) || textColor
      : 'rgba(var(--color-text-primary-rgb), 0.7)'
  const gradientString = `linear-gradient(90deg, ${gradientColor} 0%, ${alphaStop} 60%, ${gradientColor} 100%)`

  const valueStyle = {
    backgroundImage: gradientString
  } as React.CSSProperties
  const valueClass = 'stat-value text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-text-primary/90'

  return (
    <div className={containerClass}>
      <div
        className={`stats-section-preview relative p-12 rounded-2xl text-text-primary overflow-hidden ${
          backgroundColorOption === 'transparent' ? 'bg-transparent' : 'bg-color-surface'
        }`}
      >

        <div className="stats-section-content relative z-10">
          {title && (
            <motion.div
              className="stats-section-header text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="stats-section-title text-4xl md:text-5xl font-bold mb-6 text-text-primary">{title}</h2>
              {subtitle && (
                <p className="stats-section-subtitle text-xl md:text-2xl opacity-90 w-full leading-relaxed font-light text-text-secondary">
                  {subtitle}
                </p>
              )}
            </motion.div>
          )}

          <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat: any, index: number) => (
              <motion.div
                key={index}
                className="stat-item text-center group"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <div className="stat-icon-container relative mb-4 mx-auto w-20 h-20 flex items-center justify-center">
                  <div className="stat-icon-background absolute inset-0 bg-text-primary/20 rounded-2xl group-hover:scale-110 transition-transform duration-300"></div>
                  <div className="stat-icon relative text-4xl transform group-hover:scale-110 transition-transform duration-300">
                    {renderIconVisual(stat.icon, {
                      wrapperClassName: 'w-12 h-12 flex items-center justify-center',
                      imageClassName: 'w-12 h-12 object-contain',
                      colorStyle: iconColorStyle
                    })}
                  </div>
                </div>

                <motion.div
                  className={valueClass}
                  style={valueStyle}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                >
                  {stat.value || '0'}
                </motion.div>

                <div className="stat-label text-sm md:text-base opacity-80 font-medium tracking-wide uppercase text-text-primary">
                  {stat.label || '统计标签'}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-text-primary/50 to-transparent"></div>
      </div>
    </div>
  )
}

// 时间线预览
