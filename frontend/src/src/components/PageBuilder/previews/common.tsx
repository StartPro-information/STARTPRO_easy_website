import React from 'react'

const assetUrlRegex = /\.(png|jpe?g|gif|webp|svg|avif)$/i

export const isAssetUrl = (value?: string) => {
  if (!value || typeof value !== 'string') return false
  const trimmed = value.trim()
  if (!trimmed) return false
  if (trimmed.startsWith('data:')) return true
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('//')) return true
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('/system-default/')) return true
  if (trimmed.startsWith('/')) return assetUrlRegex.test(trimmed)
  return assetUrlRegex.test(trimmed)
}

export const isInlineSvg = (value?: string) => {
  if (!value || typeof value !== 'string') return false
  return value.trim().startsWith('<svg')
}

export const sanitizeInlineSvg = (value: string) =>
  value
    .replace(/\\n/g, '')
    .replace(/\\"/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/width="[^"]*"/g, 'width="100%"')
    .replace(/height="[^"]*"/g, 'height="100%"')

export const getIconColorStyle = (props?: Record<string, any>) => {
  if (props?.iconColorMode === 'custom' && typeof props.iconColor === 'string' && props.iconColor.trim()) {
    return { color: props.iconColor }
  }
  return undefined
}

export const renderIconVisual = (
  iconValue: any,
  {
    wrapperClassName = 'w-10 h-10 flex items-center justify-center',
    imageClassName = 'w-full h-full object-contain',
    colorStyle
  }: {
    wrapperClassName?: string
    imageClassName?: string
    colorStyle?: React.CSSProperties
  } = {}
) => {
  const useCustomColor = Boolean(colorStyle && colorStyle.color)

  if (typeof iconValue === 'string') {
    if (isAssetUrl(iconValue)) {
      if (useCustomColor) {
        return (
          <div
            className={wrapperClassName}
            style={{
              backgroundColor: colorStyle?.color || 'currentColor',
              WebkitMaskImage: `url(${iconValue})`,
              maskImage: `url(${iconValue})`,
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskPosition: 'center',
              WebkitMaskSize: 'contain',
              maskSize: 'contain'
            }}
          />
        )
      }
      return (
        <img
          src={iconValue}
          alt="图标"
          className={imageClassName}
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
          }}
        />
      )
    }

    if (isInlineSvg(iconValue)) {
      return (
        <div
          className={wrapperClassName}
          style={colorStyle}
          dangerouslySetInnerHTML={{ __html: sanitizeInlineSvg(iconValue) }}
        />
      )
    }

    return (
      <span className="text-2xl" style={colorStyle}>
        {iconValue}
      </span>
    )
  }

  return <div className={wrapperClassName} />
}
