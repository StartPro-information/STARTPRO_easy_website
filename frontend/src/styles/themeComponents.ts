import type { ThemeComponentStyles, ColorTheme, ThemeOverrides } from './themes'
import { colorThemes, DEFAULT_THEME_OVERRIDES } from './themes'

const getThemeById = (themeId: string): ColorTheme => {
  return colorThemes.find(theme => theme.id === themeId) || colorThemes[0]
}

const hexToRgb = (hex: string): [number, number, number] => {
  const normalized = hex.replace('#', '')
  const bigint = parseInt(normalized, 16)
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255]
}

const hexToRgba = (hex: string, alpha = 1) => {
  const [r, g, b] = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const getContrastColor = (hex: string): string => {
  const [r, g, b] = hexToRgb(hex)
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return luminance > 0.55 ? '#0B1120' : '#FFFFFF'
}

const varName = (themeId: string, token: string) => `--theme-${themeId}-${token}`

export const componentThemes: ThemeComponentStyles = {
  header: {
    base: {
      backgroundColor: 'var(--semantic-panel-bg, var(--color-surface))',
      color: 'var(--color-text-primary)',
      boxShadow: '0 4px 6px -1px rgba(var(--color-text-muted-rgb), 0.08), 0 2px 4px -1px rgba(var(--color-text-muted-rgb), 0.04)',
      transition: 'all 0.3s ease'
    },
    scrolled: {
      backgroundColor: 'rgba(var(--color-surface-rgb), 0.95)',
      boxShadow: '0 10px 25px rgba(var(--color-text-muted-rgb), 0.12)',
      backdropFilter: 'blur(10px)'
    }
  },
  footer: {
    base: {
      backgroundColor: 'var(--semantic-panel-bg, var(--color-surface))',
      color: 'var(--color-text-primary)',
      borderTop: '1px solid var(--semantic-panel-border, var(--color-divider))'
    }
  },
  button: {
    base: {
      padding: '0.5rem 1.25rem',
      borderRadius: 'calc(0.5rem * var(--theme-radius-scale, 1))',
      transition: 'all 0.2s ease'
    },
    primary: {
      backgroundColor: 'var(--semantic-cta-primary-bg, var(--color-primary))',
      color: 'var(--semantic-cta-primary-text, #FFFFFF)',
      border: 'none'
    },
    secondary: {
      backgroundColor: 'transparent',
      color: 'var(--color-text-primary)',
      border: '1px solid var(--semantic-cta-secondary-border, var(--color-border))'
    }
  },
  card: {
    base: {
      backgroundColor: 'var(--semantic-panel-bg, var(--color-surface))',
      borderRadius: 'calc(0.75rem * var(--theme-radius-scale, 1))',
      border: '1px solid var(--semantic-panel-border, var(--color-border))',
      boxShadow: '0 10px 20px rgba(15, 23, 42, 0.05)'
    }
  }
}

export const createIsolatedComponentTheme = (themeId: string) => {
  const theme = getThemeById(themeId)
  return {
    nav: {
      background: `var(${varName(themeId, 'nav-bg')}, ${theme.colors.surface})`,
      text: `var(${varName(themeId, 'nav-text')}, ${theme.colors.text.primary})`,
      border: `var(${varName(themeId, 'nav-border')}, rgba(${hexToRgb(theme.colors.text.muted).join(',')}, 0.1))`,
      hover: `var(${varName(themeId, 'nav-hover')}, ${theme.colors.text.primary})`,
      active: `var(${varName(themeId, 'nav-active')}, ${theme.colors.primary})`,
      dropdownBg: `var(${varName(themeId, 'nav-dropdown-bg')}, ${theme.colors.surface})`,
      dropdownBorder: `var(${varName(themeId, 'nav-dropdown-border')}, rgba(${hexToRgb(theme.colors.text.muted).join(',')}, 0.08))`,
      shadow: `var(${varName(themeId, 'nav-shadow')}, rgba(${hexToRgb(theme.colors.accent).join(',')}, 0.12))`
    },
    footer: {
      background: `var(${varName(themeId, 'footer-bg')}, ${theme.colors.surface})`,
      text: `var(${varName(themeId, 'footer-text')}, ${theme.colors.text.primary})`,
      border: `var(${varName(themeId, 'footer-border')}, rgba(${hexToRgb(theme.colors.text.muted).join(',')}, 0.1))`
    },
    semantic: {
      panelBg: `var(${varName(themeId, 'semantic-panel-bg')}, ${theme.semantic.panelBg})`,
      heroBg: `var(${varName(themeId, 'semantic-hero-bg')}, ${theme.semantic.heroBg})`,
      ctaPrimary: `var(${varName(themeId, 'semantic-cta-primary-bg')}, ${theme.semantic.ctaPrimaryBg})`
    }
  }
}

const removeIsolatedVariables = (root: HTMLElement) => {
  const toRemove: string[] = []
  for (let i = 0; i < root.style.length; i++) {
    const name = root.style.item(i)
    if (name && name.startsWith('--theme-')) {
      toRemove.push(name)
    }
  }
  toRemove.forEach(name => root.style.removeProperty(name))
}

const setIsolatedVar = (root: HTMLElement, themeId: string, token: string, value: string | number) => {
  root.style.setProperty(varName(themeId, token), String(value))
}

export const applyIsolatedThemeVariables = (themeId: string, overrides?: ThemeOverrides) => {
  const theme = getThemeById(themeId)
  const root = document.documentElement
  removeIsolatedVariables(root)

  const mergedOverrides: ThemeOverrides = { ...DEFAULT_THEME_OVERRIDES, ...overrides }

  const setVar = (token: string, value: string | number) => setIsolatedVar(root, themeId, token, value)

  setVar('nav-bg', theme.colors.surface)
  setVar('nav-text', theme.colors.text.primary)
  setVar('nav-border', hexToRgba(theme.colors.text.muted, 0.1))
  setVar('nav-hover', theme.colors.text.primary)
  setVar('nav-active', theme.colors.primary)
  setVar('nav-dropdown-bg', theme.colors.surface)
  setVar('nav-dropdown-border', hexToRgba(theme.colors.text.muted, 0.1))
  setVar('nav-shadow', hexToRgba(theme.colors.accent, 0.12))

  setVar('footer-bg', theme.colors.surface)
  setVar('footer-text', theme.colors.text.primary)
  setVar('footer-border', hexToRgba(theme.colors.text.muted, 0.1))

  setVar('card-bg', theme.colors.surface)
  setVar('card-text', theme.colors.text.primary)
  setVar('card-border', hexToRgba(theme.colors.text.muted, 0.2))

  setVar('button-primary-bg', theme.colors.primary)
  setVar('button-primary-text', '#FFFFFF')
  setVar('button-secondary-border', theme.colors.primary)

  setVar('input-bg', theme.colors.surface)
  setVar('input-text', theme.colors.text.primary)
  setVar('input-border', hexToRgba(theme.colors.text.muted, 0.2))
  setVar('input-placeholder', theme.colors.text.muted)

  setVar('neutral-border', theme.neutral.border)
  setVar('neutral-divider', theme.neutral.divider)
  setVar('neutral-surface-alt', theme.neutral.surfaceAlt)

  theme.visual.series.forEach((color, index) => {
    setVar(`visual-series-${index + 1}`, color)
  })
  setVar('visual-grid', theme.visual.grid)
  setVar('visual-tooltip-bg', theme.visual.tooltipBg)
  setVar('visual-tooltip-text', theme.visual.tooltipText)
  setVar('visual-positive', theme.visual.positive)
  setVar('visual-negative', theme.visual.negative)

  setVar('semantic-panel-bg', theme.semantic.panelBg)
  setVar('semantic-panel-border', theme.semantic.panelBorder)
  setVar('semantic-hero-bg', theme.semantic.heroBg)
  setVar('semantic-hero-accent', theme.semantic.heroAccent)
  setVar('semantic-hero-accent-contrast', getContrastColor(theme.semantic.heroAccent))
  setVar('semantic-cta-primary-bg', theme.semantic.ctaPrimaryBg)
  setVar('semantic-cta-primary-text', theme.semantic.ctaPrimaryText)
  setVar('semantic-cta-primary-contrast', getContrastColor(theme.semantic.ctaPrimaryBg))
  setVar('semantic-cta-secondary-border', theme.semantic.ctaSecondaryBorder)
  setVar('semantic-tag-bg', theme.semantic.tagBg)
  setVar('semantic-tag-text', theme.semantic.tagText)
  setVar('semantic-muted-bg', theme.semantic.mutedBg)
  setVar('semantic-divider-strong', theme.semantic.dividerStrong)
  setVar('semantic-highlight', theme.semantic.highlight)

  setVar('intensity-border-weight', theme.intensity.borderWeight)
  setVar('intensity-shadow-step', theme.intensity.shadowStep)
  setVar('intensity-hover-scale', theme.intensity.hoverScale)
  setVar('intensity-accent-glow', theme.intensity.accentGlow)

  setVar('overrides-radius-scale', mergedOverrides.borderRadiusScale)
  setVar('overrides-shadow-depth', mergedOverrides.shadowDepth)
}

export const getThemeClass = (themeId: string, component?: string, variant?: string): string => {
  if (!component) {
    return `theme-${themeId}`
  }
  if (!variant) {
    return `theme-${themeId}-${component}`
  }
  return `theme-${themeId}-${component}-${variant}`
}
