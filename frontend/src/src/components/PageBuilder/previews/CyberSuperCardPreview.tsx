import React, { useMemo } from 'react'
import { TemplateComponent } from '@/types/templates'
import { getIconColorStyle, renderIconVisual } from './common'

interface SuperCardTag {
  label: string
  highlighted?: boolean
}

interface SuperCardItem {
  id?: string
  title?: string
  description?: string
  icon?: string
  iconColor?: string
  image?: string
  tags?: any
  link?: string
}

const FALLBACK_CARDS: SuperCardItem[] = [
  {
    id: 'fallback-1',
    title: '幻觉控制和优化',
    description: '通过召回得分设置和应答策略选择，可有效控制 LLM 带来的幻觉影响，守住内容可信度。',
    icon: '/system-default/icons/ai-vision.svg',
    iconColor: '#0ea5e9',
    image: '/images/banners/banner1.jpg',
    tags: [
      { label: 'LLM 策略', highlighted: true },
      { label: '推理守卫' }
    ]
  },
  {
    id: 'fallback-2',
    title: '上下文守护',
    description: '自动注入安全上下文与审计提示，保障跨业务场景的回答合规，减少人工覆核成本。',
    icon: '/system-default/icons/context-shield.svg',
    iconColor: '#a855f7',
    image: '/images/banners/banner2.jpg',
    tags: [
      { label: '安全沙箱' },
      { label: '动态提示', highlighted: true }
    ]
  },
  {
    id: 'fallback-3',
    title: '智能洞察面板',
    description: '实时监控用户反馈、性能指标与对话热点，异常数据将被高亮并推送治理建议。',
    icon: '/system-default/icons/insight-gauge.svg',
    iconColor: '#22d3ee',
    image: '/images/hero-bg.jpg',
    tags: [
      { label: '实时监控' },
      { label: '绿色通道', highlighted: true }
    ]
  }
]

const clampCardsPerRow = (value: any) => {
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return 3
  return Math.min(6, Math.max(1, Math.floor(numeric)))
}

const normalizeTags = (tags?: any): SuperCardTag[] => {
  if (!tags) return []
  if (Array.isArray(tags)) {
    return tags
      .map(tag => {
        if (typeof tag === 'string') {
          const label = tag.trim()
          return label ? { label } : null
        }
        if (typeof tag === 'object' && tag !== null) {
          const label = typeof tag.label === 'string' ? tag.label.trim() : ''
          if (!label) return null
          return { label, highlighted: Boolean(tag.highlighted) }
        }
        return null
      })
      .filter((tag): tag is SuperCardTag => Boolean(tag))
  }

  if (typeof tags === 'string') {
    return tags
      .split(/[,，、]/)
      .map(part => part.trim())
      .filter(Boolean)
      .map(label => ({ label }))
  }

  return []
}

const gridClassMap: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
  6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
}

const alignmentClassMap: Record<string, string> = {
  left: 'is-align-left',
  center: 'is-align-center',
  right: 'is-align-right'
}

const getCardAlignmentClass = (alignment: string) => alignmentClassMap[alignment] || alignmentClassMap.left

export const CyberSuperCardPreview: React.FC<{ component: TemplateComponent }> = ({ component }) => {
  const {
    widthOption = 'full',
    backgroundColorOption = 'default',
    cardsPerRow = 3,
    layoutMode = 'default',
    visualMode = 'icon',
    alignment = 'left',
    hoverEffect = true,
    flowingLight = true,
    iconFrame = true,
    cards = []
  } = component.props || {}

  const parsedCards = useMemo<SuperCardItem[]>(() => {
    if (Array.isArray(cards) && cards.length > 0) {
      return cards
    }
    return FALLBACK_CARDS
  }, [cards])

  const perRow = clampCardsPerRow(cardsPerRow)
  const containerClass = widthOption === 'standard' ? 'max-w-screen-2xl mx-auto' : 'w-full'
  const backgroundClass =
    backgroundColorOption === 'transparent' ? 'cyber-super-card-shell--transparent' : 'cyber-super-card-shell--default'
  const gridCols = gridClassMap[perRow] || gridClassMap[3]
  const gridTightClass = layoutMode === 'tight' ? 'cyber-super-card-grid--tight' : ''
  const visualModeClass =
    visualMode === 'image' ? 'cyber-super-card-grid--image-mode' : 'cyber-super-card-grid--icon-mode'
  const hoverableClass = hoverEffect ? 'cyber-super-card--hoverable' : ''
  const flowClass = flowingLight ? 'cyber-super-card-shell--flowing' : ''
  const iconFrameClass = iconFrame ? 'cyber-super-card-grid--framed-icons' : ''
  const alignmentClass = getCardAlignmentClass(alignment)

  return (
    <section className={containerClass}>
      <div className={`cyber-super-card-shell ${backgroundClass} ${flowClass}`}>
        <div
          className={`cyber-super-card-grid grid ${gridCols} ${gridTightClass} ${visualModeClass} ${iconFrameClass} ${alignmentClass}`}
        >
          {parsedCards.map((card, index) => {
            const contentAlignment = getCardAlignmentClass(alignment)
            const tags = normalizeTags(card.tags)
            const CardElement: React.ElementType = card.link ? 'a' : 'article'
            const isExternal = typeof card.link === 'string' && card.link.startsWith('http')
            const cardProps = card.link
              ? {
                  href: card.link,
                  target: isExternal ? '_blank' : undefined,
                  rel: isExternal ? 'noopener noreferrer' : undefined
                }
              : {}

            const description = typeof card.description === 'string' ? card.description.trim() : ''
            const iconColorStyle = getIconColorStyle({ iconColorMode: 'custom', iconColor: card.iconColor })

            const showImageVisual = visualMode === 'image' && card.image

            return (
              <CardElement
                key={card.id || `${card.title}-${index}`}
                className={`cyber-super-card ${hoverableClass} ${contentAlignment}`}
                {...cardProps}
              >
                {showImageVisual ? (
                  <div className="cyber-super-card__visual">
                    <img src={card.image} alt={card.title || '赛博超级卡片'} className="cyber-super-card__visual-img" />
                  </div>
                ) : (
                  <div className="cyber-super-card__icon">
                    <div className="cyber-super-card__icon-glow" style={iconColorStyle || undefined} />
                    <div
                      className="cyber-super-card__icon-frame"
                      style={
                        iconColorStyle?.color
                          ? ({
                              color: iconColorStyle.color
                            } as React.CSSProperties)
                          : undefined
                      }
                    >
                      {renderIconVisual(card.icon || '✨', {
                        wrapperClassName: 'cyber-super-card__icon-visual',
                        imageClassName: 'cyber-super-card__icon-image',
                        colorStyle: iconColorStyle
                      })}
                    </div>
                  </div>
                )}

                <div className="cyber-super-card__body">
                  <div className="cyber-super-card__heading">
                    <p className="cyber-super-card__eyebrow">CYBER MODULE</p>
                    <h3 className="cyber-super-card__title">{card.title || `赛博卡片 ${index + 1}`}</h3>
                  </div>
                  {description && (
                    <p className="cyber-super-card__description whitespace-pre-line">{description}</p>
                  )}

                  {tags.length > 0 && (
                    <div className="cyber-super-card__tags">
                      {tags.map((tag, tagIndex) => (
                        <span
                          key={`${card.id || card.title}-${tag.label}-${tagIndex}`}
                          className={`cyber-super-card__tag ${tag.highlighted ? 'is-highlighted' : ''}`}
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardElement>
            )
          })}
        </div>
      </div>
    </section>
  )
}
