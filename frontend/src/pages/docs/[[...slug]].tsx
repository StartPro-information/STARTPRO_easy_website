import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import type { GetServerSideProps } from 'next'
import type { Doc, DocNode } from '@/types'
import DOMPurify from 'isomorphic-dompurify'
import { marked } from 'marked'
import { DocsLayout } from '@/components/docs/DocsLayout'
import { DocsSidebar } from '@/components/docs/DocsSidebar'
import { DocContent } from '@/components/docs/DocContent'

interface DocsPageProps {
  doc: Doc
  tree: DocNode[]
  slugPath: string
  settings: {
    site_name?: string | null
    site_logo?: string | null
    site_favicon?: string | null
    copyright?: string | null
    icp?: string | null
  }
}

const findFirstPublishedSlug = (nodes: DocNode[]): string | null => {
  for (const node of nodes) {
    if (node.status === 'published') return node.slug
    if (node.children) {
      const child = findFirstPublishedSlug(node.children)
      if (child) return child
    }
  }
  return null
}

// 公共侧边栏：文件夹始终保留；文档需已发布
const filterPublishedTree = (nodes: DocNode[]): DocNode[] =>
  nodes
    .filter((node) => node.type === 'folder' || node.status === 'published')
    .map((node) => ({
      ...node,
      children: node.children ? filterPublishedTree(node.children) : []
    }))

const Breadcrumbs = ({ items }: { items: { label: string; href?: string }[] }) => (
  <nav className="text-sm text-[var(--color-text-secondary)] flex flex-wrap items-center gap-2">
    {items.map((item, idx) => (
      <React.Fragment key={item.href || item.label + idx}>
        {idx > 0 && <span>/</span>}
        {item.href ? (
          <a className="hover:text-[var(--color-text-primary)]" href={item.href}>
            {item.label}
          </a>
        ) : (
          <span className="text-[var(--color-text-primary)]">{item.label}</span>
        )}
      </React.Fragment>
    ))}
  </nav>
)

export default function DocsPage({ doc, tree, slugPath, settings }: DocsPageProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([])
  const [activeHeadingId, setActiveHeadingId] = useState<string>('')
  const rawHtml = useMemo(() => marked.parse(doc.content || ''), [doc.content])
  const safeHtml = useMemo(() => DOMPurify.sanitize(rawHtml), [rawHtml])
  const siteName = settings.site_name || doc.title
  const logoName = `${siteName || '文档中心'} | 文档中心`

  // 避免被全局标题覆盖，强制文档页标题
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = `文档 - ${doc.title}`
    }
  }, [doc.title])

  const findPath = useCallback((nodes: DocNode[], target: string, path: string[] = []): string[] | null => {
    for (const node of nodes) {
      const nextPath = [...path, node.slug]
      if (node.slug === target) return nextPath
      if (node.children) {
        const found = findPath(node.children, target, nextPath)
        if (found) return found
      }
    }
    return null
  }, [])

  const defaultExpanded = useMemo(() => {
    const path = findPath(tree, slugPath) || []
    return new Set(path)
  }, [tree, slugPath, findPath])

  // 仅展示文件夹 + 其文档（保持与后台一致）
  const sidebarTree = useMemo(
    () =>
      tree
        .filter((n) => n.type === 'folder')
        .map((folder) => ({
          ...folder,
          children: (folder.children || []).filter((c) => c.type !== 'folder' && c.status === 'published')
        })),
    [tree]
  )

  const [expanded, setExpanded] = useState<Set<string>>(defaultExpanded)

  useEffect(() => {
    setExpanded(defaultExpanded)
  }, [defaultExpanded])

  const toggle = (slug: string) => {
    setExpanded((prev) => {
      const next = new Set<string>()
      if (slug && !prev.has(slug)) next.add(slug)
      return next
    })
  }

  const findNodeBySlug = useCallback((nodes: DocNode[], target: string): DocNode | null => {
    for (const node of nodes) {
      if (node.slug === target) return node
      if (node.children) {
        const found = findNodeBySlug(node.children, target)
        if (found) return found
      }
    }
    return null
  }, [])

  const breadcrumbItems = useMemo(() => {
    const parts = slugPath.split('/').filter(Boolean)
    const items: { label: string; href?: string }[] = [{ label: '文档中心', href: '/docs' }]
    let current = ''
    parts.forEach((part, idx) => {
      current = current ? `${current}/${part}` : part
      const node = findNodeBySlug(tree, current)
      const label = node?.title || part
      const isLast = idx === parts.length - 1
      items.push({ label: isLast ? doc.title : label, href: isLast ? undefined : `/docs/${current}` })
    })
    return items
  }, [slugPath, tree, findNodeBySlug, doc.title])

  const Toc = () => {
    if (!headings.length) return null
    const handleClick = (id: string) => {
      const target = document.getElementById(id)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    return (
      <nav aria-label="本页目录" className="doc-toc__nav">
        <div className="doc-toc__title">本页目录</div>
        <ul className="doc-toc__list">
          {headings.map((h) => (
            <li key={h.id} className={`doc-toc__item level-${h.level} ${activeHeadingId === h.id ? 'is-active' : ''}`}>
              <button type="button" onClick={() => handleClick(h.id)} className="doc-toc__link">
                {h.text}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    )
  }

  return (
    <>
      <Head>
        <title>文档 - {doc.title}</title>
        <link id="favicon" rel="icon" href={settings.site_favicon || settings.site_logo || '/favicon.ico'} />
        <link rel="shortcut icon" href={settings.site_favicon || settings.site_logo || '/favicon.ico'} />
      </Head>
      <DocsLayout
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        logo={{ url: settings.site_logo || undefined, name: logoName }}
        footer={{ copyright: settings.copyright, icp: settings.icp }}
        breadcrumbs={<Breadcrumbs items={breadcrumbItems} />}
        sidebar={<DocsSidebar nodes={sidebarTree} activeSlug={slugPath} expanded={expanded} onToggle={toggle} />}
        toc={<Toc />}
      >
        <DocContent
          title={doc.title}
          summary={doc.summary}
          html={safeHtml}
          onHeadingsChange={setHeadings}
          onActiveHeadingChange={setActiveHeadingId}
        />
      </DocsLayout>

      
    </>
  )
}

export const getServerSideProps: GetServerSideProps<DocsPageProps> = async (context) => {
  const slugParam = context.params?.slug
  const slugPath = Array.isArray(slugParam) ? slugParam.join('/') : ''
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3003'

  try {
    const [treeRes, settingsRes] = await Promise.all([
      fetch(`${baseUrl}/api/docs/tree`),
      fetch(`${baseUrl}/api/settings`).catch(() => null)
    ])
    if (!treeRes.ok) return { notFound: true }
    const treeData = await treeRes.json()
    const tree: DocNode[] = filterPublishedTree(treeData.data || [])

    if (!slugPath) {
      const first = findFirstPublishedSlug(tree)
      if (first) {
        return {
          redirect: { destination: `/docs/${first}`, permanent: false }
        }
      }
      return { notFound: true }
    }

    const docRes = await fetch(`${baseUrl}/api/docs/${slugPath}`)
    if (docRes.status === 404) return { notFound: true }
    const docData = await docRes.json()

    const settingsJson = settingsRes && settingsRes.ok ? await settingsRes.json() : { data: {} }
    const settings = settingsJson?.data || {}

    return {
      props: {
        doc: docData.data,
        tree,
        slugPath,
        settings: {
          site_name: settings.site_name || settings.siteName || '',
          site_logo: settings.site_logo || settings.logo_url || settings.logoUrl || '',
          site_favicon: settings.site_favicon || settings.favicon_url || settings.faviconUrl || settings.icon_url || settings.favicon || '',
          copyright: settings.copyright || '',
          icp: settings.icp || settings.icp_number || ''
        }
      }
    }
  } catch (error) {
    console.error('获取文档失败', error)
    return { notFound: true }
  }
}
