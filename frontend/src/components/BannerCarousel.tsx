import React, { useState, useEffect, useRef } from 'react'

interface Slide {
  image: string
  title: string
  description: string
  buttonText: string
  buttonLink: string
  overlayPosition: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
}

interface BannerCarouselProps {
  slides: Slide[]
  autoPlay?: boolean
  interval?: number
  showIndicators?: boolean
  showArrows?: boolean
  imageHeightMode?: 'fixed' | 'auto'
  className?: string
  titleColorMode?: 'default' | 'custom'
  customTitleColor?: string
  subtitleColorMode?: 'default' | 'custom'
  customSubtitleColor?: string
  buttonColorMode?: 'default' | 'custom'
  customButtonColor?: string
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({
  slides = [],
  autoPlay = true,
  interval = 5000,
  showIndicators = true,
  showArrows = true,
  imageHeightMode = 'fixed',
  className = '',
  titleColorMode = 'default',
  customTitleColor = '',
  subtitleColorMode = 'default',
  customSubtitleColor = '',
  buttonColorMode = 'default',
  customButtonColor = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const useAutoHeight = imageHeightMode === 'auto'

  // 获取文字叠加位置的CSS类
  const getOverlayPositionClass = (position: Slide['overlayPosition']) => {
    switch (position) {
      case 'top-left':
        return 'top-8 left-8 text-left'
      case 'top-center':
        return 'top-8 left-1/2 transform -translate-x-1/2 text-center'
      case 'top-right':
        return 'top-8 right-8 text-right'
      case 'center-left':
        return 'top-1/2 left-8 transform -translate-y-1/2 text-left'
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center'
      case 'center-right':
        return 'top-1/2 right-8 transform -translate-y-1/2 text-right'
      case 'bottom-left':
        return 'bottom-8 left-8 text-left'
      case 'bottom-center':
        return 'bottom-8 left-1/2 transform -translate-x-1/2 text-center'
      case 'bottom-right':
        return 'bottom-8 right-8 text-right'
      default:
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center'
    }
  }

  // 切换到指定幻灯片
  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  // 切换到下一张幻灯片
  const goToNextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length)
  }

  // 切换到上一张幻灯片
  const goToPrevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length)
  }

  // 开始自动播放
  const startAutoPlay = () => {
    if (autoPlay && slides.length > 1) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      intervalRef.current = setInterval(goToNextSlide, interval)
    }
  }

  // 停止自动播放
  const stopAutoPlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  // 初始化和清理
  useEffect(() => {
    startAutoPlay()
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [currentIndex, autoPlay, interval, slides.length])

  // 鼠标悬停时暂停自动播放
  const handleMouseEnter = () => {
    stopAutoPlay()
  }

  const handleMouseLeave = () => {
    startAutoPlay()
  }

  if (slides.length === 0) {
    return (
      <div className={`relative w-full h-96 bg-gray-200 dark:bg-gray-700 overflow-hidden ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">🖼️</div>
            <p className="text-gray-600 dark:text-gray-400">暂无幻灯片内容</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={carouselRef}
      className={`relative w-full overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 幻灯片容器 */}
      <div 
        className={`relative w-full ${useAutoHeight ? '' : 'h-96 md:h-[500px]'} transition-transform duration-500 ease-in-out`}
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        <div className={`flex w-full ${useAutoHeight ? '' : 'h-full'}`}>
          {slides.map((slide, index) => (
            <div 
              key={index} 
              className={`relative w-full flex-shrink-0 ${useAutoHeight ? '' : 'h-full'}`}
            >
              {/* 背景图片 */}
              {useAutoHeight && slide.image ? (
                <img
                  src={slide.image}
                  alt={slide.title || 'banner'}
                  className="w-full h-auto block"
                />
              ) : (
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.image})` }}
                />
              )}
              
              
              {/* 文字叠加 */}
              <div className={`absolute max-w-md md:max-w-lg px-4 md:px-8 z-10 ${getOverlayPositionClass(slide.overlayPosition)}`}>
                <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-xl p-6 md:p-8">
                  {slide.title && (
                    <h2
                      className="text-2xl md:text-4xl font-bold text-text-primary mb-3 md:mb-4 leading-tight"
                      style={
                        titleColorMode === 'custom' && customTitleColor
                          ? { color: customTitleColor }
                          : undefined
                      }
                    >
                      {slide.title}
                    </h2>
                  )}
                  {slide.description && (
                    <p
                      className="text-base md:text-lg text-text-secondary mb-4 md:mb-6 opacity-90"
                      style={
                        subtitleColorMode === 'custom' && customSubtitleColor
                          ? { color: customSubtitleColor }
                          : undefined
                      }
                    >
                      {slide.description}
                    </p>
                  )}
                  {slide.buttonText && (
                    <a
                      href={slide.buttonLink || '#'}
                      className="inline-block px-6 py-3 bg-tech-accent text-white font-medium rounded-lg hover:bg-tech-secondary transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      style={
                        buttonColorMode === 'custom' && customButtonColor
                          ? { color: customButtonColor }
                          : undefined
                      }
                    >
                      {slide.buttonText}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 导航箭头 */}
      {showArrows && slides.length > 1 && (
        <>
          <button
            onClick={goToPrevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-3 rounded-full transition-all duration-300 z-20"
            aria-label="上一张"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-3 rounded-full transition-all duration-300 z-20"
            aria-label="下一张"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* 指示器 */}
      {showIndicators && slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white w-6' 
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
              aria-label={`切换到第${index + 1}张幻灯片`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default BannerCarousel
