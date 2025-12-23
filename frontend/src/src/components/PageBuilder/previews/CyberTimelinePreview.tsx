import React from 'react'
import { TemplateComponent } from '@/types/templates'

interface TimelineTag {
  label: string
  highlighted?: boolean
}

const normalizeTags = (tags?: any, fallbackHighlight?: string): TimelineTag[] => {
  if (!tags && !fallbackHighlight) return []

  const applyHighlight = (label: string, highlighted?: boolean): TimelineTag | null => {
    const normalizedLabel = (label || '').trim()
    if (!normalizedLabel) return null
    return {
      label: normalizedLabel,
      highlighted: highlighted ?? (fallbackHighlight ? normalizedLabel === fallbackHighlight : false)
    }
  }

  if (Array.isArray(tags)) {
    return tags
      .map(tag => {
        if (typeof tag === 'string') {
          return applyHighlight(tag, undefined)
        }
        if (typeof tag === 'object' && tag !== null) {
          return applyHighlight(tag.label ?? '', tag.highlighted)
        }
        return null
      })
      .filter((tag): tag is TimelineTag => Boolean(tag))
  }

  if (typeof tags === 'string') {
    return tags
      .split(/[,，]/)
      .map(tag => applyHighlight(tag, undefined))
      .filter((tag): tag is TimelineTag => Boolean(tag))
  }

  if (!tags && fallbackHighlight) {
    return [{ label: fallbackHighlight, highlighted: true }]
  }

  return []
}

export const CyberTimelinePreview: React.FC<{ component: TemplateComponent }> = ({ component }) => {
  const {
    title,
    subtitle,
    events = [],
    widthOption = 'full',
    backgroundColorOption = 'default'
  } = component.props
  const containerClass = widthOption === 'standard' ? 'max-w-6xl mx-auto' : 'w-full'
  const widthVariantClass =
    widthOption === 'standard' ? 'cyber-timeline-shell--standard' : 'cyber-timeline-shell--full'
  const backgroundVariantClass =
    backgroundColorOption === 'transparent'
      ? 'cyber-timeline-shell--transparent'
      : 'cyber-timeline-shell--default'

  return (
    <section className={`${containerClass} cyber-timeline-shell ${widthVariantClass} ${backgroundVariantClass}`}>
      <div className="relative z-10 px-6 sm:px-12">
        {(title || subtitle) && (
          <header className="text-center mb-12 text-text-primary">
            {title && <h2 className="text-4xl font-bold tracking-tight">{title}</h2>}
            {subtitle && <p className="mt-3 text-text-secondary text-lg">{subtitle}</p>}
          </header>
        )}

        <div className="cyber-timeline-events">
          <div className="cyber-timeline-axis" />
          {events.map((event: any, index: number) => {
            const pills = normalizeTags(event.tags, event.highlightTag)

            return (
              <article
                key={`${event.title}-${index}`}
                className={`cyber-timeline-event ${index % 2 === 1 ? 'is-right' : 'is-left'}`}
              >
                <div className="cyber-timeline-node" />

                {(() => {
                  const CardTag: any = event.link ? 'a' : 'div'
                  const isExternal = typeof event.link === 'string' && event.link.startsWith('http')
                  const cardProps = event.link
                    ? {
                        href: event.link,
                        target: isExternal ? '_blank' : undefined,
                        rel: isExternal ? 'noopener noreferrer' : undefined
                      }
                    : {}

                  return (
                    <CardTag
                      {...cardProps}
                      className={`cyber-timeline-card ${event.link ? 'cyber-timeline-card--link' : ''}`}
                    >
                      <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
                        {event.phase && <span className="cyber-timeline-badge">{event.phase}</span>}
                        {event.date && (
                          <span className="cyber-timeline-duration">
                            <span role="img" aria-label="time">
                              🛠
                            </span>
                            <span className="ml-1">{event.date}</span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-semibold text-text-primary mb-3">{event.title || '阶段标题'}</h3>
                      <p className="text-text-secondary leading-relaxed">{event.description || '阶段描述内容'}</p>
                      {pills.length > 0 && (
                        <div className="cyber-timeline-tags">
                          {pills.map((tag: TimelineTag, pillIndex: number) => (
                            <span
                              key={`${tag.label}-${pillIndex}`}
                              className={`cyber-timeline-tag ${tag.highlighted ? 'is-active' : ''}`}
                            >
                              {tag.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardTag>
                  )
                })()}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
