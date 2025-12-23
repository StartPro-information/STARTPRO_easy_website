import React, { useEffect, useMemo, useState } from 'react'
import { TemplateComponent } from '@/types/templates'

interface ShowcaseControl {
  id?: string
  label?: string
  title?: string
  icon?: string
  iconColor?: string
  image?: string
  description?: string
  imageDescription?: string
}

const FALLBACK_CONTROLS: ShowcaseControl[] = [
  {
    id: 'ops',
    label: '运营&反馈',
    title: '运营&反馈',
    icon: '✨',
    iconColor: '#7dd3fc',
    image: '/images/banners/banner1.jpg',
    description: '采集关键运营指标并实时响应用户反馈。',
    imageDescription: '运营界面用流光特效展示任务状态与反馈列表。'
  },
  {
    id: 'knowledge',
    label: '知识库',
    title: '知识库',
    icon: '🗂️',
    iconColor: '#c084fc',
    image: '/images/banners/banner2.jpg',
    description: '沉淀知识案例，支撑多对话通道与流程编排。',
    imageDescription: '知识建模界面展示文档、标签与权限提示。'
  },
  {
    id: 'automation',
    label: '智能自动化',
    title: '智能自动化',
    icon: '🤖',
    iconColor: '#facc15',
    image: '/images/hero-bg.jpg',
    description: '组合 RPA 与 AI 模型，搭建自动化 SOP。',
    imageDescription: '流程脑图呈现数据流与执行节点的实时状态。'
  }
]

const isAssetLike = (value?: string) => {
  if (!value) return false
  return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/') || value.startsWith('data:')
}

const isSvgAssetUrl = (value?: string) => {
  if (!isAssetLike(value)) return false
  if (!value) return false
  const normalized = value.toLowerCase()
  return normalized.includes('.svg') || normalized.startsWith('data:image/svg+xml')
}

const isSvgContent = (value?: string) => {
  if (!value) return false
  return value.trim().startsWith('<svg')
}

const applyAlphaToHex = (color: string, alpha: number) => {
  if (!color || !color.startsWith('#')) return undefined
  let hex = color.replace('#', '')
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(char => char + char)
      .join('')
  }
  if (hex.length !== 6) return undefined
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const normalizeSvgColor = (svg: string, color?: string) => {
  if (!color) return svg
  let processed = svg
    .replace(/fill=(['"])(?!none).*?\1/gi, 'fill="currentColor"')
    .replace(/stroke=(['"])(?!none).*?\1/gi, 'stroke="currentColor"')

  if (!/fill=/i.test(processed)) {
    processed = processed.replace('<svg', '<svg fill="currentColor"')
  }
  if (!/stroke=/i.test(processed)) {
    processed = processed.replace('<svg', '<svg stroke="currentColor"')
  }

  return processed
}

const cleanText = (value?: string) => (typeof value === 'string' ? value.trim() : '')

export const CyberShowcasePreview: React.FC<{ component: TemplateComponent }> = ({ component }) => {
  const {
    controls,
    widthOption = 'full',
    backgroundColorOption = 'default',
    imagePosition = 'right'
  } = component.props || {}

  const showcaseControls = useMemo<ShowcaseControl[]>(() => {
    if (Array.isArray(controls) && controls.length > 0) {
      return controls
    }
    return FALLBACK_CONTROLS
  }, [controls])

  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (activeIndex > showcaseControls.length - 1) {
      setActiveIndex(0)
    }
  }, [activeIndex, showcaseControls.length])

  const containerClass = widthOption === 'standard' ? 'max-w-screen-xl mx-auto' : 'w-full'
  const variantClass =
    backgroundColorOption === 'transparent' ? 'cyber-showcase--transparent' : 'cyber-showcase--default'
  const positionClass = imagePosition === 'left' ? 'is-image-left' : 'is-image-right'

  const activeItem = showcaseControls[activeIndex] || showcaseControls[0]
  const activeTitle = cleanText(activeItem?.title) || cleanText(activeItem?.label) || `展示项 ${activeIndex + 1}`
  const activeDescription = cleanText(activeItem?.description)
  const activeCaption = cleanText(activeItem?.imageDescription)

  return (
    <section className={containerClass}>
      <div className={`cyber-showcase ${variantClass} ${positionClass}`}>
        <div className="cyber-showcase__inner">
          <div className="cyber-showcase__content">
            <div>
              <h3 className="cyber-showcase__title">{activeTitle}</h3>
              {activeDescription && (
                <p className="cyber-showcase__description whitespace-pre-line">{activeDescription}</p>
              )}
            </div>

            <div className="cyber-showcase__controls">
              {showcaseControls.map((control, index) => {
                const accent = control.iconColor?.trim() || ''
                const labelStyle = accent ? ({ color: accent } as React.CSSProperties) : undefined
                return (
                  <button
                    key={control.id || `${control.label}-${index}`}
                    type="button"
                    className={`cyber-showcase__control ${index === activeIndex ? 'is-active' : ''}`}
                    onClick={() => setActiveIndex(index)}
                  >
                    {control.icon && (
                      <span
                        className="cyber-showcase__control-icon"
                        style={
                          accent
                            ? ({
                                color: accent
                              } as React.CSSProperties)
                            : undefined
                        }
                      >
                        {isAssetLike(control.icon) ? (
                          isSvgAssetUrl(control.icon) ? (
                            <span
                              className="cyber-showcase__icon-mask"
                              style={
                                accent
                                  ? ({
                                      backgroundColor: accent,
                                      WebkitMaskImage: `url(${control.icon})`,
                                      maskImage: `url(${control.icon})`
                                    } as React.CSSProperties)
                                  : ({
                                      WebkitMaskImage: `url(${control.icon})`,
                                      maskImage: `url(${control.icon})`
                                    } as React.CSSProperties)
                              }
                            />
                          ) : (
                            <img
                              src={control.icon}
                              alt={control.label || '展示图标'}
                              className="w-5 h-5 object-contain"
                            />
                          )
                        ) : isSvgContent(control.icon) ? (
                          <span
                            dangerouslySetInnerHTML={{
                              __html: normalizeSvgColor(control.icon, accent)
                            }}
                          />
                        ) : (
                          control.icon
                        )}
                      </span>
                    )}
                    <span className="cyber-showcase__control-label" style={labelStyle}>
                      {control.label || `展示项${index + 1}`}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="cyber-showcase__visual">
            {activeItem?.image ? (
              <>
                <img
                  src={activeItem.image}
                  alt={activeItem.label || `展示项${activeIndex + 1}`}
                  className="cyber-showcase__image"
                />
                {activeCaption && (
                  <div className="cyber-showcase__caption">
                    {activeItem.icon && (
                      <span
                        className="cyber-showcase__caption-pill"
                        style={
                          activeItem.iconColor
                            ? ({
                                borderColor: activeItem.iconColor,
                                color: activeItem.iconColor,
                                backgroundColor: applyAlphaToHex(activeItem.iconColor, 0.15)
                              } as React.CSSProperties)
                            : undefined
                        }
                      >
                        {isAssetLike(activeItem.icon) && !isSvgContent(activeItem.icon) ? (
                          isSvgAssetUrl(activeItem.icon) ? (
                            <span
                              className="cyber-showcase__icon-mask caption"
                              style={
                                activeItem.iconColor
                                  ? ({
                                      backgroundColor: activeItem.iconColor,
                                      WebkitMaskImage: `url(${activeItem.icon})`,
                                      maskImage: `url(${activeItem.icon})`
                                    } as React.CSSProperties)
                                  : ({
                                      WebkitMaskImage: `url(${activeItem.icon})`,
                                      maskImage: `url(${activeItem.icon})`
                                    } as React.CSSProperties)
                              }
                            />
                          ) : (
                            <img src={activeItem.icon} alt="caption icon" className="w-4 h-4 object-contain" />
                          )
                        ) : isSvgContent(activeItem.icon) ? (
                          <span
                            dangerouslySetInnerHTML={{
                              __html: normalizeSvgColor(activeItem.icon, activeItem.iconColor)
                            }}
                          />
                        ) : (
                          activeItem.icon
                        )}
                      </span>
                    )}
                    <div>
                      {activeItem.label && (
                        <div className="cyber-showcase__caption-label">{activeItem.label}</div>
                      )}
                      <p className="cyber-showcase__caption-text">{activeCaption}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="cyber-showcase__image-placeholder">
                <span role="img" aria-label="placeholder">
                  🖼️
                </span>
                <p>为按钮配置对应的图片资源</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
