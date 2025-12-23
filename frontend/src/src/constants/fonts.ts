export type FontOption = {
  id: string
  label: string
  fontFamily: string
  importUrl?: string
  isCustom?: boolean
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: 'inter',
    label: 'Inter',
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    importUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
  },
  {
    id: 'noto-sans-sc',
    label: 'Noto Sans SC',
    fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    importUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap'
  },
  {
    id: 'source-sans-3',
    label: 'Source Sans 3',
    fontFamily: "'Source Sans 3', 'Helvetica Neue', Arial, sans-serif",
    importUrl: 'https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700&display=swap'
  },
  {
    id: 'ibm-plex-sans',
    label: 'IBM Plex Sans',
    fontFamily: "'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif",
    importUrl: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap'
  },
  {
    id: 'manrope',
    label: 'Manrope',
    fontFamily: "'Manrope', 'Helvetica Neue', Arial, sans-serif",
    importUrl: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap'
  },
  {
    id: 'custom',
    label: '自定义',
    fontFamily: '',
    isCustom: true
  }
]

export const getFontOptionById = (id?: string): FontOption => {
  return FONT_OPTIONS.find(item => item.id === id) || FONT_OPTIONS[0]
}
