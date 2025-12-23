const express = require('express')
const router = express.Router()
const db = require('../config/database')
const { 
  authenticateToken, 
  requireEditor, 
  logActivity 
} = require('../middleware/auth')

// 获取所有导航项目（公开接口）
router.get('/', async (req, res) => {
  try {
    const [navItems] = await db.execute(`
      SELECT 
        id, name, url, target, parent_id, sort_order, is_active
      FROM navigation 
      WHERE is_active = true
      ORDER BY sort_order ASC, id ASC
    `)

    // 构建层次结构
    const buildTree = (items, parentId = null) => {
      return items
        .filter(item => item.parent_id === parentId)
        .map(item => {
          const children = buildTree(items, item.id);
          // 只在有子项时才添加children属性
          return children.length > 0 ? { ...item, children } : { ...item };
        })
    }

    const navigationTree = buildTree(navItems)

    res.json({
      success: true,
      data: navigationTree
    })
  } catch (error) {
    console.error('获取导航失败:', error)
    res.status(500).json({
      success: false,
      message: '获取导航失败'
    })
  }
})

// 获取所有导航项目（管理接口）
router.get('/admin', authenticateToken, requireEditor, async (req, res) => {
  try {
    const [navItems] = await db.execute(`
      SELECT 
        id, name, url, target, parent_id, sort_order, is_active,
        created_at, updated_at
      FROM navigation 
      ORDER BY sort_order ASC, id ASC
    `)

    res.json({
      success: true,
      data: navItems
    })
  } catch (error) {
    console.error('获取导航列表失败:', error)
    res.status(500).json({
      success: false,
      message: '获取导航列表失败'
    })
  }
})

// 根据ID获取导航项目
router.get('/:id', authenticateToken, requireEditor, async (req, res) => {
  try {
    const { id } = req.params

    const [navItems] = await db.execute(`
      SELECT * FROM navigation WHERE id = ?
    `, [id])

    if (navItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: '导航项目不存在'
      })
    }

    res.json({
      success: true,
      data: navItems[0]
    })
  } catch (error) {
    console.error('获取导航项目失败:', error)
    res.status(500).json({
      success: false,
      message: '获取导航项目失败'
    })
  }
})

// 创建新导航项目
router.post('/', 
  authenticateToken, 
  requireEditor, 
  logActivity('create', 'navigation'),
  async (req, res) => {
    try {
      let { name, url, target, parent_id, sort_order, is_active } = req.body

      // 验证必填字段
      if (!name || !url) {
        return res.status(400).json({
          success: false,
          message: '导航名称和链接地址不能为空'
        })
      }

      // 特殊处理首页链接
      if (name === '首页' && url === '/') {
        url = '/pages/home';
      }

      // 如果有父级ID，验证父级是否存在
      if (parent_id) {
        const [parentItems] = await db.execute(
          'SELECT id FROM navigation WHERE id = ?',
          [parent_id]
        )

        if (parentItems.length === 0) {
          return res.status(400).json({
            success: false,
            message: '父级导航项目不存在'
          })
        }
      }

      // 创建导航项目
      const [result] = await db.execute(`
        INSERT INTO navigation (
          name, url, target, parent_id, sort_order, is_active
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        name,
        url,
        target || '_self',
        parent_id || null,
        sort_order || 0,
        is_active !== undefined ? is_active : true
      ])

      res.status(201).json({
        success: true,
        message: '导航项目创建成功',
        data: {
          id: result.insertId,
          name,
          url,
          target: target || '_self',
          parent_id: parent_id || null,
          sort_order: sort_order || 0,
          is_active: is_active !== undefined ? is_active : true
        }
      })
    } catch (error) {
      console.error('创建导航项目失败:', error)
      res.status(500).json({
        success: false,
        message: '创建导航项目失败'
      })
    }
  }
)

// 更新导航项目
router.put('/:id', 
  authenticateToken, 
  requireEditor, 
  logActivity('update', 'navigation'),
  async (req, res) => {
    try {
      const { id } = req.params
      const updates = []
      const values = []

      // 检查导航项目是否存在
      const [existingItems] = await db.execute(
        'SELECT id FROM navigation WHERE id = ?',
        [id]
      )

      if (existingItems.length === 0) {
        return res.status(404).json({
          success: false,
          message: '导航项目不存在'
        })
      }

      // 如果更新父级ID，验证父级是否存在且不是自己
      if (req.body.parent_id !== undefined) {
        if (req.body.parent_id && req.body.parent_id !== id) {
          const [parentItems] = await db.execute(
            'SELECT id FROM navigation WHERE id = ?',
            [req.body.parent_id]
          )

          if (parentItems.length === 0) {
            return res.status(400).json({
              success: false,
              message: '父级导航项目不存在'
            })
          }
        }
      }

      // 构建更新字段
      const allowedFields = ['name', 'url', 'target', 'parent_id', 'sort_order', 'is_active']
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          // 特殊处理首页链接
          if (field === 'url' && req.body.name === '首页' && req.body[field] === '/') {
            updates.push(`${field} = ?`)
            values.push('/pages/home')
          } else {
            updates.push(`${field} = ?`)
            values.push(req.body[field])
          }
        }
      })

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: '没有可更新的字段'
        })
      }

      // 执行更新
      values.push(id)
      await db.execute(
        `UPDATE navigation SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
        values
      )

      res.json({
        success: true,
        message: '导航项目更新成功'
      })
    } catch (error) {
      console.error('更新导航项目失败:', error)
      res.status(500).json({
        success: false,
        message: '更新导航项目失败'
      })
    }
  }
)

// 删除导航项目
router.delete('/:id', 
  authenticateToken, 
  requireEditor, 
  logActivity('delete', 'navigation'),
  async (req, res) => {
    try {
      const { id } = req.params

      // 检查导航项目是否存在
      const [existingItems] = await db.execute(
        'SELECT id FROM navigation WHERE id = ?',
        [id]
      )

      if (existingItems.length === 0) {
        return res.status(404).json({
          success: false,
          message: '导航项目不存在'
        })
      }

      // 检查是否有子项目
      const [childItems] = await db.execute(
        'SELECT id FROM navigation WHERE parent_id = ?',
        [id]
      )

      if (childItems.length > 0) {
        return res.status(400).json({
          success: false,
          message: '该导航项目下还有子项目，请先删除子项目'
        })
      }

      // 删除导航项目
      await db.execute('DELETE FROM navigation WHERE id = ?', [id])

      res.json({
        success: true,
        message: '导航项目删除成功'
      })
    } catch (error) {
      console.error('删除导航项目失败:', error)
      res.status(500).json({
        success: false,
        message: '删除导航项目失败'
      })
    }
  }
)

// 批量更新导航排序
router.put('/batch/sort', 
  authenticateToken, 
  requireEditor,
  logActivity('update', 'navigation'),
  async (req, res) => {
    try {
      const { items } = req.body

      if (!Array.isArray(items)) {
        return res.status(400).json({
          success: false,
          message: '请提供有效的导航排序数据'
        })
      }

      // 批量更新排序
      for (const item of items) {
        if (item.id && typeof item.sort_order === 'number') {
          await db.execute(
            'UPDATE navigation SET sort_order = ? WHERE id = ?',
            [item.sort_order, item.id]
          )
        }
      }

      res.json({
        success: true,
        message: '导航排序更新成功'
      })
    } catch (error) {
      console.error('更新导航排序失败:', error)
      res.status(500).json({
        success: false,
        message: '更新导航排序失败'
      })
    }
  }
)

module.exports = router