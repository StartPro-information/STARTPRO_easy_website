import { getFontOptionById } from '@/constants/fonts'

const injectedFonts = new Set<string>()

type CustomFontConfig = {
  name?: string
  url?: string
}

export const applyFont = (fontId?: string, custom?: CustomFontConfig) => {
  if (typeof window === 'undefined') return

  // 自定义字体
  if (fontId === 'custom') {
    const fontName = (custom?.name || '').trim()
    const fontUrl = (custom?.url || '').trim()
    if (!fontName) return

    if (fontUrl && !injectedFonts.has(`custom:${fontUrl}`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = fontUrl
      link.dataset.fontId = 'custom'
      document.head.appendChild(link)
      injectedFonts.add(`custom:${fontUrl}`)
    }
    document.documentElement.style.setProperty('--app-font-family', fontName)
    return
  }

  const option = getFontOptionById(fontId)

  // 注入字体引入链接，防止重复加载
  if (option.importUrl && !injectedFonts.has(option.id)) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = option.importUrl
    link.dataset.fontId = option.id
    document.head.appendChild(link)
    injectedFonts.add(option.id)
  }

  document.documentElement.style.setProperty('--app-font-family', option.fontFamily)
}
