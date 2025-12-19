/**
 * 获取API服务器基础URL
 */
const getApiBaseUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:3001'
  
  // 在开发环境中使用localhost，在生产环境中使用window.location.hostname
  const protocol = window.location.protocol
  const hostname = process.env.NODE_ENV === 'production' ? window.location.hostname : 'localhost'
  return `${protocol}//${hostname}:3001`
}

/**
 * 动态更新网站favicon
 */
export const updateFavicon = (faviconUrl: string) => {
  if (typeof window === 'undefined') return

  console.log('更新favicon:', faviconUrl)

  const managedAttrSelector = "[data-managed='site-favicon']"
  const ensureLink = (rel: string, id?: string) => {
    let link = (id
      ? document.getElementById(id)
      : document.querySelector(`link[rel='${rel}']${managedAttrSelector}`)) as HTMLLinkElement | null

    if (!link && !id) {
      // 若页面已有未标记的 rel 链接，直接复用并打标记，避免重复插入
      link = document.querySelector(`link[rel='${rel}']`) as HTMLLinkElement | null
    }
    if (!link) {
      link = document.createElement('link')
      link.rel = rel
      if (id) link.id = id
      link.setAttribute('data-managed', 'site-favicon')
      document.head.appendChild(link)
    } else {
      link.setAttribute('data-managed', 'site-favicon')
      link.rel = rel
    }
    return link
  }

  // 未配置 favicon：不做任何兜底，移除我们注入/管理的 link，让浏览器按默认规则处理
  if (!faviconUrl) {
    document.querySelectorAll(`link${managedAttrSelector}`).forEach((el) => el.parentNode?.removeChild(el))
    return
  }

  let finalFaviconUrl = faviconUrl
  if (!faviconUrl.startsWith('/') && !faviconUrl.startsWith('http')) {
    finalFaviconUrl = `/${faviconUrl}`
  }

  console.log('最终favicon URL:', finalFaviconUrl)

  // 创建/更新 favicon 元素（前台页面可能没有任何 <link rel="icon">）
  const faviconElement = ensureLink('icon', 'favicon')
  const shortcutIconElement = ensureLink('shortcut icon')
  const appleTouchIconElement = ensureLink('apple-touch-icon', 'apple-touch-icon')

  // 添加时间戳避免缓存问题
  const urlWithTimestamp = finalFaviconUrl + '?v=' + Date.now()
  faviconElement.href = urlWithTimestamp
  shortcutIconElement.href = urlWithTimestamp
  appleTouchIconElement.href = urlWithTimestamp
}

/**
 * 动态更新网站标题
 */
export const updateTitle = (title: string) => {
  if (typeof window === 'undefined') return

  document.title = title
}

/**
 * 动态更新Open Graph元信息
 */
export const updateOGMeta = (siteName: string, description: string, logoUrl?: string) => {
  if (typeof window === 'undefined') return

  console.log('更新OG信息:', { siteName, description, logoUrl })

  // 由于Next.js已经配置了uploads代理，直接使用路径即可
  let finalLogoUrl = logoUrl
  if (logoUrl && !logoUrl.startsWith('/') && !logoUrl.startsWith('http')) {
    finalLogoUrl = `/${logoUrl}`
  }

  console.log('最终logo URL:', finalLogoUrl)

  // 更新 og:title
  const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement
  if (ogTitle) {
    ogTitle.content = siteName
  }

  // 更新 og:description
  const ogDescription = document.querySelector('meta[property="og:description"]') as HTMLMetaElement
  if (ogDescription) {
    ogDescription.content = description
  }

  // 更新 og:image
  if (finalLogoUrl) {
    const ogImage = document.querySelector('meta[property="og:image"]') as HTMLMetaElement
    if (ogImage) {
      ogImage.content = finalLogoUrl
    }
  }

  // 更新页面描述
  const descriptionMeta = document.querySelector('meta[name="description"]') as HTMLMetaElement
  if (descriptionMeta) {
    descriptionMeta.content = description
  }
}
