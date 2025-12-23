import React from 'react'
import { TemplateComponent } from '@/types/templates'
import { renderIconVisual, getIconColorStyle } from './common'

export const TimelinePreview: React.FC<{ component: TemplateComponent }> = ({ component }) => {
  const { title, subtitle, events = [], widthOption = 'full', backgroundColorOption = 'default' } = component.props
  const iconColorStyle = getIconColorStyle(component.props)

  const axisStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-text-primary, #1F2937)'
  }

  const maskColor =
    backgroundColorOption === 'transparent'
      ? 'var(--color-background, #F8FAFC)'
      : 'var(--color-surface, #FFFFFF)'

  const containerClass = widthOption === 'standard' ? 'max-w-screen-2xl mx-auto' : 'w-full'
  const componentClass =
    backgroundColorOption === 'transparent'
      ? 'timeline-preview p-8 rounded-lg shadow-sm'
      : 'timeline-preview bg-color-surface p-8 rounded-lg shadow-sm'

  return (
    <div className={containerClass}>
      <div className={componentClass}>
        {title && (
          <div className="timeline-header text-center mb-12">
            <h2 className="timeline-title text-3xl font-bold mb-4 text-text-primary">{title}</h2>
            {subtitle && <p className="timeline-subtitle text-lg text-text-secondary w-full">{subtitle}</p>}
          </div>
        )}
        <div className="timeline-content w-full">
          <div className="timeline-events relative space-y-12">
            <div className="absolute left-10 top-0 bottom-0 w-px rounded-full pointer-events-none" style={axisStyle} />
            {events.map((event: any, index: number) => (
              <div key={index} className="timeline-event relative pl-24 md:pl-32">
                <div className="timeline-event-marker absolute left-2 top-0 flex flex-col items-center w-16">
                  <div className="relative">
                    <div
                      className="absolute left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
                      style={{
                        width: '6px',
                        height: '72px',
                        top: '-4px',
                        backgroundColor: maskColor,
                        zIndex: 5
                      }}
                    />
                    <div className="absolute inset-0 rounded-full blur-xl bg-primary/30" />
                    <div
                      className="timeline-event-icon relative w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white text-xl z-10"
                      style={{
                        boxShadow: '0 15px 30px rgba(var(--color-primary-rgb, 59, 130, 246), 0.35)'
                      }}
                    >
                      {renderIconVisual(event.icon, {
                        wrapperClassName: 'w-8 h-8 flex items-center justify-center',
                        imageClassName: 'w-8 h-8 object-contain',
                        colorStyle: iconColorStyle
                      })}
                    </div>
                  </div>
                </div>
                <div className="timeline-event-content bg-color-background/95 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-primary/10">
                  <div className="timeline-event-date text-sm font-medium text-text-secondary mb-1">
                    {event.date || '日期'}
                  </div>
                  <h3 className="timeline-event-title text-lg font-semibold text-text-primary mb-2">
                    {event.title || '事件标题'}
                  </h3>
                  <p className="timeline-event-description text-text-secondary">
                    {event.description || '事件描述'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
