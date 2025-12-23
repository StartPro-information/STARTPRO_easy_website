import React from 'react'
import { TemplateComponent } from '@/types/templates'

export const VideoPlayerPreview: React.FC<{ component: TemplateComponent }> = ({ component }) => {
  const {
    title,
    description,
    videoUrl,
    poster,
    autoPlay = false,
    loop = false,
    muted = true,
    controls = true,
    widthOption = 'full',
    backgroundColorOption = 'default'
  } = component.props || {}

  const containerClass = widthOption === 'standard' ? 'max-w-5xl mx-auto' : 'w-full'
  const shellClass =
    backgroundColorOption === 'transparent'
      ? 'overflow-hidden'
      : 'overflow-hidden bg-theme-surface shadow-lg'
  const metaClass =
    backgroundColorOption === 'transparent'
      ? 'p-4'
      : 'p-4 bg-theme-surfaceAlt'

  const renderVideo = () => {
    if (!videoUrl) {
      return (
        <div className="aspect-video w-full bg-black/60 text-white/80 flex flex-col items-center justify-center gap-2">
          <div className="text-4xl">🎞️</div>
          <p className="text-sm">请选择要播放的视频</p>
        </div>
      )
    }

    return (
      <video
        className="block w-full aspect-video bg-black"
        src={videoUrl}
        poster={poster || undefined}
        controls={controls !== false}
        autoPlay={autoPlay === true}
        loop={loop === true}
        muted={muted !== false || autoPlay === true}
        playsInline
      >
        Your browser does not support video playback.
      </video>
    )
  }

  return (
    <div className={containerClass}>
      <div className={shellClass}>
        {renderVideo()}

        {(title || description) && (
          <div className={`${metaClass} space-y-1`}>
            {title && <h4 className="text-lg font-semibold text-theme-textPrimary">{title}</h4>}
            {description && <p className="text-sm text-theme-textSecondary leading-relaxed">{description}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
