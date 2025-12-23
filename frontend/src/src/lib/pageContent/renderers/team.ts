import { escapeHtml, renderHeading, renderParagraph, wrapSection } from '../utils'

export const renderTeamGrid = (component: any): string => {
  const { props = {} } = component
  const { title, subtitle, members = [] } = props
  const items = members
    .map((member: any) => `<div class="team-member">
      ${member.avatar ? `<img src="${escapeHtml(member.avatar)}" alt="${escapeHtml(member.name || '')}" />` : ''}
      ${renderHeading('h3', member.name)}
      ${member.role ? `<p class="team-member__role">${escapeHtml(member.role)}</p>` : ''}
      ${renderParagraph(member.bio)}
    </div>`)
    .join('')
  return wrapSection('team-grid', `${renderHeading('h2', title)}${renderParagraph(subtitle)}<div class="team-grid__items">${items}</div>`)
}

export const renderTestimonials = (component: any): string => {
  const { props = {} } = component
  const { title, subtitle, testimonials = [] } = props
  const items = testimonials
    .map((t: any) => `<blockquote class="testimonial">
      ${renderParagraph(t.quote)}
      ${t.author ? `<cite>${escapeHtml(t.author)}</cite>` : ''}
    </blockquote>`)
    .join('')
  return wrapSection('testimonials', `${renderHeading('h2', title)}${renderParagraph(subtitle)}${items}`)
}
