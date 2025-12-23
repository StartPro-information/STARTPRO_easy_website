import React from 'react'
import { motion } from 'framer-motion'
import { TemplateComponent } from '@/types/templates'

// 高级英雄区块预览
export const PremiumHeroPreview: React.FC<{ component: TemplateComponent }> = ({ component }) => {
  const { title, subtitle, backgroundImage, buttonText, buttonLink, backgroundColor, widthOption = 'full', backgroundColorOption = 'default' } = component.props
  const [bgImageLoaded, setBgImageLoaded] = React.useState(false)
  const [bgImageError, setBgImageError] = React.useState(false)
  
  // 预加载背景图片
  React.useEffect(() => {
    if (backgroundImage) {
      setBgImageLoaded(false)
      setBgImageError(false)
      const img = new Image()
      img.onload = () => setBgImageLoaded(true)
      img.onerror = () => setBgImageError(true)
      img.src = backgroundImage
    } else {
      setBgImageLoaded(false)
      setBgImageError(false)
    }
  }, [backgroundImage])
  
  const shouldShowBackgroundImage = backgroundImage && bgImageLoaded && !bgImageError

  // 根据宽度选项设置容器类名
  const containerClass = widthOption === 'standard' ? 'max-w-screen-2xl mx-auto' : 'w-full';
  // 根据背景色选项设置组件内部背景色
  const componentClass = backgroundColorOption === 'transparent' ? '' : 'bg-color-surface';

  return (
    <div className={containerClass}>
      <div className={componentClass}>
    <div
      className="relative h-[600px] lg:h-[700px] flex items-center justify-center text-white rounded-xl overflow-hidden group transition-all duration-300"
      style={{
        backgroundImage: shouldShowBackgroundImage
          ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.5)), url(${backgroundImage})`
          : backgroundColorOption === 'transparent'
            ? undefined
            : backgroundColor || '#667eea',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* 背景粒子效果 */}
      {!shouldShowBackgroundImage && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float delay-1000"></div>
          <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-white/5 rounded-full blur-3xl animate-float delay-2000"></div>
        </div>
      )}
      
      {/* 图片加载提示 */}
      {backgroundImage && !bgImageLoaded && !bgImageError && (
        <div className="absolute inset-0 bg-gray-600 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto mb-2"></div>
            <p className="text-white/70 text-sm">加载背景图片...</p>
          </div>
        </div>
      )}
      
      {/* 图片加载错误 */}
      {backgroundImage && bgImageError && (
        <div className="absolute top-2 right-2 bg-red-500/80 text-white text-xs px-2 py-1 rounded">
          背景图片加载失败
        </div>
      )}
      
      {/* 主内容 */}
      <motion.div 
        className="relative text-center max-w-6xl px-8 z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h1 
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/90"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          {title || '引领科技 创新未来'}
        </motion.h1>
        
        {subtitle && (
          <motion.p 
            className="text-xl md:text-2xl lg:text-3xl mb-12 opacity-95 leading-relaxed font-light max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            {subtitle}
          </motion.p>
        )}
        
        {buttonText && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <motion.a 
              href={buttonLink || '#'}
              className="inline-flex items-center px-10 py-5 bg-white text-gray-900 rounded-full font-bold text-xl shadow-2xl hover:shadow-white/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 group-hover:shadow-white/30"
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>{buttonText}</span>
              <motion.div 
                className="ml-3 text-2xl"
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                →
              </motion.div>
            </motion.a>
          </motion.div>
        )}
      </motion.div>
      
      {/* 底部装饰元素 - 仅在非透明模式下显示 */}
      {backgroundColorOption !== 'transparent' && (
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/30 to-transparent"></div>
      )}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.8 }}
      >
        <div className="flex flex-col items-center space-y-2 text-white/70">
          <span className="text-sm">向下滚动探索更多</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </div>
      </motion.div>
    </div>
  </div>
</div>
  )
}

// 高级统计数据区块预览
export const PremiumStatsPreview: React.FC<{ component: TemplateComponent }> = ({ component }) => {
  const { title, subtitle, stats = [], widthOption = 'full', backgroundColorOption = 'default' } = component.props
  
  // 根据宽度选项设置容器类名
  const containerClass = widthOption === 'standard' ? 'max-w-screen-2xl mx-auto' : 'w-full';
  // 根据背景色选项设置组件内部背景色
  const componentClass = backgroundColorOption === 'transparent' ? 'py-20 rounded-xl' : 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 py-20 rounded-xl';

  return (
    <div className={containerClass}>
      <div className={componentClass}>
      <div className="max-w-7xl mx-auto px-8">
        {title && (
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">{title}</h2>
            {subtitle && <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">{subtitle}</p>}
          </motion.div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat: any, index: number) => (
            <motion.div
              key={index}
              className="text-center group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-tech-accent to-tech-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl">
                <span className="text-4xl text-white">{stat.icon || '📊'}</span>
              </div>
              <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-tech-accent transition-colors">
                {stat.value || '0'}
              </div>
              <div className="text-lg text-gray-600 dark:text-gray-400">
                {stat.label || '统计项'}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </div>
  )
}

// 高级特色网格预览
export const PremiumFeatureGridPreview: React.FC<{ component: TemplateComponent }> = ({ component }) => {
  const { title, subtitle, features = [], widthOption = 'full', backgroundColorOption = 'default' } = component.props
  
  // 根据宽度选项设置容器类名
  const containerClass = widthOption === 'standard' ? 'max-w-screen-2xl mx-auto' : 'w-full';
  // 根据背景色选项设置组件内部背景色
  const componentClass = backgroundColorOption === 'transparent' ? 'py-20 rounded-xl' : 'py-20 bg-white dark:bg-gray-800 rounded-xl';

  return (
    <div className={containerClass}>
      <div className={componentClass}>
      <div className="max-w-7xl mx-auto px-8">
        {title && (
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">{title}</h2>
            {subtitle && <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">{subtitle}</p>}
          </motion.div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature: any, index: number) => (
            <motion.div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
            >
              <div className="w-16 h-16 mb-6 rounded-xl bg-gradient-to-r from-tech-accent to-tech-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl text-white">{feature.icon || '⚡'}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-tech-accent transition-colors">
                {feature.title || '特色标题'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description || '特色描述'}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </div>
  )
}

// 高级客户评价预览
export const PremiumTestimonialsPreview: React.FC<{ component: TemplateComponent }> = ({ component }) => {
  const { title, subtitle, testimonials = [], widthOption = 'full', backgroundColorOption = 'default' } = component.props
  
  // 根据宽度选项设置容器类名
  const containerClass = widthOption === 'standard' ? 'max-w-screen-2xl mx-auto' : 'w-full';
  // 根据背景色选项设置组件内部背景色
  const componentClass = backgroundColorOption === 'transparent' ? 'py-20 rounded-xl' : 'py-20 bg-gradient-to-r from-tech-light/10 to-tech-secondary/10 rounded-xl';

  return (
    <div className={containerClass}>
      <div className={componentClass}>
      <div className="max-w-7xl mx-auto px-8">
        {title && (
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">{title}</h2>
            {subtitle && <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">{subtitle}</p>}
          </motion.div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial: any, index: number) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-tech-accent to-tech-secondary flex items-center justify-center mr-4">
                  {testimonial.avatar ? (
                    <img
                      key={`${testimonial.avatar}-${index}`}
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <span className="text-white text-xl">👤</span>
                  )}
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {testimonial.name || '姓名'}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">
                    {testimonial.role || '职位'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                {Array.from({ length: testimonial.rating || 5 }, (_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">★</span>
                ))}
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 italic">
                "{testimonial.content || '客户评价内容'}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </div>
  )
}

// 高级价格方案预览
export const PremiumPricingPreview: React.FC<{ component: TemplateComponent }> = ({ component }) => {
  const { title, subtitle, plans = [], widthOption = 'full', backgroundColorOption = 'default' } = component.props
  
  // 根据宽度选项设置容器类名
  const containerClass = widthOption === 'standard' ? 'max-w-screen-2xl mx-auto' : 'w-full';
  // 根据背景色选项设置组件内部背景色
  const componentClass = backgroundColorOption === 'transparent' ? 'py-20 rounded-xl' : 'py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl';

  return (
    <div className={containerClass}>
      <div className={componentClass}>
      <div className="max-w-7xl mx-auto px-8">
        {title && (
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">{title}</h2>
            {subtitle && <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">{subtitle}</p>}
          </motion.div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan: any, index: number) => (
            <motion.div
              key={index}
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ${
                plan.recommended 
                  ? 'ring-2 ring-tech-accent transform scale-105 lg:scale-110 lg:z-10' 
                  : 'hover:shadow-2xl'
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: plan.recommended ? -5 : -10 }}
            >
              {plan.recommended && (
                <div className="bg-tech-accent text-white text-center py-2 font-bold">
                  推荐方案
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name || '方案名称'}
                </h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">
                    ¥{plan.price || '0'}
                  </span>
                  {plan.period && (
                    <span className="text-gray-600 dark:text-gray-400">/{plan.period}</span>
                  )}
                </div>
                
                <ul className="mb-8 space-y-4">
                  {plan.features?.map((feature: string, featureIndex: number) => (
                    <li key={featureIndex} className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <motion.a
                  href={plan.buttonLink || '#'}
                  className={`w-full py-3 px-6 rounded-lg font-bold text-center transition-all duration-300 ${
                    plan.recommended
                      ? 'bg-tech-accent text-white hover:bg-tech-secondary'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {plan.buttonText || '选择方案'}
                </motion.a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </div>
  )
}

export const premiumComponentPreviews = {
  'premium-hero': PremiumHeroPreview,
  'premium-stats': PremiumStatsPreview,
  'premium-feature-grid': PremiumFeatureGridPreview,
  'premium-testimonials': PremiumTestimonialsPreview,
  'premium-pricing': PremiumPricingPreview
}
