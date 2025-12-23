import { escapeHtml, renderHeading, renderParagraph, wrapSection } from '../utils'

export const renderNewsList = (component: any): string => {
  const { props = {} } = component
  const { title, subtitle, items = [] } = props
  const list = items
    .map((news: any) => `<article class="news-item">
      ${renderHeading('h3', news.title)}
      ${news.date ? `<p class="news-date">${escapeHtml(news.date)}</p>` : ''}
      ${renderParagraph(news.excerpt || news.summary)}
    </article>`)
    .join('')
  return wrapSection('news-list', `${renderHeading('h2', title)}${renderParagraph(subtitle)}${list}`)
}

export const renderVideoPlayer = (component: any): string => {
  const { props = {} } = component
  const { title, description, url, poster } = props
  return wrapSection(
    'video-player',
    `${renderHeading('h2', title)}${renderParagraph(description)}
    <video controls ${poster ? `poster="${escapeHtml(poster)}"` : ''}>
      ${url ? `<source src="${escapeHtml(url)}" />` : ''}
    </video>`
  )
}
