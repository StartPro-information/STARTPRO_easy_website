const fs = require('fs/promises')
const path = require('path')

const COLOR_ATTR_REGEX = /(fill|stroke|stop-color)\s*=\s*(["'])(.*?)\2/gi
const STYLE_COLOR_REGEX = /(fill|stroke|stop-color)\s*:\s*([^;"]*)(;?)/gi

const shouldSkipValue = (value = '') => {
  const trimmed = value.trim()
  if (!trimmed) return true
  const lower = trimmed.toLowerCase()
  if (lower === 'none' || lower === 'currentcolor') return true
  if (lower.startsWith('url(')) return true
  return false
}

const toCurrentColorAttr = (match, prop, quote, value) => {
  if (shouldSkipValue(value)) {
    return match
  }
  return `${prop}=${quote}currentColor${quote}`
}

const toCurrentColorStyle = (match, prop, value, suffix) => {
  if (shouldSkipValue(value)) {
    return match
  }
  return `${prop}:currentColor${suffix}`
}

const normalizeSvgContent = (content) => {
  let updated = content
  const afterAttr = updated.replace(COLOR_ATTR_REGEX, toCurrentColorAttr)
  const afterStyle = afterAttr.replace(STYLE_COLOR_REGEX, toCurrentColorStyle)
  const changed = afterStyle !== content
  return { content: afterStyle, changed }
}

const walkDir = async (dir, acc = []) => {
  let entries
  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch (error) {
    return acc
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await walkDir(fullPath, acc)
    } else if (entry.isFile() && fullPath.toLowerCase().endsWith('.svg')) {
      acc.push(fullPath)
    }
  }
  return acc
}

const normalizeSvgAssets = async (directories = [], options = {}) => {
  const { dryRun = false, skipPredicate } = options
  const summary = {
    scanned: 0,
    modified: 0,
    errors: 0,
    details: []
  }

  for (const dir of directories) {
    const svgFiles = await walkDir(dir)
    for (const filePath of svgFiles) {
      if (typeof skipPredicate === 'function' && skipPredicate(filePath)) {
        continue
      }
      summary.scanned += 1
      try {
        const raw = await fs.readFile(filePath, 'utf8')
        const { content, changed } = normalizeSvgContent(raw)
        if (changed) {
          summary.modified += 1
          summary.details.push(filePath)
          if (!dryRun) {
            await fs.writeFile(filePath, content, 'utf8')
          }
        }
      } catch (error) {
        summary.errors += 1
        console.error('[SVG-NORMALIZE] Failed:', filePath, error.message)
      }
    }
  }

  return summary
}

const normalizeSystemDefaultSvgs = async () => {
  const systemDir = path.join(__dirname, '../../system-default')
  return normalizeSvgAssets([systemDir], {
    skipPredicate: (filePath) => filePath.includes(`${path.sep}icons${path.sep}`)
  })
}

module.exports = {
  normalizeSvgAssets,
  normalizeSystemDefaultSvgs
}
