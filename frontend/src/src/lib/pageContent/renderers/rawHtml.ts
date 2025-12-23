import { wrapSection } from '../utils'

export const renderRawHtml = (component: any): string => {
  const { props = {} } = component
  const html = props.html || ''
  const baseClass = props.className || 'raw-html-block'
  const uniqueClass = `${baseClass}-${component?.id || 'instance'}`
  const scopedHtml = scopeStylesToClass(html, uniqueClass)
  return wrapSection(`${baseClass} ${uniqueClass} raw-html-section`, scopedHtml)
}

/**
 * 将 <style> 内的选择器加上作用域前缀，避免影响全局。
 * 处理常见规则和 @media；遇到异常则保留原 HTML（宁可样式失效，也不污染全局）。
 */
export const scopeStylesToClass = (html: string, scopeClass: string): string => {
  if (!html || html.indexOf('<style') === -1) return html
  const prefixSelectors = (css: string): string => {
    // 递归处理 @media 内部
    css = css.replace(/@media[^{]*{([\s\S]*?)}/gi, (m: string, inner: string) => {
      const prefixed = prefixSelectors(inner)
      return m.replace(inner, prefixed)
    })
    // 普通规则前缀化
    return css.replace(/(^|})([^@{}][^{}]*?){/g, (_m: string, sep: string, selectors: string) => {
      const scopedSelectors = selectors
        .split(',')
        .map((s: string) => {
          const trimmed = s.trim()
          if (!trimmed) return ''
          // 已包含前缀则不重复添加
          if (trimmed.includes(scopeClass)) return trimmed
          return `.${scopeClass} ${trimmed}`
        })
        .filter(Boolean)
        .join(', ')
      return `${sep}${scopedSelectors} {`
    })
  }

  try {
    return html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_match: string, css: string) => {
      const transformed = prefixSelectors(css)
      return `<style>${transformed}</style>`
    })
  } catch (err) {
    console.error('Raw HTML scoping failed:', err)
    // 遇到异常时，移除 <style> 避免污染
    return html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  }
}
