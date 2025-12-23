import { escapeHtml, renderHeading, renderParagraph, wrapSection } from '../utils'

export const renderStatsSection = (component: any): string => {
  const { props = {} } = component
  const { title, subtitle, stats = [] } = props
  const items = stats
    .map((stat: any) => `<div class="stat-item">
      ${renderHeading('h3', stat.label)}
      <p class="stat-value">${escapeHtml(stat.value || '')}</p>
      ${renderParagraph(stat.description)}
    </div>`)
    .join('')
  return wrapSection('stats-section', `${renderHeading('h2', title)}${renderParagraph(subtitle)}<div class="stats-grid">${items}</div>`)
}

export const renderTimeline = (component: any): string => {
  const { props = {} } = component
  const { title, subtitle, events = [] } = props
  const items = events
    .map((event: any) => `<div class="timeline-item">
      ${renderHeading('h3', event.title)}
      ${event.date ? `<p class="timeline-date">${escapeHtml(event.date)}</p>` : ''}
      ${renderParagraph(event.description)}
    </div>`)
    .join('')
  return wrapSection('timeline', `${renderHeading('h2', title)}${renderParagraph(subtitle)}<div class="timeline-items">${items}</div>`)
}

export const renderCyberTimeline = renderTimeline
