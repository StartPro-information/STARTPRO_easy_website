// 全局配色方案系统

// 主题颜色定义
export interface SemanticColors {
  panelBg: string
  panelBorder: string
  heroBg: string
  heroAccent: string
  ctaPrimaryBg: string
  ctaPrimaryText: string
  ctaSecondaryBorder: string
  tagBg: string
  tagText: string
  mutedBg: string
  dividerStrong: string
  highlight: string
}

export interface IntensitySettings {
  borderWeight: number
  shadowStep: number
  hoverScale: number
  accentGlow: number
}

export interface ThemeOverrides {
  accentSaturation: number
  panelBrightness: number
  borderRadiusScale: number
  shadowDepth: number
}

export type ThemeBackgroundEffect =
  | {
      type: 'starfield'
      baseColor: string
      starColor: string
      glowColor?: string
      density?: number
    }
  | {
      type: 'gradient'
      colors: string[]
      angle?: number
      blur?: number
      overlayOpacity?: number
    }
  | {
      type: 'pattern'
      backgroundColor: string
      patternColor: string
      secondaryColor?: string
      opacity?: number
    }

export type ThemeBackgroundChoice = 'theme-default' | 'starfield' | 'gradient' | 'pattern'

export interface ColorTheme {
  id: string
  name: string
  description: string
  preview: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: {
      primary: string
      secondary: string
      muted: string
    }
    gradient: {
      primary: string
      secondary: string
      hero: string
    }
    status: {
      success: string
      warning: string
      error: string
      info: string
    }
    // 公司名称专用颜色，用于在不同背景下保持可读
    companyName?: string
  }
  neutral: {
    border: string
    divider: string
    surfaceAlt: string
  }
  semantic: SemanticColors
  intensity: IntensitySettings
  background: ThemeBackgroundEffect
  visual: {
    series: string[]
    grid: string
    tooltipBg: string
    tooltipText: string
    positive: string
    negative: string
  }
}

// 主题组件样式接口
export interface ThemeComponentStyles {
  [component: string]: {
    base?: React.CSSProperties
    [variant: string]: React.CSSProperties | undefined
  }
}

type RGB = { r: number; g: number; b: number }

const clampChannel = (value: number) => Math.max(0, Math.min(255, Math.round(value)))

const hexToRgb = (hex: string): RGB | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null
}

const rgbToHex = ({ r, g, b }: RGB): string => {
  const toHex = (value: number) => clampChannel(value).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

const hexToRgbaString = (hex: string, alpha: number): string => {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}

const rgbTupleToCss = (rgb: RGB | null) => (rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : '')

const adjustColor = (hex: string, amount: number): string => {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  return rgbToHex({
    r: clampChannel(rgb.r + amount),
    g: clampChannel(rgb.g + amount),
    b: clampChannel(rgb.b + amount)
  })
}

const mixColors = (colorA: string, colorB: string, weight: number): string => {
  const a = hexToRgb(colorA)
  const b = hexToRgb(colorB)
  if (!a || !b) return colorA
  const w = Math.max(0, Math.min(1, weight))
  return rgbToHex({
    r: clampChannel(a.r * (1 - w) + b.r * w),
    g: clampChannel(a.g * (1 - w) + b.g * w),
    b: clampChannel(a.b * (1 - w) + b.b * w)
  })
}

const buildSeries = (primary: string, accent: string, secondary: string) => [
  primary,
  adjustColor(primary, 25),
  adjustColor(primary, -20),
  accent,
  mixColors(accent, secondary, 0.35),
  secondary
]

const getContrastColor = (hex: string): string => {
  const rgb = hexToRgb(hex)
  if (!rgb) return '#FFFFFF'
  const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255
  return luminance > 0.55 ? '#0B1120' : '#FFFFFF'
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

interface HSL {
  h: number
  s: number
  l: number
}

const rgbToHsl = ({ r, g, b }: RGB): HSL => {
  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255
  const max = Math.max(rNorm, gNorm, bNorm)
  const min = Math.min(rNorm, gNorm, bNorm)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)
        break
      case gNorm:
        h = (bNorm - rNorm) / d + 2
        break
      case bNorm:
        h = (rNorm - gNorm) / d + 4
        break
    }
    h /= 6
  }

  return { h, s, l }
}

const hslToRgb = ({ h, s, l }: HSL): RGB => {
  if (s === 0) {
    const value = Math.round(l * 255)
    return { r: value, g: value, b: value }
  }
  const hueToRgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const r = hueToRgb(p, q, h + 1 / 3)
  const g = hueToRgb(p, q, h)
  const b = hueToRgb(p, q, h - 1 / 3)
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }
}

const adjustSaturation = (hex: string, factor: number): string => {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  const hsl = rgbToHsl(rgb)
  hsl.s = clamp01(hsl.s * factor)
  return rgbToHex(hslToRgb(hsl))
}

const adjustLightness = (hex: string, factor: number): string => {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  const hsl = rgbToHsl(rgb)
  hsl.l = clamp01(hsl.l * factor)
  return rgbToHex(hslToRgb(hsl))
}

export const DEFAULT_THEME_OVERRIDES: ThemeOverrides = {
  accentSaturation: 1,
  panelBrightness: 1,
  borderRadiusScale: 1,
  shadowDepth: 1
}

const cloneTheme = (theme: ColorTheme): ColorTheme => JSON.parse(JSON.stringify(theme))

// 预设主题方案 - 全新高端配色方案
export const colorThemes: ColorTheme[] = [
  {
    id: 'serene-white',
    name: '素雅白色',
    description: '接近浏览器浅色模式的清爽观感',
    preview: '#F8FAFD',
    colors: {
      primary: '#0F172A',
      secondary: '#334155',
      accent: '#0EA5E9',
      background: '#F9FAFB',
      surface: '#FFFFFF',
      text: {
        primary: '#0B1224',
        secondary: '#4B5563',
        muted: '#6B7280'
      },
      gradient: {
        primary: 'linear-gradient(135deg, #0F172A 0%, #334155 100%)',
        secondary: 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)',
        hero: 'linear-gradient(135deg, #E2E8F0 0%, #F8FAFC 100%)'
      },
      status: {
        success: '#16A34A',
        warning: '#F59E0B',
        error: '#DC2626',
        info: '#0EA5E9'
      },
      companyName: '#0F172A'
    },
    neutral: {
      border: '#E2E8F0',
      divider: '#CBD5E1',
      surfaceAlt: '#F3F4F6'
    },
    visual: {
      series: buildSeries('#0F172A', '#0EA5E9', '#334155'),
      grid: 'rgba(15, 23, 42, 0.06)',
      tooltipBg: 'rgba(255, 255, 255, 0.95)',
      tooltipText: '#0B1224',
      positive: '#16A34A',
      negative: '#DC2626'
    },
    semantic: {
      panelBg: '#FFFFFF',
      panelBorder: '#E2E8F0',
      heroBg: '#F4F6FB',
      heroAccent: '#0EA5E9',
      ctaPrimaryBg: '#0F172A',
      ctaPrimaryText: '#FFFFFF',
      ctaSecondaryBorder: '#0F172A',
      tagBg: mixColors('#0EA5E9', '#FFFFFF', 0.6),
      tagText: '#0F172A',
      mutedBg: '#F8FAFC',
      dividerStrong: '#CBD5E1',
      highlight: '#0EA5E9'
    },
    intensity: {
      borderWeight: 1.2,
      shadowStep: 0.35,
      hoverScale: 1.01,
      accentGlow: 0.12
    },
    background: {
      type: 'gradient',
      colors: ['rgba(14, 165, 233, 0.12)', 'rgba(51, 65, 85, 0.08)', 'rgba(94, 234, 212, 0.12)'],
      angle: 135,
      blur: 120,
      overlayOpacity: 0.65
    }
  },
  {
    id: 'neo-futuristic',
    name: '未来主义',
    description: '未来科技感，鲜明对比',
    preview: '#00CFFD',
    colors: {
      primary: '#123A72',
      secondary: '#0F70B8',
      accent: '#32D5FF',
      background: '#0A1220',
      surface: '#141C2E',
      text: {
        primary: '#CED8F0',
        secondary: '#9EB1CF',
        muted: '#7082A0'
      },
      gradient: {
        primary: 'linear-gradient(135deg, #002B5B 0%, #1E3A8A 100%)',
        secondary: 'linear-gradient(135deg, #00CFFD 0%, #7B2CBF 100%)',
        hero: 'linear-gradient(135deg, #002B5B 0%, #00CFFD 50%, #7B2CBF 100%)'
      },
      status: {
        success: '#34D399',
        warning: '#FCD34D',
        error: '#F87171',
        info: '#00CFFD'
      },
      companyName: '#FFFFFF'
    },
    neutral: {
      border: '#1F2A3B',
      divider: '#111A28',
      surfaceAlt: '#1C2536'
    },
    visual: {
      series: ['#00CFFD', '#4ECDC4', '#A855F7', '#F472B6', '#FBBF24', '#34D399'],
      grid: 'rgba(255, 255, 255, 0.08)',
      tooltipBg: 'rgba(10, 14, 23, 0.95)',
      tooltipText: '#F8FAFC',
      positive: '#34D399',
      negative: '#F87171'
    },
    semantic: {
      panelBg: adjustLightness('#10192B', 1.15),
      panelBorder: adjustLightness('#1F2E43', 1.05),
      heroBg: adjustLightness('#050B18', 1.15),
      heroAccent: '#32D5FF',
      ctaPrimaryBg: '#1294E0',
      ctaPrimaryText: '#041022',
      ctaSecondaryBorder: '#32D5FF',
      tagBg: mixColors('#32D5FF', '#0A0F1B', 0.65),
      tagText: '#9FE8FF',
      mutedBg: adjustLightness('#111827', 1.18),
      dividerStrong: adjustLightness('#1F2A3B', 1.05),
      highlight: '#7B2CBF'
    },
    intensity: {
      borderWeight: 2,
      shadowStep: 0.8,
      hoverScale: 1.035,
      accentGlow: 0.35
    },
    background: {
      type: 'starfield',
      baseColor: '#050B18',
      starColor: 'rgba(255, 255, 255, 0.65)',
      glowColor: 'rgba(0, 207, 253, 0.35)',
      density: 0.35
    }
  },
  {
    id: 'corporate-blue',
    name: '商务蓝',
    description: '专业稳重，商务气质',
    preview: '#2563EB',
    colors: {
      primary: '#1E40AF',
      secondary: '#3B82F6',
      accent: '#60A5FA',
      background: '#E9F2FF',
      surface: '#F6F9FF',
      text: {
        primary: '#0F1F3A',
        secondary: '#354866',
        muted: '#60708C'
      },
      gradient: {
        primary: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
        secondary: 'linear-gradient(135deg, #60A5FA 0%, #93C5FD 100%)',
        hero: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 50%, #8B5CF6 100%)'
      },
      status: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6'
      },
      companyName: '#1E40AF'
    },
    neutral: {
      border: '#C5D4F5',
      divider: '#AFC3E3',
      surfaceAlt: '#FFFFFF'
    },
    visual: {
      series: buildSeries('#1E40AF', '#60A5FA', '#3B82F6'),
      grid: 'rgba(15, 31, 58, 0.08)',
      tooltipBg: 'rgba(246, 249, 255, 0.95)',
      tooltipText: '#0F1F3A',
      positive: '#10B981',
      negative: '#EF4444'
    },
    semantic: {
      panelBg: '#F2F6FF',
      panelBorder: '#C5D4F5',
      heroBg: '#E0E8FF',
      heroAccent: '#2563EB',
      ctaPrimaryBg: '#2563EB',
      ctaPrimaryText: '#FFFFFF',
      ctaSecondaryBorder: '#2563EB',
      tagBg: mixColors('#60A5FA', '#FFFFFF', 0.4),
      tagText: '#1E3A8A',
      mutedBg: '#E6EEFF',
      dividerStrong: '#B4C5F0',
      highlight: '#60A5FA'
    },
    intensity: {
      borderWeight: 1.4,
      shadowStep: 0.45,
      hoverScale: 1.015,
      accentGlow: 0.18
    },
    background: {
      type: 'gradient',
      colors: ['rgba(37, 99, 235, 0.3)', 'rgba(96, 165, 250, 0.55)', 'rgba(251, 191, 36, 0.25)'],
      angle: 135,
      blur: 120,
      overlayOpacity: 0.7
    }
  },
  {
    id: 'classic-blue',
    name: '经典蓝',
    description: '高对比经典蓝，传统稳重',
    preview: '#0B3D91',
    colors: {
      primary: '#0B3D91',
      secondary: '#1D4ED8',
      accent: '#38BDF8',
      background: '#BBD8FF',
      surface: '#E2F0FF',
      text: {
        primary: '#0B1B33',
        secondary: '#2A3F63',
        muted: '#5A6D8A'
      },
      gradient: {
        primary: 'linear-gradient(135deg, #0B3D91 0%, #1D4ED8 100%)',
        secondary: 'linear-gradient(135deg, #1D4ED8 0%, #38BDF8 100%)',
        hero: 'linear-gradient(135deg, #0B3D91 0%, #1D4ED8 55%, #38BDF8 100%)'
      },
      status: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#0B3D91'
      },
      companyName: '#0B3D91'
    },
    neutral: {
      border: '#8FB6FF',
      divider: '#7FAAFF',
      surfaceAlt: '#F0F7FF'
    },
    visual: {
      series: buildSeries('#0B3D91', '#38BDF8', '#1D4ED8'),
      grid: 'rgba(11, 27, 51, 0.08)',
      tooltipBg: 'rgba(255, 255, 255, 0.95)',
      tooltipText: '#0B1B33',
      positive: '#10B981',
      negative: '#EF4444'
    },
    semantic: {
      panelBg: '#EAF4FF',
      panelBorder: '#8FB6FF',
      heroBg: '#AFCFFF',
      heroAccent: '#0B3D91',
      ctaPrimaryBg: '#0B3D91',
      ctaPrimaryText: '#FFFFFF',
      ctaSecondaryBorder: '#0B3D91',
      tagBg: mixColors('#38BDF8', '#FFFFFF', 0.55),
      tagText: '#0B3D91',
      mutedBg: '#C2DCFF',
      dividerStrong: '#7FAAFF',
      highlight: '#1D4ED8'
    },
    intensity: {
      borderWeight: 1.55,
      shadowStep: 0.5,
      hoverScale: 1.015,
      accentGlow: 0.2
    },
    background: {
      type: 'pattern',
      backgroundColor: '#BBD8FF',
      patternColor: 'rgba(11, 61, 145, 0.18)',
      secondaryColor: 'rgba(56, 189, 248, 0.18)',
      opacity: 0.95
    }
  },
  {
    id: 'elegant-dark',
    name: '优雅暗色',
    description: '高端大气，优雅深邃',
    preview: '#4F46E5',
    colors: {
      primary: '#241B3A',
      secondary: '#352B52',
      accent: '#9E7BFF',
      background: '#090A14',
      surface: '#1B2131',
      text: {
        primary: '#D5D0F0',
        secondary: '#B3ABDE',
        muted: '#817AAC'
      },
      gradient: {
        primary: 'linear-gradient(135deg, #111827 0%, #1E293B 100%)',
        secondary: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        hero: 'linear-gradient(135deg, #111827 0%, #4F46E5 50%, #A78BFA 100%)'
      },
      status: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#4F46E5'
      },
      companyName: '#FFFFFF'
    },
    neutral: {
      border: '#2A3045',
      divider: '#151A2B',
      surfaceAlt: '#222840'
    },
    visual: {
      series: ['#4F46E5', '#7C3AED', '#A78BFA', '#C084FC', '#F472B6', '#FBBF24'],
      grid: 'rgba(255, 255, 255, 0.08)',
      tooltipBg: 'rgba(3, 7, 18, 0.95)',
      tooltipText: '#F8FAFC',
      positive: '#10B981',
      negative: '#F87171'
    },
    semantic: {
      panelBg: adjustLightness('#181E2C', 1.12),
      panelBorder: adjustLightness('#2C3450', 1.05),
      heroBg: adjustLightness('#070914', 1.15),
      heroAccent: '#9E7BFF',
      ctaPrimaryBg: '#7A5CFF',
      ctaPrimaryText: '#0F1020',
      ctaSecondaryBorder: '#9E7BFF',
      tagBg: mixColors('#9E7BFF', '#070914', 0.6),
      tagText: '#F4EFFF',
      mutedBg: adjustLightness('#1C2336', 1.12),
      dividerStrong: adjustLightness('#2F3752', 1.05),
      highlight: '#F0ABFC'
    },
    intensity: {
      borderWeight: 2.1,
      shadowStep: 0.82,
      hoverScale: 1.035,
      accentGlow: 0.4
    },
    background: {
      type: 'starfield',
      baseColor: '#0A0E18',
      starColor: 'rgba(255, 255, 255, 0.55)',
      glowColor: 'rgba(124, 58, 237, 0.35)',
      density: 0.28
    }
  },
  {
  id: 'starry-night',
  name: '深邃星空·特效增强版',
  description: '深色星空主题，强化光效与阴影，提升科幻感',
  preview: '#0A0F1A',

  colors: {
    primary: '#0A0F1A',
    secondary: '#090A0D',
    accent: '#79AFFF', // 更亮一点，增强 glow 效果
    background: '#050814',
    surface: '#0C0C10',

    text: {
      primary: '#D4D6DE',
      secondary: '#AEB4BE',
      muted: '#7D8490'
    },

    gradient: {
      primary: 'linear-gradient(145deg, #0F1116 0%, #1C1E26 100%)',
      secondary: 'linear-gradient(145deg, #757C89 0%, #A1A8B3 100%)',
      hero: 'linear-gradient(160deg, #050814 0%, #12141C 50%, #8690A7 100%)'
    },

    status: {
      success: '#0EC08A',
      warning: '#D89222',
      error: '#E16060',
      info: '#5E9CF0'
    },

    companyName: '#D8E2F8'
  },

  neutral: {
    border: '#7A7A82',         // 微强化对比度（为了配合阴影）
    divider: '#000000',
    surfaceAlt: '#050509'
  },

  visual: {
    series: ['#79AFFF', '#A488FF', '#35C79A', '#F1C345', '#E275B1', '#32D3EA'],
    grid: 'rgba(255, 255, 255, 0.05)',
    tooltipBg: 'rgba(3, 6, 15, 0.92)',
    tooltipText: '#DDE6F6',
    positive: '#0EC08A',
    negative: '#E16060'
  },

  semantic: {
    panelBg: '#101015',
    panelBorder: '#1D1E24',

    heroBg: '#171821',
    heroAccent: '#79AFFF',

    ctaPrimaryBg: '#14141D',
    ctaPrimaryText: '#DDE6F6',
    ctaSecondaryBorder: '#79AFFF',

    tagBg: 'rgba(121, 175, 255, 0.32)', // 提升 tag 背景发光感
    tagText: '#D4DFFE',

    mutedBg: '#060912',
    dividerStrong: '#0A0E18',

    highlight: '#A488FF'
  },

  intensity: {
    borderWeight: 2,
    shadowStep: 1.25,    // ⭐ 阴影明显增强（之前 0.8 → 1.25）
    hoverScale: 1.05,    // ⭐ Hover 提升悬浮感
    accentGlow: 0.62     // ⭐ 光晕增强（之前 0.40 → 0.62）
  },

  background: {
    type: 'starfield',
    baseColor: '#000000',
    starColor: 'rgba(255, 255, 255, 0.75)',   // ⭐更亮的星点
    glowColor: 'rgba(120, 150, 255, 0.18)',   // ⭐更强星云光晕
    density: 0.34
  }
}
,
  {
    id: 'emerald-forest',
    name: '翡翠森林',
    description: '自然高贵，清新活力',
    preview: '#10B981',
    colors: {
      primary: '#065F46',
      secondary: '#10B981',
      accent: '#34D399',
      background: '#E6F7F2',
      surface: '#F4FFFA',
      text: {
        primary: '#0D1F17',
        secondary: '#2D473E',
        muted: '#5C6F66'
      },
      gradient: {
        primary: 'linear-gradient(135deg, #065F46 0%, #10B981 100%)',
        secondary: 'linear-gradient(135deg, #34D399 0%, #6EE7B7 100%)',
        hero: 'linear-gradient(135deg, #065F46 0%, #10B981 50%, #6366F1 100%)'
      },
      status: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#059669'
      },
      companyName: '#065F46'
    },
    neutral: {
      border: '#B7E0D4',
      divider: '#97C8B4',
      surfaceAlt: '#FFFFFF'
    },
    visual: {
      series: buildSeries('#065F46', '#34D399', '#10B981'),
      grid: 'rgba(13, 31, 23, 0.08)',
      tooltipBg: 'rgba(244, 255, 250, 0.95)',
      tooltipText: '#0D1F17',
      positive: '#10B981',
      negative: '#D14343'
    },
    semantic: {
      panelBg: '#ECF9F4',
      panelBorder: '#B7E0D4',
      heroBg: '#D6F4EA',
      heroAccent: '#0F9D75',
      ctaPrimaryBg: '#0F9D75',
      ctaPrimaryText: '#FFFFFF',
      ctaSecondaryBorder: '#0F9D75',
      tagBg: mixColors('#34D399', '#FFFFFF', 0.5),
      tagText: '#065F46',
      mutedBg: '#F6FFFB',
      dividerStrong: '#A8D6C6',
      highlight: '#34D399'
    },
    intensity: {
      borderWeight: 1.6,
      shadowStep: 0.5,
      hoverScale: 1.02,
      accentGlow: 0.25
    },
    background: {
      type: 'pattern',
      backgroundColor: '#052019',
      patternColor: 'rgba(74, 222, 128, 0.15)',
      secondaryColor: 'rgba(20, 83, 45, 0.3)',
      opacity: 0.85
    }
  },
  {
    id: 'royal-amber',
    name: '皇家琥珀',
    description: '奢华典雅，尊贵大气',
    preview: '#FBBF24',
    colors: {
      primary: '#92400E',
      secondary: '#B45309',
      accent: '#FBBF24',
      background: '#FFF3E0',
      surface: '#FFF8ED',
      text: {
        primary: '#2B1A05',
        secondary: '#523519',
        muted: '#7A5A39'
      },
      gradient: {
        primary: 'linear-gradient(135deg, #92400E 0%, #B45309 100%)',
        secondary: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
        hero: 'linear-gradient(135deg, #92400E 0%, #FBBF24 50%, #F97316 100%)'
      },
      status: {
        success: '#10B981',
        warning: '#FBBF24',
        error: '#EF4444',
        info: '#EA580C'
      },
      companyName: '#92400E'
    },
    neutral: {
      border: '#F0C999',
      divider: '#E3B17A',
      surfaceAlt: '#FFFFFF'
    },
    visual: {
      series: buildSeries('#92400E', '#FBBF24', '#B45309'),
      grid: 'rgba(43, 26, 5, 0.08)',
      tooltipBg: 'rgba(255, 248, 237, 0.95)',
      tooltipText: '#2B1A05',
      positive: '#10B981',
      negative: '#B91C1C'
    },
    semantic: {
      panelBg: '#FFF7ED',
      panelBorder: '#F0C999',
      heroBg: '#FFE9CF',
      heroAccent: '#B45309',
      ctaPrimaryBg: '#B45309',
      ctaPrimaryText: '#FFF4E0',
      ctaSecondaryBorder: '#B45309',
      tagBg: mixColors('#FBBF24', '#FFFFFF', 0.45),
      tagText: '#7C2D12',
      mutedBg: '#FFF3E3',
      dividerStrong: '#E3B17A',
      highlight: '#F97316'
    },
    intensity: {
      borderWeight: 1.8,
      shadowStep: 0.55,
      hoverScale: 1.02,
      accentGlow: 0.22
    },
    background: {
      type: 'gradient',
      colors: ['rgba(245, 158, 11, 0.35)', 'rgba(251, 191, 36, 0.4)', 'rgba(250, 204, 21, 0.2)'],
      angle: 120,
      blur: 100,
      overlayOpacity: 0.65
    }
  },
  {
    id: 'mystic-purple',
    name: '神秘紫',
    description: '高贵神秘，创意无限',
    preview: '#A855F7',
    colors: {
      primary: '#2C0F4A',
      secondary: '#3D1A5B',
      accent: '#C084FC',
      background: '#13061F',
      surface: '#231433',
      text: {
        primary: '#F8F0FF',
        secondary: '#DCC7F5',
        muted: '#B99AD8'
      },
      gradient: {
        primary: 'linear-gradient(135deg, #2C0F4A 0%, #3D1A5B 100%)',
        secondary: 'linear-gradient(135deg, #A855F7 0%, #D946EF 100%)',
        hero: 'linear-gradient(135deg, #12051E 0%, #7C3AED 45%, #C084FC 100%)'
      },
      status: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#A855F7'
      },
      companyName: '#EDE9FE'
    },
    neutral: {
      border: '#3A2154',
      divider: '#2A143F',
      surfaceAlt: '#2E1A43'
    },
    visual: {
      series: ['#A855F7', '#C084FC', '#D946EF', '#F472B6', '#FBBF24', '#22D3EE'],
      grid: 'rgba(168, 85, 247, 0.18)',
      tooltipBg: 'rgba(18, 5, 30, 0.92)',
      tooltipText: '#F8F0FF',
      positive: '#10B981',
      negative: '#F87171'
    },
    semantic: {
      panelBg: '#241335',
      panelBorder: '#3A2154',
      heroBg: '#170825',
      heroAccent: '#D946EF',
      ctaPrimaryBg: '#A855F7',
      ctaPrimaryText: '#FBF7FF',
      ctaSecondaryBorder: '#C084FC',
      tagBg: mixColors('#A855F7', '#12051E', 0.6),
      tagText: '#F3E8FF',
      mutedBg: '#2E1C42',
      dividerStrong: '#3F255A',
      highlight: '#F472B6'
    },
    intensity: {
      borderWeight: 2.1,
      shadowStep: 0.8,
      hoverScale: 1.04,
      accentGlow: 0.5
    },
    background: {
      type: 'gradient',
      colors: ['rgba(139, 92, 246, 0.4)', 'rgba(59, 7, 120, 0.35)', 'rgba(249, 115, 22, 0.2)'],
      angle: 150,
      blur: 140,
      overlayOpacity: 0.75
    }
  },
  {
    id: 'minimal-pro',
    name: '极简专业',
    description: '低饱和深色与柔和灰调的商务风格',
    preview: '#1F2933',
    colors: {
      primary: '#1F2933',
      secondary: '#2B333F',
      accent: '#5C6E85',
      background: '#0E131B',
      surface: '#161C26',
      text: {
        primary: '#CBD2DC',
        secondary: '#A0A7B7',
        muted: '#6F7787'
      },
      gradient: {
        primary: 'linear-gradient(135deg, #1F2933 0%, #2B333F 100%)',
        secondary: 'linear-gradient(135deg, #3A4A5B 0%, #5C6E85 100%)',
        hero: 'linear-gradient(135deg, #10151E 0%, #2B333F 60%, #0EA5E9 100%)'
      },
      status: {
        success: '#22C55E',
        warning: '#FACC15',
        error: '#F87171',
        info: '#5C6E85'
      },
      companyName: '#E2E6EE'
    },
    neutral: {
      border: '#242C38',
      divider: '#131820',
      surfaceAlt: '#1C232F'
    },
    visual: {
      series: ['#5C6E85', '#38BDF8', '#A3E635', '#FBBF24', '#FB7185', '#C084FC'],
      grid: 'rgba(226, 230, 238, 0.05)',
      tooltipBg: 'rgba(13, 17, 26, 0.92)',
      tooltipText: '#F8FAFC',
      positive: '#22C55E',
      negative: '#F87171'
    },
    semantic: {
      panelBg: adjustLightness('#161C26', 1.05),
      panelBorder: adjustLightness('#242C38', 1.08),
      heroBg: adjustLightness('#0E131B', 1.05),
      heroAccent: '#5C6E85',
      ctaPrimaryBg: '#2B333F',
      ctaPrimaryText: '#F5F7FA',
      ctaSecondaryBorder: '#5C6E85',
      tagBg: mixColors('#5C6E85', '#0E131B', 0.55),
      tagText: '#E2E6EE',
      mutedBg: adjustLightness('#111722', 1.08),
      dividerStrong: adjustLightness('#2B333F', 1.05),
      highlight: '#38BDF8'
    },
    intensity: {
      borderWeight: 1.6,
      shadowStep: 0.65,
      hoverScale: 1.02,
      accentGlow: 0.25
    },
    background: {
      type: 'pattern',
      backgroundColor: '#0F141C',
      patternColor: 'rgba(255, 255, 255, 0.04)',
      secondaryColor: 'rgba(46, 59, 72, 0.18)',
      opacity: 0.8
    }
  }
]

export const resolveTheme = (theme: ColorTheme, overrides?: ThemeOverrides) => {
  if (!overrides) {
    return {
      theme,
      overrides: { ...DEFAULT_THEME_OVERRIDES }
    }
  }
  const mergedOverrides: ThemeOverrides = {
    ...DEFAULT_THEME_OVERRIDES,
    ...overrides
  }
  const nextTheme = cloneTheme(theme)
  nextTheme.colors.accent = adjustSaturation(nextTheme.colors.accent, mergedOverrides.accentSaturation)
  nextTheme.semantic.heroAccent = adjustSaturation(nextTheme.semantic.heroAccent, mergedOverrides.accentSaturation)
  nextTheme.semantic.ctaPrimaryBg = adjustSaturation(nextTheme.semantic.ctaPrimaryBg, mergedOverrides.accentSaturation)
  nextTheme.semantic.tagBg = adjustSaturation(nextTheme.semantic.tagBg, mergedOverrides.accentSaturation)
  nextTheme.semantic.panelBg = adjustLightness(nextTheme.semantic.panelBg, mergedOverrides.panelBrightness)
  nextTheme.semantic.mutedBg = adjustLightness(nextTheme.semantic.mutedBg, mergedOverrides.panelBrightness)
  nextTheme.neutral.surfaceAlt = adjustLightness(nextTheme.neutral.surfaceAlt, mergedOverrides.panelBrightness)
  nextTheme.intensity.shadowStep = nextTheme.intensity.shadowStep * mergedOverrides.shadowDepth
  return {
    theme: nextTheme,
    overrides: mergedOverrides
  }
}

const buildStarfieldEffect = (theme: ColorTheme, density = 0.3): ThemeBackgroundEffect => ({
  type: 'starfield',
  baseColor: theme.semantic.heroBg || theme.colors.background,
  starColor: 'rgba(255, 255, 255, 0.6)',
  glowColor: hexToRgbaString(theme.colors.accent, 0.35),
  density
})

const buildGradientEffect = (theme: ColorTheme): ThemeBackgroundEffect => ({
  type: 'gradient',
  colors: [
    hexToRgbaString(theme.colors.accent, 0.4),
    hexToRgbaString(theme.colors.secondary, 0.3),
    hexToRgbaString(theme.semantic.heroAccent || theme.colors.secondary, 0.25)
  ],
  angle: 135,
  blur: 120,
  overlayOpacity: 0.75
})

const buildPatternEffect = (theme: ColorTheme): ThemeBackgroundEffect => ({
  type: 'pattern',
  backgroundColor: theme.semantic.panelBg || theme.colors.surface,
  patternColor: hexToRgbaString(theme.colors.accent, 0.2),
  secondaryColor: hexToRgbaString(theme.colors.secondary, 0.15),
  opacity: 0.85
})

export const resolveBackgroundEffect = (
  theme: ColorTheme,
  preference?: ThemeBackgroundChoice
): ThemeBackgroundEffect => {
  if (!preference || preference === 'theme-default') {
    return theme.background
  }
  if (preference === 'starfield') {
    return buildStarfieldEffect(theme)
  }
  if (preference === 'gradient') {
    return buildGradientEffect(theme)
  }
  if (preference === 'pattern') {
    return buildPatternEffect(theme)
  }
  return theme.background
}

// 默认主题
export const defaultTheme =
  colorThemes.find(theme => theme.id === 'neo-futuristic') || colorThemes[0]

// 根据主题ID获取主题
export const getThemeById = (id: string): ColorTheme => {
  return colorThemes.find(theme => theme.id === id) || defaultTheme
}

// 应用主题CSS变量
export const applyTheme = (theme: ColorTheme, overrides?: ThemeOverrides) => {
  const root = document.documentElement

  root.classList.remove(...colorThemes.map(t => `theme-${t.id}`))
  root.classList.add(`theme-${theme.id}`)

  const { theme: resolvedTheme, overrides: resolvedOverrides } = resolveTheme(theme, overrides)

  root.style.setProperty('--color-primary', resolvedTheme.colors.primary)
  root.style.setProperty('--color-secondary', resolvedTheme.colors.secondary)
  root.style.setProperty('--color-accent', resolvedTheme.colors.accent)
  root.style.setProperty('--color-background', resolvedTheme.colors.background)
  root.style.setProperty('--color-surface', resolvedTheme.colors.surface)
  root.style.setProperty('--color-surface-alt', resolvedTheme.neutral.surfaceAlt)

  root.style.setProperty('--color-text-primary', resolvedTheme.colors.text.primary)
  root.style.setProperty('--color-text-secondary', resolvedTheme.colors.text.secondary)
  root.style.setProperty('--color-text-muted', resolvedTheme.colors.text.muted)

  root.style.setProperty('--color-border', resolvedTheme.neutral.border)
  root.style.setProperty('--color-divider', resolvedTheme.neutral.divider)
  root.style.setProperty('--color-primary-contrast', getContrastColor(resolvedTheme.colors.primary))

  root.style.setProperty('--semantic-panel-bg', resolvedTheme.semantic.panelBg)
  root.style.setProperty('--semantic-panel-border', resolvedTheme.semantic.panelBorder)
  root.style.setProperty('--semantic-hero-bg', resolvedTheme.semantic.heroBg)
  root.style.setProperty('--semantic-hero-accent', resolvedTheme.semantic.heroAccent)
  root.style.setProperty('--semantic-hero-accent-contrast', getContrastColor(resolvedTheme.semantic.heroAccent))
  root.style.setProperty('--semantic-cta-primary-bg', resolvedTheme.semantic.ctaPrimaryBg)
  root.style.setProperty('--semantic-cta-primary-text', resolvedTheme.semantic.ctaPrimaryText)
  root.style.setProperty('--semantic-cta-primary-contrast', getContrastColor(resolvedTheme.semantic.ctaPrimaryBg))
  root.style.setProperty('--semantic-cta-secondary-border', resolvedTheme.semantic.ctaSecondaryBorder)
  root.style.setProperty('--semantic-tag-bg', resolvedTheme.semantic.tagBg)
  root.style.setProperty('--semantic-tag-text', resolvedTheme.semantic.tagText)
  root.style.setProperty('--semantic-muted-bg', resolvedTheme.semantic.mutedBg)
  root.style.setProperty('--semantic-divider-strong', resolvedTheme.semantic.dividerStrong)
  root.style.setProperty('--semantic-highlight', resolvedTheme.semantic.highlight)

  root.style.setProperty('--intensity-border-weight', resolvedTheme.intensity.borderWeight.toString())
  root.style.setProperty('--intensity-shadow-step', resolvedTheme.intensity.shadowStep.toString())
  root.style.setProperty('--intensity-hover-scale', resolvedTheme.intensity.hoverScale.toString())
  root.style.setProperty('--intensity-accent-glow', resolvedTheme.intensity.accentGlow.toString())

  root.style.setProperty('--theme-radius-scale', resolvedOverrides.borderRadiusScale.toString())
  root.style.setProperty('--theme-shadow-depth', resolvedOverrides.shadowDepth.toString())

  root.style.setProperty('--gradient-primary', resolvedTheme.colors.gradient.primary)
  root.style.setProperty('--gradient-secondary', resolvedTheme.colors.gradient.secondary)
  root.style.setProperty('--gradient-hero', resolvedTheme.colors.gradient.hero)

  root.style.setProperty('--color-success', resolvedTheme.colors.status.success)
  root.style.setProperty('--color-warning', resolvedTheme.colors.status.warning)
  root.style.setProperty('--color-error', resolvedTheme.colors.status.error)
  root.style.setProperty('--color-info', resolvedTheme.colors.status.info)

  const setRgbVar = (name: string, hex: string) => {
    const rgb = hexToRgb(hex)
    if (rgb) {
      root.style.setProperty(name, rgbTupleToCss(rgb))
    }
  }

  setRgbVar('--color-primary-rgb', resolvedTheme.colors.primary)
  setRgbVar('--color-secondary-rgb', resolvedTheme.colors.secondary)
  setRgbVar('--color-accent-rgb', resolvedTheme.colors.accent)
  setRgbVar('--color-background-rgb', resolvedTheme.colors.background)
  setRgbVar('--color-surface-rgb', resolvedTheme.colors.surface)
  setRgbVar('--color-surface-alt-rgb', resolvedTheme.neutral.surfaceAlt)
  setRgbVar('--color-text-primary-rgb', resolvedTheme.colors.text.primary)
  setRgbVar('--color-text-secondary-rgb', resolvedTheme.colors.text.secondary)
  setRgbVar('--color-text-muted-rgb', resolvedTheme.colors.text.muted)

  window.dispatchEvent(new CustomEvent('themeChanged'))
}

// 获取当前主题ID（从DOM中读取）
export const getCurrentThemeId = (): string => {
  if (typeof window === 'undefined') return ''
  const root = document.documentElement

  for (const theme of colorThemes) {
    if (root.classList.contains(`theme-${theme.id}`)) {
      return theme.id
    }
  }

  const primaryColor = getComputedStyle(root).getPropertyValue('--color-primary').trim()
  switch (primaryColor) {
    case '#0F172A':
      return 'serene-white'
    case '#002B5B':
      return 'neo-futuristic'
    case '#1E40AF':
      return 'corporate-blue'
    case '#0B3D91':
      return 'classic-blue'
    case '#0B1224':
      return 'starry-night'
    case '#111827': {
      const surfaceColor = getComputedStyle(root).getPropertyValue('--color-surface').trim()
      return surfaceColor === '#1E293B' ? 'elegant-dark' : 'minimal-pro'
    }
    case '#065F46':
      return 'emerald-forest'
    case '#92400E':
      return 'royal-amber'
    case '#4C1D95':
      return 'mystic-purple'
    default:
      return defaultTheme.id
  }
}

// 生成主题样式对象
export const getThemeStyles = (theme: ColorTheme) => ({
  primary: theme.colors.primary,
  secondary: theme.colors.secondary,
  accent: theme.colors.accent,
  background: theme.colors.background,
  surface: theme.colors.surface,
  text: theme.colors.text,
  gradient: theme.colors.gradient,
  status: theme.colors.status,
  neutral: theme.neutral,
  visual: theme.visual,
  semantic: theme.semantic,
  intensity: theme.intensity,
  backgroundEffect: theme.background
})
