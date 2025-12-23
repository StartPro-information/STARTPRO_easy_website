import { escapeHtml, renderHeading, renderParagraph, wrapSection } from '../utils'

export const renderContactForm = (component: any): string => {
  const { props = {} } = component
  const { title, subtitle, fields = [] } = props
  const inputs = fields
    .map((field: any) => {
      const required = field.required ? ' required' : ''
      if (field.type === 'textarea') {
        return `<div class="form-group">
          <label>${escapeHtml(field.label || field.name || '')}${field.required ? ' *' : ''}</label>
          <textarea name="${escapeHtml(field.name || '')}"${required}></textarea>
        </div>`
      }
      return `<div class="form-group">
        <label>${escapeHtml(field.label || field.name || '')}${field.required ? ' *' : ''}</label>
        <input type="${escapeHtml(field.type || 'text')}" name="${escapeHtml(field.name || '')}"${required} />
      </div>`
    })
    .join('')
  return wrapSection(
    'contact-form',
    `${renderHeading('h2', title)}${renderParagraph(subtitle)}<form>${inputs}<button type="submit">提交</button></form>`
  )
}

export const renderFaqSection = (component: any): string => {
  const { props = {} } = component
  const { title, subtitle, faqs = [] } = props
  const items = faqs
    .map((faq: any) => `<div class="faq-item">
      ${renderHeading('h3', faq.question)}
      ${renderParagraph(faq.answer)}
    </div>`)
    .join('')
  return wrapSection('faq-section', `${renderHeading('h2', title)}${renderParagraph(subtitle)}${items}`)
}
