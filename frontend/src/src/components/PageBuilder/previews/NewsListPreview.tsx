import React, { useEffect, useState } from 'react'
import { TemplateComponent } from '@/types/templates'

const NewsMedia: React.FC<{ article: any }> = ({ article }) => {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [article?.image])

  if (article.image && !failed) {
    return (
      <img
        src={article.image}
        alt={article.title}
        className="w-full h-full object-cover news-card-image"
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <div className="w-full h-full flex items-center justify-center text-text-tertiary text-4xl">
      {article.icon || '📰'}
    </div>
  )
}

export const NewsListPreview: React.FC<{ component: TemplateComponent }> = ({ component }) => {
  const {
    title,
    subtitle,
    articles = [],
    widthOption = 'full',
    backgroundColorOption = 'default',
    cardsPerRow = 3
  } = component.props

  const containerClass = widthOption === 'standard' ? 'max-w-screen-2xl mx-auto' : 'w-full'
  const componentClass =
    backgroundColorOption === 'transparent'
      ? 'p-8 rounded-lg shadow-sm news-list-preview'
      : 'bg-color-surface p-8 rounded-lg shadow-sm news-list-preview'

  const parsedPerRow = Number.isFinite(Number(cardsPerRow)) ? Math.max(1, Math.min(6, Number(cardsPerRow))) : 3
  const gridCols =
    parsedPerRow === 1
      ? 'grid-cols-1'
      : parsedPerRow === 2
        ? 'grid-cols-1 md:grid-cols-2'
        : parsedPerRow === 3
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          : parsedPerRow === 4
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
            : parsedPerRow === 5
              ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
              : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'

  return (
    <div className={containerClass}>
      <div className={componentClass}>
        {title && (
          <div className="text-center mb-12 news-list-header">
            <h2 className="text-3xl font-bold mb-4 text-text-primary news-list-title">{title}</h2>
            {subtitle && <p className="text-lg text-text-secondary w-full news-list-subtitle">{subtitle}</p>}
          </div>
        )}

        <div className={`grid ${gridCols} gap-8 news-list-grid`}>
          {articles.map((article: any, index: number) => (
            <div
              key={index}
              className="border border-color-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow news-card"
            >
            <div className="aspect-video bg-color-background overflow-hidden news-card-image-container">
                <NewsMedia article={article} />
            </div>

              <div className="p-6 news-card-content">
                <div className="text-sm text-text-secondary font-medium mb-2 news-card-date">
                  {article.date || '日期'}
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-3 line-clamp-2 news-card-title">
                  {article.title || '新闻标题'}
                </h3>
                <p className="text-text-secondary text-sm line-clamp-3 mb-4 news-card-summary">
                  {article.summary || article.excerpt || '新闻摘要内容'}
                </p>
                <a
                  href={article.link || '#'}
                  className="text-text-primary hover:text-text-secondary font-medium text-sm news-card-link"
                >
                  阅读更多 →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
