import { colorThemes } from './themes'

const fallbackIntensity = {
  borderWeight: 1.5,
  shadowStep: 0.5,
  hoverScale: 1.02,
  accentGlow: 0.25
}

const getIntensity = (themeId?: string) => {
  if (!themeId) return fallbackIntensity
  const theme = colorThemes.find(item => item.id === themeId)
  return theme?.intensity || fallbackIntensity
}

export const getHoverStyle = (themeId?: string) => {
  const intensity = getIntensity(themeId)
  return {
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    transform: `scale(${intensity.hoverScale})`,
    boxShadow: `0 16px calc(32px * ${intensity.shadowStep}) rgba(15, 23, 42, ${0.08 * intensity.shadowStep})`
  }
}

export const getShadowStyle = (themeId?: string, level: number = 1) => {
  const intensity = getIntensity(themeId)
  const depth = Math.max(0.2, intensity.shadowStep * level)
  return {
    boxShadow: `0 ${12 * level}px calc(28px * ${depth}) rgba(15, 23, 42, ${0.08 * depth})`
  }
}

export const getAccentGlow = (themeId?: string, colorVar = 'var(--semantic-hero-accent)') => {
  const intensity = getIntensity(themeId)
  const glow = intensity.accentGlow
  return {
    boxShadow: `0 0 ${60 * glow}px ${colorVar}`,
    filter: `drop-shadow(0 0 ${20 * glow}px ${colorVar})`
  }
}
