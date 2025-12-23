import { escapeHtml, renderHeading, renderParagraph, wrapSection } from '../utils'

export const renderCyberShowcase = (component: any): string => {
  const { props = {} } = component
  const { title, subtitle, items = [] } = props
  const cards = items
    .map((item: any) => `<div class="cyber-showcase__item">
      ${renderHeading('h3', item.title)}
      ${renderParagraph(item.description)}
      ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title || '')}" />` : ''}
    </div>`)
    .join('')
  return wrapSection('cyber-showcase', `${renderHeading('h2', title)}${renderParagraph(subtitle)}<div class="cyber-showcase__grid">${cards}</div>`)
}

export const renderCyberSuperCard = (component: any): string => {
  const { props = {} } = component
  const { title, subtitle, content, image } = props
  return wrapSection(
    'cyber-super-card',
    `<div class="cyber-super-card__body">
      ${renderHeading('h2', title)}
      ${renderParagraph(subtitle)}
      ${content ? `<div class="cyber-super-card__content">${content}</div>` : ''}
      ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(title || '')}" />` : ''}
    </div>`
  )
}
