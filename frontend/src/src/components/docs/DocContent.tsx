import React, { useEffect, useRef } from 'react'

interface DocContentProps {
  title: string
  summary?: string | null
  html: string
  onHeadingsChange?: (headings: { id: string; text: string; level: number }[]) => void
  onActiveHeadingChange?: (id: string) => void
}

const slugify = (text: string) =>
  text
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\- ]+/g, '')
    .replace(/\s+/g, '-')

export const DocContent: React.FC<DocContentProps> = ({ title, summary, html, onHeadingsChange, onActiveHeadingChange }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const copyText = async (text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        return true
      }
    } catch (err) {
      // fallback below
    }
    try {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      return true
    } catch (err) {
      return false
    }
  }

  useEffect(() => {
    const root = containerRef.current
    if (!root) return
    // 为所有 <pre> 添加复制按钮
    const pres = Array.from(root.querySelectorAll('pre'))
    pres.forEach((pre) => {
      if (pre.querySelector('.code-copy-btn')) return
      const btn = document.createElement('button')
      btn.className = 'code-copy-btn'
      btn.innerText = '复制'
      btn.addEventListener('click', async (e) => {
        e.stopPropagation()
        e.preventDefault()
        const codeEl = pre.querySelector('code')
        const codeText = codeEl?.textContent || pre.textContent || ''
        const ok = await copyText(codeText.trim())
        btn.innerText = ok ? '已复制' : '复制失败'
        setTimeout(() => (btn.innerText = '复制'), 1200)
      })
      pre.appendChild(btn)
    })
  }, [html])

  useEffect(() => {
    const root = containerRef.current
    if (!root) return

    const headingEls = Array.from(root.querySelectorAll<HTMLHeadingElement>('h1, h2'))
    const headings = headingEls.map((el, idx) => {
      let id = el.id
      const text = (el.textContent || '').trim() || `heading-${idx + 1}`
      if (!id) {
        id = slugify(text) || `heading-${idx + 1}`
        el.id = id
      }
      return { id, text, level: Number(el.tagName.replace('H', '')) || 2 }
    })

    onHeadingsChange?.(headings)
    if (!headingEls.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.target as HTMLElement).offsetTop - (b.target as HTMLElement).offsetTop)
        if (visible[0]) {
          onActiveHeadingChange?.((visible[0].target as HTMLElement).id)
        }
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: [0, 0.25, 0.5, 1]
      }
    )

    headingEls.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [html, onHeadingsChange, onActiveHeadingChange])

  return (
    <div className="doc-main__inner">
      <header className="doc-header">
        <h1 className="doc-title">
          <span aria-hidden="true" style={{ marginRight: '8px' }}>📄</span>
          {title}
        </h1>
        {summary && <p className="doc-summary">{summary}</p>}
      </header>
      <div ref={containerRef} className="doc-html" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
