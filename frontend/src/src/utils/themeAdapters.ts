import { defaultTheme, getThemeById } from '@/styles/themes'

export interface VisualPalette {
  series: string[]
  axis: string
  grid: string
  tooltipBg: string
  tooltipText: string
  positive: string
  negative: string
}

export const getVisualPalette = (themeId?: string): VisualPalette => {
  const theme = getThemeById(themeId || defaultTheme.id)

  return {
    series: theme.visual.series,
    axis: theme.colors.text.muted,
    grid: theme.visual.grid,
    tooltipBg: theme.visual.tooltipBg,
    tooltipText: theme.visual.tooltipText,
    positive: theme.visual.positive,
    negative: theme.visual.negative
  }
}
