// Basic escaping to prevent accidental script injection when rendering text fields
export const escapeHtml = (value: any): string => {
  if (value === null || value === undefined) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export const wrapSection = (className: string, inner: string): string => {
  return `<section class="${className}">${inner}</section>`
}

export const renderHeading = (tag: 'h1' | 'h2' | 'h3' | 'h4', text?: string): string => {
  if (!text) return ''
  return `<${tag}>${escapeHtml(text)}</${tag}>`
}

export const renderParagraph = (text?: string): string => {
  if (!text) return ''
  return `<p>${escapeHtml(text)}</p>`
}

export const renderList = (items?: string[]): string => {
  if (!items || items.length === 0) return ''
  return `<ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
}
