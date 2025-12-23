import React, { useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { TemplateComponent } from '@/types/templates'

export const ProductShowcaseCardPreview: React.FC<{ component: TemplateComponent }> = ({ component }) => {
  const {
    alignment = 'center',
    cardsPerRow = 1,
    widthOption = 'full',
    backgroundColorOption = 'default',
    cards = []
  } = component.props

  const cardsData = Array.isArray(cards) && cards.length > 0
    ? cards
    : [
        {
          eyebrow: '新品',
          title: 'AirPods Pro 3',
          subtitle: 'The world’s best in-ear Active Noise Cancellation.',
          badgeText: '更强的低噪、空间音频与更长续航。',
          image: 'https://dummyimage.com/1200x800/edf2f7/0f172a&text=Product',
          primaryButtonText: '了解更多',
          primaryButtonLink: '#',
          secondaryButtonText: '购买',
          secondaryButtonLink: '#'
        }
      ]

  const parsedPerRow = Number.isFinite(Number(cardsPerRow)) ? Math.max(1, Math.min(6, Number(cardsPerRow))) : 1
  const gridCols =
    parsedPerRow === 1
      ? 'grid-cols-1'
      : parsedPerRow === 2
        ? 'grid-cols-1 md:grid-cols-2'
        : parsedPerRow === 3
          ? 'grid-cols-1 md:grid-cols-3'
          : parsedPerRow === 4
            ? 'grid-cols-1 md:grid-cols-4'
            : parsedPerRow === 5
              ? 'grid-cols-2 md:grid-cols-5'
              : 'grid-cols-2 md:grid-cols-6'

  const containerClass = `${widthOption === 'standard' ? 'max-w-screen-2xl mx-auto' : 'w-full'} px-4 md:px-6`
  const textAlignClass = alignment === 'left' ? 'items-start text-left' : 'items-center text-center'
  const buttonJustifyClass = alignment === 'left' ? 'justify-start' : 'justify-center'
  const bgClass =
    backgroundColorOption === 'transparent'
      ? 'bg-theme-surfaceAlt/35 backdrop-blur-sm shadow-sm'
      : 'bg-theme-surface shadow-lg'
  const overlayFrom = backgroundColorOption === 'transparent' ? 'from-primary/8 via-primary/4' : 'from-primary/12 via-primary/7'
  const accentBlur = backgroundColorOption === 'transparent' ? 'bg-primary/6' : 'bg-primary/9'
  const accentTextBlur = backgroundColorOption === 'transparent' ? 'bg-theme-textPrimary/5' : 'bg-theme-textPrimary/8'

  const eyebrowRefs = useRef<(HTMLDivElement | null)[]>([])
  const titleRefs = useRef<(HTMLDivElement | null)[]>([])
  const subtitleRefs = useRef<(HTMLDivElement | null)[]>([])
  const badgeRefs = useRef<(HTMLDivElement | null)[]>([])
  const [maxHeights, setMaxHeights] = useState({
    eyebrow: 0,
    title: 0,
    subtitle: 0,
    badge: 0
  })

  useLayoutEffect(() => {
    const measure = () => {
      const next = {
        eyebrow: Math.max(0, ...eyebrowRefs.current.map(el => el?.getBoundingClientRect().height || 0)),
        title: Math.max(0, ...titleRefs.current.map(el => el?.getBoundingClientRect().height || 0)),
        subtitle: Math.max(0, ...subtitleRefs.current.map(el => el?.getBoundingClientRect().height || 0)),
        badge: Math.max(0, ...badgeRefs.current.map(el => el?.getBoundingClientRect().height || 0))
      }
      setMaxHeights(next)
    }

    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [cardsData])

  return (
    <div className={containerClass}>
      <div className="grid gap-6">
        <div className={`grid ${gridCols} gap-6 items-stretch`}>
          {cardsData.map((card, idx) => (
            <div
              key={idx}
              className={`relative overflow-hidden ${bgClass} px-6 md:px-10 pt-10 pb-0 shadow-md w-full flex flex-col`}
            >
              <>
                <div className={`absolute inset-0 bg-gradient-to-b ${overlayFrom} to-transparent pointer-events-none`} />
                <div className={`absolute -left-10 -top-6 w-44 h-44 ${accentBlur} blur-3xl rounded-full pointer-events-none`} />
                <div className={`absolute -right-6 bottom-0 w-52 h-52 ${accentTextBlur} blur-3xl rounded-full pointer-events-none`} />
              </>

              <div className="relative flex flex-col h-full">
                <div className={`flex flex-col gap-3 ${textAlignClass}`}>
                  <div
                    className="flex items-center justify-center"
                    ref={(el) => {
                      eyebrowRefs.current[idx] = el
                    }}
                    style={maxHeights.eyebrow ? { minHeight: `${maxHeights.eyebrow}px` } : undefined}
                  >
                    {card.eyebrow && (
                      <span className="inline-flex items-center px-4 py-1 text-xs font-semibold rounded-full bg-primary/15 text-primary">
                        {card.eyebrow}
                      </span>
                    )}
                  </div>

                  <div
                    className="flex items-center justify-center"
                    ref={(el) => {
                      titleRefs.current[idx] = el
                    }}
                    style={maxHeights.title ? { minHeight: `${maxHeights.title}px` } : undefined}
                  >
                    {card.title && (
                      <h2 className="text-3xl md:text-4xl font-bold leading-tight text-theme-textPrimary">
                        {card.title}
                      </h2>
                    )}
                  </div>

                  <div
                    className="flex items-center justify-center"
                    ref={(el) => {
                      subtitleRefs.current[idx] = el
                    }}
                    style={maxHeights.subtitle ? { minHeight: `${maxHeights.subtitle}px` } : undefined}
                  >
                    {card.subtitle && (
                      <p className="text-lg md:text-xl text-theme-textSecondary leading-relaxed max-w-3xl">
                        {card.subtitle}
                      </p>
                    )}
                  </div>

                  <div
                    className="flex items-center justify-center"
                    ref={(el) => {
                      badgeRefs.current[idx] = el
                    }}
                    style={maxHeights.badge ? { minHeight: `${maxHeights.badge}px` } : undefined}
                  >
                    {card.badgeText && (
                      <p className="text-sm text-theme-textSecondary leading-relaxed">{card.badgeText}</p>
                    )}
                  </div>

                  {(card.primaryButtonText || card.secondaryButtonText) && (
                    <div className={`flex flex-wrap gap-3 ${buttonJustifyClass}`}>
                      {card.primaryButtonText && (
                        <motion.a
                          href={card.primaryButtonLink || '#'}
                          className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold shadow-md hover:shadow-primary/25 transition-transform duration-200"
                          style={{
                            backgroundColor: 'var(--color-text-primary, #1F2937)',
                            color: 'var(--color-background, #ffffff)'
                          }}
                          whileHover={{ y: -2, scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          {card.primaryButtonText}
                        </motion.a>
                      )}
                      {card.secondaryButtonText && (
                        <motion.a
                          href={card.secondaryButtonLink || '#'}
                          className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-theme-surfaceAlt text-theme-textPrimary hover:border-primary/80 hover:text-primary transition-colors duration-200 border border-theme-divider"
                          whileHover={{ y: -2, scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          {card.secondaryButtonText}
                        </motion.a>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-1" />

                <motion.div
                  className={`relative w-full flex ${alignment === 'left' ? 'justify-start' : 'justify-center'} mt-auto`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="absolute inset-x-6 md:inset-x-16 bottom-0 h-20 bg-gradient-to-t from-black/8 via-primary/6 to-transparent blur-3xl pointer-events-none" />
                  <div className="relative w-full max-w-4xl h-[260px] md:h-[300px] flex items-end justify-center">
                    {card.image ? (
                      <img
                        src={card.image}
                        alt={card.title || '产品图片'}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full border border-dashed border-theme-divider bg-theme-surfaceAlt flex items-center justify-center text-theme-textSecondary">
                        暂无产品图片
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
