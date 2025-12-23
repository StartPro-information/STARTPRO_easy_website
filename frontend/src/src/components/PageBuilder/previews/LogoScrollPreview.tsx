import React from 'react'
import { TemplateComponent } from '@/types/templates'

export const LogoScrollPreview: React.FC<{ component: TemplateComponent }> = ({ component }) => {
  const {
    title = '合作伙伴',
    subtitle = '值得信赖的合作伙伴网络',
    logos = [],
    height,
    widthOption = 'full',
    backgroundColorOption = 'default',
    scrollSpeed
  } = component.props || {}

  const heightSetting = (height || component.props?.logoHeight || component.props?.heightOption || 'low') as
    | 'low'
    | 'high'
    | 'medium'
  const speedSetting = (scrollSpeed || component.props?.logoScrollSpeed || 'slow') as 'slow' | 'fast'

  const containerClass = `${widthOption === 'standard' ? 'max-w-screen-2xl mx-auto' : 'w-full'} ${
    backgroundColorOption === 'transparent' ? '' : 'bg-color-surface'
  }`

  const displayLogos = logos.length > 0
    ? logos
    : Array.from({ length: 8 }).map((_, idx) => ({ alt: `合作伙伴 ${idx + 1}`, image: '' }))

  const getImageMaxHeightStyle = () => {
    switch (heightSetting) {
      case 'high':
        return { maxHeight: '160px' }
      case 'medium':
      case 'low':
      default:
        return { maxHeight: '80px' }
    }
  }

  const desktopDuration = speedSetting === 'fast' ? 8 : 14
  const mobileDuration = Math.max(desktopDuration - 3, 6)

  return (
    <div className={containerClass}>
      <div className={`p-8 rounded-lg shadow-sm w-full ${backgroundColorOption === 'transparent' ? '' : 'bg-color-surface'}`}>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 text-text-primary">{title}</h2>
          {subtitle && <p className="text-lg text-text-secondary">{subtitle}</p>}
        </div>

        <div className="relative overflow-hidden py-4 max-w-full">
          <div className="flex animate-scroll">
            {Array(3)
              .fill(0)
              .map((_, groupIndex) => (
                <div key={groupIndex} className="flex flex-shrink-0">
                  {displayLogos.map((logo: any, index: number) => (
                    <div
                      key={`${groupIndex}-${index}`}
                      className="mx-8 inline-flex items-center"
                      style={getImageMaxHeightStyle()}
                    >
                      {logo.image ? (
                        <img
                          src={logo.image}
                          alt={logo.alt || `Logo ${index + 1}`}
                          className="max-h-full max-w-full object-contain transition-opacity duration-300"
                          onError={(e) => {
                            console.error('Logo image failed to load:', logo.image)
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="text-text-tertiary flex items-center justify-center w-24">
                          <div className="text-2xl">🏢</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
          </div>
        </div>

        <style jsx>{`
          .animate-scroll {
            animation: scroll ${desktopDuration}s linear infinite;
          }

          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-33.333%);
            }
          }

          @media (max-width: 768px) {
            .animate-scroll {
              animation-duration: ${mobileDuration}s;
            }

            div[class*='mx-8'] {
              margin-left: 1rem;
              margin-right: 1rem;
            }
          }
        `}</style>
      </div>
    </div>
  )
}

// 链接区块预览
