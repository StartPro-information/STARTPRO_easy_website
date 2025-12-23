import { escapeHtml, renderHeading, renderParagraph, wrapSection } from '../utils'

export const renderCallToAction = (component: any): string => {
  const { props = {} } = component
  const { title, subtitle, buttonText, buttonLink, backgroundColor } = props
  const btn = buttonText ? `<a class="cta-button" href="${escapeHtml(buttonLink || '#')}">${escapeHtml(buttonText)}</a>` : ''
  const style = backgroundColor ? ` style="background-color:${escapeHtml(backgroundColor)}"` : ''
  return wrapSection(
    'call-to-action',
    `<div class="cta-content"${style}>
      ${renderHeading('h2', title)}
      ${renderParagraph(subtitle)}
      ${btn}
    </div>`
  )
}
