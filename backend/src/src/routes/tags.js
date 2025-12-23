const express = require('express')
const router = express.Router()
const db = require('../config/database')
const {
  authenticateToken,
  requireEditor,
  logActivity
} = require('../middleware/auth')

// 获取所有标签
router.get('/', async (req, res) => {
  try {
    const [tags] = await db.execute(`
      SELECT id, name, slug
      FROM tags
      ORDER BY name ASC
    `)

    res.json({
      success: true,
      data: tags
    })
  } catch (error) {
    console.error('获取标签列表失败:', error)
    res.status(500).json({
      success: false,
      message: '获取标签列表失败'
    })
  }
})

// 创建新标签
router.post('/',
  authenticateToken,
  requireEditor,
  logActivity('create', 'tag'),
  async (req, res) => {
    try {
      const { name, slug, description } = req.body

      // 验证必填字段
      if (!name || !slug) {
        return res.status(400).json({
          success: false,
          message: '标签名称和别名不能为空'
        })
      }

      // 检查标签名称是否已存在
      const [existingTags] = await db.execute(
        'SELECT id FROM tags WHERE name = ? OR slug = ?',
        [name, slug]
      )

      if (existingTags.length > 0) {
        return res.status(400).json({
          success: false,
          message: '标签名称或别名已存在'
        })
      }

      // 创建标签
      const [result] = await db.execute(`
        INSERT INTO tags (name, slug, description)
        VALUES (?, ?, ?)
      `, [name, slug, description || null])

      const [newTag] = await db.execute(
        'SELECT * FROM tags WHERE id = ?',
        [result.insertId]
      )

      res.status(201).json({
        success: true,
        message: '标签创建成功',
        data: newTag[0]
      })
    } catch (error) {
      console.error('创建标签失败:', error)
      res.status(500).json({
        success: false,
        message: '创建标签失败'
      })
    }
  }
)

// 更新标签
router.put('/:id',
  authenticateToken,
  requireEditor,
  logActivity('update', 'tag'),
  async (req, res) => {
    try {
      const { id } = req.params
      const { name, slug, description } = req.body

      // 检查标签是否存在
      const [existingTags] = await db.execute(
        'SELECT id FROM tags WHERE id = ?',
        [id]
      )

      if (existingTags.length === 0) {
        return res.status(404).json({
          success: false,
          message: '标签不存在'
        })
      }

      // 检查标签名称是否已存在（排除自己）
      const [conflictTags] = await db.execute(
        'SELECT id FROM tags WHERE (name = ? OR slug = ?) AND id != ?',
        [name, slug, id]
      )

      if (conflictTags.length > 0) {
        return res.status(400).json({
          success: false,
          message: '标签名称或别名已存在'
        })
      }

      // 更新标签
      await db.execute(`
        UPDATE tags
        SET name = ?, slug = ?, description = ?, updated_at = NOW()
        WHERE id = ?
      `, [name, slug, description || null, id])

      const [updatedTag] = await db.execute(
        'SELECT * FROM tags WHERE id = ?',
        [id]
      )

      res.json({
        success: true,
        message: '标签更新成功',
        data: updatedTag[0]
      })
    } catch (error) {
      console.error('更新标签失败:', error)
      res.status(500).json({
        success: false,
        message: '更新标签失败'
      })
    }
  }
)

// 删除标签
router.delete('/:id',
  authenticateToken,
  requireEditor,
  logActivity('delete', 'tag'),
  async (req, res) => {
    try {
      const { id } = req.params

      // 检查标签是否存在
      const [existingTags] = await db.execute(
        'SELECT id FROM tags WHERE id = ?',
        [id]
      )

      if (existingTags.length === 0) {
        return res.status(404).json({
          success: false,
          message: '标签不存在'
        })
      }

      // 删除标签（关联的页面标签会自动删除）
      await db.execute('DELETE FROM tags WHERE id = ?', [id])

      res.json({
        success: true,
        message: '标签删除成功'
      })
    } catch (error) {
      console.error('删除标签失败:', error)
      res.status(500).json({
        success: false,
        message: '删除标签失败'
      })
    }
  }
)

// 获取页面的所有标签
router.get('/page/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params

    const [tags] = await db.execute(`
      SELECT t.*
      FROM tags t
      INNER JOIN page_tags pt ON t.id = pt.tag_id
      WHERE pt.page_id = ?
      ORDER BY t.name ASC
    `, [pageId])

    res.json({
      success: true,
      data: tags
    })
  } catch (error) {
    console.error('获取页面标签失败:', error)
    res.status(500).json({
      success: false,
      message: '获取页面标签失败'
    })
  }
})

// 为页面添加标签
router.post('/page/:pageId',
  authenticateToken,
  requireEditor,
  async (req, res) => {
    try {
      const { pageId } = req.params
      const { tagIds } = req.body

      // 检查页面是否存在
      const [existingPages] = await db.execute(
        'SELECT id FROM pages WHERE id = ?',
        [pageId]
      )

      if (existingPages.length === 0) {
        return res.status(404).json({
          success: false,
          message: '页面不存在'
        })
      }

      // 删除原有的标签关联
      await db.execute('DELETE FROM page_tags WHERE page_id = ?', [pageId])

      // 添加新的标签关联
      if (Array.isArray(tagIds) && tagIds.length > 0) {
        const values = tagIds.map(tagId => [pageId, tagId])
        await db.execute(
          'INSERT INTO page_tags (page_id, tag_id) VALUES ?',
          [values]
        )
      }

      res.json({
        success: true,
        message: '页面标签更新成功'
      })
    } catch (error) {
      console.error('更新页面标签失败:', error)
      res.status(500).json({
        success: false,
        message: '更新页面标签失败'
      })
    }
  }
)

module.exports = router