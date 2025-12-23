const express = require('express')
const router = express.Router()
const db = require('../config/database')
const { authenticateToken, requireEditor, logActivity } = require('../middleware/auth')
const {
  validateCreatePage,
  validateUpdatePage,
  validatePagination,
  validateId,
  validateSlug
} = require('../middleware/validation')
const { parseTemplateData, generateHtmlFromComponents } = require('../utils/pageContent')

// Helpers
const normalizeSlug = (title, slug) => {
  let pageSlug = slug
  if (title && title.includes('首页') && pageSlug === '/') {
    pageSlug = 'home'
  }
  if (pageSlug && typeof pageSlug === 'string') {
    pageSlug = pageSlug.trim()
    if (pageSlug === '' || pageSlug === '/') {
      pageSlug = 'home'
    }
  } else {
    pageSlug = 'page-' + Date.now()
  }
  return pageSlug
}

const attachTags = async (pageId) => {
  try {
    const [tags] = await db.execute(
      `
        SELECT t.id, t.name
        FROM tags t
        INNER JOIN page_tags pt ON t.id = pt.tag_id
        WHERE pt.page_id = ?
        ORDER BY t.name ASC
      `,
      [pageId]
    )
    return tags.map((tag) => ({
      id: `tag_${tag.id}`,
      name: tag.name
    }))
  } catch (err) {
    console.error('获取页面标签失败:', err)
    return []
  }
}

// 获取所有页面（支持分页和搜索）
router.get('/', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const offset = (pageNum - 1) * limitNum

    let whereClause = ''
    let searchParams = []

    if (!req.headers.authorization) {
      whereClause = 'WHERE published = true'
    } else {
      whereClause = 'WHERE 1=1'
    }

    if (search) {
      whereClause += ' AND (title LIKE ? OR content LIKE ?)'
      searchParams.push(`%${search}%`, `%${search}%`)
    }

    let tagFilterSql = ''
    let tagFilterParams = []
    const tagIds = req.query.tagIds
    const includeNoTags = req.query.includeNoTags === 'true'

    let cleanedTagIds = []
    if (tagIds) {
      const tagIdArray = Array.isArray(tagIds) ? tagIds : [tagIds]
      cleanedTagIds = tagIdArray
        .map((id) => {
          const cleanId = String(id).replace(/^tag_/, '')
          const numId = Number(cleanId)
          return isNaN(numId) ? null : numId
        })
        .filter((id) => id !== null && id > 0)
    }

    if (cleanedTagIds.length > 0 || includeNoTags) {
      const conditions = []
      if (cleanedTagIds.length > 0) {
        const placeholders = cleanedTagIds.map(() => '?').join(',')
        conditions.push(`pages.id IN (SELECT DISTINCT page_id FROM page_tags WHERE tag_id IN (${placeholders}))`)
        tagFilterParams = [...cleanedTagIds]
      }
      if (includeNoTags) {
        conditions.push(`pages.id NOT IN (SELECT DISTINCT page_id FROM page_tags WHERE page_id IS NOT NULL)`)
      }
      if (conditions.length > 0) {
        tagFilterSql = `AND (${conditions.join(' OR ')})`
      }
    }

    const countSql = `SELECT COUNT(*) as total FROM pages ${whereClause} ${tagFilterSql}`
    const [countResult] = await db.execute(countSql, [...searchParams, ...tagFilterParams])
    const total = countResult[0].total

    const [pages] = await db.execute(
      `
      SELECT
        pages.id, pages.title, pages.slug, pages.excerpt, pages.featured_image,
        pages.meta_title, pages.meta_description, pages.published, pages.sort_order, pages.template_data,
        pages.created_at, pages.updated_at,
        u.username as created_by_name
      FROM pages
      LEFT JOIN users u ON pages.created_by = u.id
      ${whereClause} ${tagFilterSql}
      ORDER BY pages.sort_order ASC, pages.created_at DESC
      LIMIT ${limitNum} OFFSET ${offset}
    `,
      [...searchParams, ...tagFilterParams]
    )

    const processedPages = await Promise.all(
      pages.map(async (page) => {
        const processedPage = { ...page, template_data: parseTemplateData(page.template_data) }
        processedPage.tags = await attachTags(page.id)
        return processedPage
      })
    )

    res.json({
      success: true,
      data: processedPages,
      meta: {
        current_page: pageNum,
        per_page: limitNum,
        total,
        total_pages: Math.ceil(total / limitNum),
        has_next: pageNum < Math.ceil(total / limitNum),
        has_prev: pageNum > 1
      }
    })
  } catch (error) {
    console.error('获取页面列表失败:', error)
    res.status(500).json({
      success: false,
      message: '获取页面列表失败'
    })
  }
})

// 获取页面组件数据
router.get('/:id/components', validateId, async (req, res) => {
  try {
    const { id } = req.params

    const [components] = await db.execute(
      `
      SELECT component_id as id, component_type as type, component_props as props
      FROM component_blocks
      WHERE page_id = ?
      ORDER BY sort_order ASC
    `,
      [id]
    )

    if (components.length === 0) {
      const [pages] = await db.execute(
        `
        SELECT template_data
        FROM pages
        WHERE id = ?
      `,
        [id]
      )

      if (pages.length === 0) {
        return res.status(404).json({
          success: false,
          message: '页面不存在'
        })
      }

      const templateData = parseTemplateData(pages[0].template_data)
      return res.json({
        success: true,
        data: templateData ? templateData.components : []
      })
    }

    res.json({
      success: true,
      data: components
    })
  } catch (error) {
    console.error('获取页面组件失败:', error)
    res.status(500).json({
      success: false,
      message: '获取页面组件失败'
    })
  }
})

// 根据ID获取页面
router.get('/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params

    const [pages] = await db.execute(
      `
      SELECT 
        p.*,
        u.username as created_by_name
      FROM pages p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.id = ?
    `,
      [id]
    )

    if (pages.length === 0) {
      return res.status(404).json({
        success: false,
        message: '页面不存在'
      })
    }

    const page = pages[0]

    if (!page.published && !req.headers.authorization) {
      return res.status(404).json({
        success: false,
        message: '页面不存在'
      })
    }

    const processedPage = { ...page, template_data: parseTemplateData(page.template_data) }
    processedPage.tags = await attachTags(page.id)

    if (page.published) {
      const logData = {
        user_id: req.user ? req.user.id : null,
        action: 'view',
        resource_type: 'page',
        resource_id: page.id,
        description: `访问页面: ${page.title}`,
        ip_address: req.ip || req.connection.remoteAddress,
        user_agent: req.get('User-Agent')
      }

      db.execute(
        'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, description, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [logData.user_id, logData.action, logData.resource_type, logData.resource_id, logData.description, logData.ip_address, logData.user_agent]
      ).catch((err) => console.error('记录页面访问日志失败:', err))
    }

    res.json({
      success: true,
      data: processedPage
    })
  } catch (error) {
    console.error('获取页面失败:', error)
    res.status(500).json({
      success: false,
      message: '获取页面失败'
    })
  }
})

// 根据slug获取页面
router.get('/slug/:slug', validateSlug, async (req, res) => {
  try {
    const { slug } = req.params

    const [pages] = await db.execute(
      `
      SELECT 
        p.*,
        u.username as created_by_name
      FROM pages p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.slug = ?
    `,
      [slug]
    )

    if (pages.length === 0) {
      return res.status(404).json({
        success: false,
        message: '页面不存在'
      })
    }

    const page = pages[0]

    if (!page.published && !req.headers.authorization) {
      return res.status(404).json({
        success: false,
        message: '页面不存在'
      })
    }

    const processedPage = { ...page, template_data: parseTemplateData(page.template_data) }
    processedPage.tags = await attachTags(page.id)

    if (page.published) {
      const logData = {
        user_id: req.user ? req.user.id : null,
        action: 'view',
        resource_type: 'page',
        resource_id: page.id,
        description: `访问页面: ${page.title}`,
        ip_address: req.ip || req.connection.remoteAddress,
        user_agent: req.get('User-Agent')
      }

      db.execute(
        'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, description, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [logData.user_id, logData.action, logData.resource_type, logData.resource_id, logData.description, logData.ip_address, logData.user_agent]
      ).catch((err) => console.error('记录页面访问日志失败:', err))
    }

    res.json({
      success: true,
      data: processedPage
    })
  } catch (error) {
    console.error('获取页面失败:', error)
    res.status(500).json({
      success: false,
      message: '获取页面失败'
    })
  }
})

// 创建新页面
router.post('/',
  authenticateToken,
  requireEditor,
  validateCreatePage,
  logActivity('create', 'page'),
  async (req, res) => {
    try {
      const pageData = { ...req.body, created_by: req.user.id }
      const parsedTemplateData = parseTemplateData(pageData.template_data)
      const contentFromTemplate = (!pageData.content || pageData.content.trim() === '') && parsedTemplateData?.components
        ? generateHtmlFromComponents(parsedTemplateData.components)
        : pageData.content
      const templateDataToStore = parsedTemplateData ? JSON.stringify(parsedTemplateData) : null

      const pageSlug = normalizeSlug(pageData.title, pageData.slug)

      const [existingPages] = await db.execute('SELECT id FROM pages WHERE slug = ?', [pageSlug])
      if (existingPages.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'URL别名已存在'
        })
      }

      const [result] = await db.execute(
        `
        INSERT INTO pages (
          title, slug, content, excerpt, featured_image,
          meta_title, meta_description, published, sort_order, template_data, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          pageData.title,
          pageSlug,
          contentFromTemplate,
          pageData.excerpt || null,
          pageData.featured_image || null,
          pageData.meta_title || null,
          pageData.meta_description || null,
          pageData.published,
          pageData.sort_order || 0,
          templateDataToStore,
          pageData.created_by
        ]
      )

      const tags = Array.isArray(pageData.tags)
        ? pageData.tags
        : (typeof pageData.tags === 'string' ? [pageData.tags] : [])

      if (tags.length > 0) {
        try {
          const tagValues = tags
            .map((tagId) => {
              const rawId = typeof tagId === 'string' ? tagId.replace('tag_', '') : tagId.toString()
              const tagIdValue = Number(rawId)
              return isNaN(tagIdValue) ? null : [result.insertId, tagIdValue]
            })
            .filter(Boolean)

          if (tagValues.length > 0) {
            await db.execute('INSERT INTO page_tags (page_id, tag_id) VALUES ?', [tagValues])
          }
        } catch (tagError) {
          console.error('关联页面标签失败:', tagError)
        }
      }

      res.status(201).json({
        success: true,
        message: '页面创建成功',
        data: {
          id: result.insertId,
          ...pageData,
          content: contentFromTemplate,
          template_data: parsedTemplateData
        }
      })

      if (parsedTemplateData && parsedTemplateData.components && Array.isArray(parsedTemplateData.components)) {
        try {
          for (let i = 0; i < parsedTemplateData.components.length; i++) {
            const component = parsedTemplateData.components[i]
            await db.execute(
              `INSERT INTO component_blocks (page_id, component_id, component_type, component_props, sort_order) VALUES (?, ?, ?, ?, ?)`,
              [
                result.insertId,
                component.id,
                component.type,
                JSON.stringify(component.props),
                i
              ]
            )
          }
        } catch (componentError) {
          console.error('创建组件区块数据失败:', componentError)
        }
      }
    } catch (error) {
      console.error('创建页面失败:', error)
      res.status(500).json({
        success: false,
        message: '创建页面失败'
      })
    }
  }
)

// 更新页面
router.put('/:id',
  authenticateToken,
  requireEditor,
  validateId,
  logActivity('update', 'page'),
  async (req, res) => {
    try {
      const { id } = req.params
      const updates = []
      const values = []

      const [existingPages] = await db.execute('SELECT id FROM pages WHERE id = ?', [id])
      if (existingPages.length === 0) {
        return res.status(404).json({
          success: false,
          message: '页面不存在'
        })
      }

      const parsedTemplateData = parseTemplateData(req.body.template_data)
      if (parsedTemplateData && (!req.body.content || req.body.content.trim() === '')) {
        req.body.content = generateHtmlFromComponents(parsedTemplateData.components || [])
      }
      if (parsedTemplateData) {
        req.body.template_data = JSON.stringify(parsedTemplateData)
      }

      const allowedFields = ['title', 'slug', 'content', 'excerpt', 'featured_image', 'meta_title', 'meta_description', 'published', 'sort_order', 'template_data']

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          if (field === 'slug') {
            let slugValue = req.body[field]
            if (req.body.title && req.body.title.includes('首页') && slugValue === '/') {
              slugValue = 'home'
            }
            if (slugValue && typeof slugValue === 'string') {
              slugValue = slugValue.trim()
              if (slugValue === '' || slugValue === '/') {
                slugValue = 'home'
              }
            } else {
              slugValue = 'page-' + Date.now()
            }
            updates.push(`${field} = ?`)
            values.push(slugValue)
          } else {
            updates.push(`${field} = ?`)
            values.push(req.body[field])
          }
        }
      })

      if (updates.length === 0 && (req.body.tags === undefined || !Array.isArray(req.body.tags) || req.body.tags.length === 0)) {
        return res.status(400).json({
          success: false,
          message: '没有可更新的字段'
        })
      }

      if (req.body.slug) {
        let slugToCheck = req.body.slug
        if (req.body.title === '首页' && slugToCheck === '/') {
          slugToCheck = 'home'
        }
        const [conflictPages] = await db.execute('SELECT id FROM pages WHERE slug = ? AND id != ?', [slugToCheck, id])
        if (conflictPages.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'URL别名已存在'
          })
        }
      }

      const connection = await db.getConnection()
      await connection.beginTransaction()

      try {
        if (updates.length > 0) {
          values.push(id)
          await connection.execute(`UPDATE pages SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, values)
        } else {
          await connection.execute('UPDATE pages SET updated_at = NOW() WHERE id = ?', [id])
        }

        if (req.body.tags !== undefined) {
          await connection.execute('DELETE FROM page_tags WHERE page_id = ?', [id])
          const tagIds = Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags]
          const validIds = tagIds
            .map((tag) => {
              const cleanId = String(tag).replace(/^tag_/, '')
              const numId = Number(cleanId)
              return Number.isInteger(numId) && numId > 0 ? numId : null
            })
            .filter((v) => v !== null)

          if (validIds.length > 0) {
            const placeholders = validIds.map(() => '(?, ?)').join(',')
            const flatValues = validIds.flatMap((tagId) => [id, tagId])
            await connection.execute(`INSERT INTO page_tags (page_id, tag_id) VALUES ${placeholders}`, flatValues)
          }
        }

        await connection.commit()
      } catch (err) {
        await connection.rollback()
        throw err
      } finally {
        connection.release()
      }

      if (parsedTemplateData) {
        try {
          await db.execute('DELETE FROM component_blocks WHERE page_id = ?', [id])
          if (parsedTemplateData.components && Array.isArray(parsedTemplateData.components)) {
            for (let i = 0; i < parsedTemplateData.components.length; i++) {
              const component = parsedTemplateData.components[i]
              await db.execute(
                `INSERT INTO component_blocks (page_id, component_id, component_type, component_props, sort_order) VALUES (?, ?, ?, ?, ?)`,
                [
                  id,
                  component.id,
                  component.type,
                  JSON.stringify(component.props),
                  i
                ]
              )
            }
          }
        } catch (componentError) {
          console.error('更新组件区块数据失败:', componentError)
        }
      }

      res.json({
        success: true,
        message: '页面更新成功'
      })
    } catch (error) {
      console.error('更新页面失败:', error)
      res.status(500).json({
        success: false,
        message: '更新页面失败'
      })
    }
  }
)

// 删除页面
router.delete('/:id',
  authenticateToken,
  requireEditor,
  validateId,
  logActivity('delete', 'page'),
  async (req, res) => {
    try {
      const { id } = req.params

      const [existingPages] = await db.execute('SELECT id FROM pages WHERE id = ?', [id])
      if (existingPages.length === 0) {
        return res.status(404).json({
          success: false,
          message: '页面不存在'
        })
      }

      await db.execute('DELETE FROM pages WHERE id = ?', [id])

      res.json({
        success: true,
        message: '页面删除成功'
      })
    } catch (error) {
      console.error('删除页面失败:', error)
      res.status(500).json({
        success: false,
        message: '删除页面失败'
      })
    }
  }
)

// 批量更新页面排序
router.put('/batch/sort',
  authenticateToken,
  requireEditor,
  async (req, res) => {
    try {
      const { pages } = req.body

      if (!Array.isArray(pages)) {
        return res.status(400).json({
          success: false,
          message: '请提供有效的页面排序数据'
        })
      }

      for (const page of pages) {
        if (page.id && typeof page.sort_order === 'number') {
          await db.execute('UPDATE pages SET sort_order = ? WHERE id = ?', [page.sort_order, page.id])
        }
      }

      res.json({
        success: true,
        message: '页面排序更新成功'
      })
    } catch (error) {
      console.error('更新页面排序失败:', error)
      res.status(500).json({
        success: false,
        message: '更新页面排序失败'
      })
    }
  }
)

module.exports = router
