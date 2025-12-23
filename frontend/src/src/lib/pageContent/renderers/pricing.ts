import { escapeHtml, renderHeading, renderList, renderParagraph, wrapSection } from '../utils'

export const renderPricingCards = (component: any): string => {
  const { props = {} } = component
  const { title, subtitle, plans = [] } = props
  const items = plans
    .map((plan: any) => `<div class="price-card${plan.recommended ? ' price-card--featured' : ''}">
      ${renderHeading('h3', plan.name)}
      <div class="price-card__price">${plan.price ? escapeHtml(plan.price) : '0'}${plan.period ? `/${escapeHtml(plan.period)}` : ''}</div>
      ${renderList(plan.features)}
    </div>`)
    .join('')
  return wrapSection(
    'pricing-section',
    `${renderHeading('h2', title)}${renderParagraph(subtitle)}<div class="pricing-grid">${items}</div>`
  )
}
