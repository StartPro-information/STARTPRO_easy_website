import React from 'react'
import { TemplateComponent } from '@/types/templates'
import { motion } from 'framer-motion'

export const PricingCardsPreview: React.FC<{ component: TemplateComponent }> = ({ component }) => {
  const {
    title,
    subtitle,
    plans = [],
    widthOption = 'full',
    backgroundColorOption = 'default',
    cardsPerRow = 3
  } = component.props

  const parsedPerRow = Number.isFinite(Number(cardsPerRow)) ? Math.max(1, Math.min(6, Number(cardsPerRow))) : 3
  const gridCols =
    parsedPerRow === 1
      ? 'grid-cols-1'
      : parsedPerRow === 2
        ? 'grid-cols-1 md:grid-cols-2'
        : parsedPerRow === 3
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          : parsedPerRow === 4
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
            : parsedPerRow === 5
              ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
              : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'

  const containerClass = widthOption === 'standard' ? 'max-w-screen-2xl mx-auto' : 'w-full'
  const componentClass =
    backgroundColorOption === 'transparent'
      ? 'pricing-cards-preview p-8 rounded-xl'
      : 'pricing-cards-preview bg-gradient-to-br from-color-background to-color-surface p-8 rounded-xl'

  return (
    <div className={containerClass}>
      <div className={componentClass}>
        {title && (
          <motion.div
            className="pricing-cards-header text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="pricing-cards-title text-4xl md:text-5xl font-bold mb-6 text-text-primary">{title}</h2>
            {subtitle && (
              <p className="pricing-cards-subtitle text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
                {subtitle}
              </p>
            )}
          </motion.div>
        )}

        <div className={`pricing-cards-grid grid ${gridCols} gap-8 w-full`}>
          {plans.map((plan: any, index: number) => {
            const recommended = Boolean(plan.recommended)
            const planLink = plan.link || plan.buttonLink || ''
            return (
              <motion.div
                key={index}
                className={`pricing-card relative rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 group ${
                  recommended
                    ? 'border-color-border hover:border-primary bg-color-surface'
                    : 'border-primary bg-gradient-to-br from-primary/5 to-color-surface scale-[1.02] lg:scale-[1.04]'
                }`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -8, scale: recommended ? 1.04 : 1.06 }}
              >
                {recommended && (
                  <motion.div
                    className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10"
                    initial={{ scale: 0, rotate: -12 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: index * 0.1 + 0.5, type: 'spring', stiffness: 200 }}
                  >
                    <span
                      className="px-8 py-3 rounded-full text-base font-bold shadow-lg whitespace-nowrap tracking-wide border"
                      style={{
                        backgroundColor: 'var(--color-text-primary)',
                        borderColor: 'var(--color-text-primary)',
                        color: 'var(--color-background)'
                      }}
                    >
                      推荐
                    </span>
                  </motion.div>
                )}

                <div className="relative z-10">
                  <div className="pricing-card-info text-center mb-8">
                    <h3 className="pricing-card-name text-2xl font-bold mb-4 text-text-primary group-hover:text-primary transition-colors">
                      {plan.name || '方案名称'}
                    </h3>
                    <div className="pricing-card-price mb-6">
                      <span className="text-5xl font-bold text-text-primary">¥{plan.price || '0'}</span>
                      <span className="text-lg text-text-secondary ml-2">/{plan.period || '月'}</span>
                    </div>
                  </div>

                  <ul className="pricing-card-features space-y-4 mb-8">
                    {(plan.features || []).map((feature: string, featureIndex: number) => (
                      <motion.li
                        key={featureIndex}
                        className="pricing-card-feature flex items-center text-text-secondary"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + featureIndex * 0.1 + 0.3 }}
                      >
                        <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <svg className="w-3 h-3 text-text-primary" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span>{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  {planLink ? (
                    <motion.a
                      href={planLink}
                      className={`pricing-card-button w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform text-center inline-flex items-center justify-center ${
                        recommended
                          ? 'bg-color-surface text-primary border border-primary hover:bg-primary hover:text-white'
                          : 'bg-color-surface text-text-primary hover:bg-primary hover:text-text-primary'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      查看方案
                    </motion.a>
                  ) : (
                    <motion.button
                      className={`pricing-card-button w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform ${
                        recommended
                          ? 'bg-color-surface text-primary border border-primary'
                          : 'bg-color-surface text-text-primary hover:bg-primary hover:text-text-primary'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      查看方案
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// 联系表单预览
