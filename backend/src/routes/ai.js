const express = require('express')
const db = require('../config/database')
const { authenticateToken, requireAdmin, requireEditor, logActivity } = require('../middleware/auth')

const router = express.Router()

const DEFAULT_BASE_URLS = {
  openai: 'https://api.openai.com/v1',
  deepseek: 'https://api.deepseek.com/v1',
  xinference: 'http://localhost:9997/v1'
}

const getDefaultProfile = async () => {
  const [rows] = await db.execute(
    'SELECT * FROM ai_provider_settings WHERE is_default = 1 ORDER BY id ASC LIMIT 1'
  )
  if (rows.length > 0) return rows[0]
  const [fallback] = await db.execute('SELECT * FROM ai_provider_settings ORDER BY id ASC LIMIT 1')
  return fallback[0] || null
}

const getProfileById = async (id) => {
  const [rows] = await db.execute('SELECT * FROM ai_provider_settings WHERE id = ?', [id])
  return rows[0] || null
}

const listProfiles = async () => {
  const [rows] = await db.execute(
    'SELECT * FROM ai_provider_settings ORDER BY is_default DESC, provider ASC, id ASC'
  )
  return rows
}

const createProfile = async (payload) => {
  const {
    profile_name,
    provider,
    api_base,
    api_key,
    model,
    temperature,
    max_tokens,
    top_p,
    enabled,
    is_default
  } = payload

  await db.execute(
    `
      INSERT INTO ai_provider_settings
        (profile_name, provider, api_base, api_key, model, temperature, max_tokens, top_p, enabled, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      profile_name,
      provider,
      api_base,
      api_key,
      model,
      temperature,
      max_tokens,
      top_p,
      enabled ? 1 : 0,
      is_default ? 1 : 0
    ]
  )
}

const updateProfile = async (id, payload) => {
  const {
    profile_name,
    provider,
    api_base,
    api_key,
    model,
    temperature,
    max_tokens,
    top_p,
    enabled
  } = payload

  await db.execute(
    `
      UPDATE ai_provider_settings
      SET profile_name = ?, provider = ?, api_base = ?, api_key = ?, model = ?,
          temperature = ?, max_tokens = ?, top_p = ?, enabled = ?
      WHERE id = ?
    `,
    [
      profile_name,
      provider,
      api_base,
      api_key,
      model,
      temperature,
      max_tokens,
      top_p,
      enabled ? 1 : 0,
      id
    ]
  )
}

const setDefaultProfile = async (id) => {
  await db.execute('UPDATE ai_provider_settings SET is_default = 0')
  await db.execute('UPDATE ai_provider_settings SET is_default = 1 WHERE id = ?', [id])
}

const resolveApiBase = (provider, api_base) => {
  if (api_base && typeof api_base === 'string' && api_base.trim()) return api_base.trim()
  return DEFAULT_BASE_URLS[provider] || DEFAULT_BASE_URLS.openai
}

const ensureFetch = () => {
  if (typeof fetch !== 'function') {
    throw new Error('Global fetch is not available; please use Node 18+ or add a fetch polyfill.')
  }
}

const callChatCompletion = async (settings, prompt) => {
  ensureFetch()
  const apiBase = resolveApiBase(settings.provider, settings.api_base)
  const url = `${apiBase.replace(/\/$/, '')}/chat/completions`
  const payload = {
    model: settings.model,
    messages: [{ role: 'user', content: prompt }],
    temperature: Number(settings.temperature ?? 0.7),
    max_tokens: Number(settings.max_tokens ?? 800),
    top_p: Number(settings.top_p ?? 1.0)
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: settings.api_key ? `Bearer ${settings.api_key}` : undefined
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`AI request failed (${response.status}): ${errorText}`)
    }

    return response.json()
  } finally {
    clearTimeout(timeoutId)
  }
}

const interpolateTemplate = (template, vars) => {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    const value = vars[key]
    return value === undefined || value === null ? '' : String(value)
  })
}

const stripJsonFence = (raw) => {
  if (typeof raw !== 'string') return ''
  const trimmed = raw.trim()
  if (!trimmed) return ''
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  return fenced ? fenced[1].trim() : trimmed
}

const parseJsonSafe = (raw) => {
  try {
    const normalized = stripJsonFence(raw)
    return { ok: true, value: JSON.parse(normalized) }
  } catch (error) {
    return { ok: false, error }
  }
}

// AI settings
router.get('/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const row = await getDefaultProfile()
    res.json({ success: true, data: row || null })
  } catch (error) {
    console.error('Failed to fetch AI settings:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch AI settings' })
  }
})

router.put('/settings', authenticateToken, requireAdmin, logActivity('update', 'ai_provider_settings'), async (req, res) => {
  try {
    const {
      profile_name = '默认配置',
      provider,
      api_base,
      api_key,
      model,
      temperature = 0.7,
      max_tokens = 800,
      top_p = 1.0,
      enabled = true
    } = req.body || {}

    if (!provider || !model) {
      return res.status(400).json({ success: false, message: 'provider and model are required' })
    }

    const existing = await getDefaultProfile()
    if (existing) {
      await updateProfile(existing.id, {
        profile_name,
        provider,
        api_base,
        api_key,
        model,
        temperature,
        max_tokens,
        top_p,
        enabled
      })
      const row = await getProfileById(existing.id)
      res.json({ success: true, data: row })
      return
    }

    await createProfile({
      profile_name,
      provider,
      api_base,
      api_key,
      model,
      temperature,
      max_tokens,
      top_p,
      enabled,
      is_default: 1
    })
    const row = await getDefaultProfile()
    res.json({ success: true, data: row })
  } catch (error) {
    console.error('Failed to update AI settings:', error)
    res.status(500).json({ success: false, message: 'Failed to update AI settings' })
  }
})

router.get('/settings/profiles', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const rows = await listProfiles()
    res.json({ success: true, data: rows })
  } catch (error) {
    console.error('Failed to fetch AI profiles:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch AI profiles' })
  }
})

router.post('/settings/profiles', authenticateToken, requireAdmin, logActivity('create', 'ai_provider_settings'), async (req, res) => {
  try {
    const {
      profile_name,
      provider,
      api_base,
      api_key,
      model,
      temperature = 0.7,
      max_tokens = 800,
      top_p = 1.0,
      enabled = true
    } = req.body || {}

    if (!profile_name || !provider || !model) {
      return res.status(400).json({ success: false, message: 'profile_name, provider and model are required' })
    }

    await createProfile({
      profile_name,
      provider,
      api_base,
      api_key,
      model,
      temperature,
      max_tokens,
      top_p,
      enabled,
      is_default: 0
    })

    const rows = await listProfiles()
    res.json({ success: true, data: rows })
  } catch (error) {
    console.error('Failed to create AI profile:', error)
    res.status(500).json({ success: false, message: 'Failed to create AI profile' })
  }
})

router.put('/settings/profiles/:id', authenticateToken, requireAdmin, logActivity('update', 'ai_provider_settings'), async (req, res) => {
  try {
    const { id } = req.params
    const {
      profile_name,
      provider,
      api_base,
      api_key,
      model,
      temperature = 0.7,
      max_tokens = 800,
      top_p = 1.0,
      enabled = true
    } = req.body || {}

    if (!profile_name || !provider || !model) {
      return res.status(400).json({ success: false, message: 'profile_name, provider and model are required' })
    }

    await updateProfile(id, {
      profile_name,
      provider,
      api_base,
      api_key,
      model,
      temperature,
      max_tokens,
      top_p,
      enabled
    })

    const row = await getProfileById(id)
    res.json({ success: true, data: row })
  } catch (error) {
    console.error('Failed to update AI profile:', error)
    res.status(500).json({ success: false, message: 'Failed to update AI profile' })
  }
})

router.delete('/settings/profiles/:id', authenticateToken, requireAdmin, logActivity('delete', 'ai_provider_settings'), async (req, res) => {
  try {
    const { id } = req.params
    await db.execute('DELETE FROM ai_provider_settings WHERE id = ?', [id])
    const rows = await listProfiles()
    res.json({ success: true, data: rows })
  } catch (error) {
    console.error('Failed to delete AI profile:', error)
    res.status(500).json({ success: false, message: 'Failed to delete AI profile' })
  }
})

router.put('/settings/default/:id', authenticateToken, requireAdmin, logActivity('update', 'ai_provider_settings'), async (req, res) => {
  try {
    const { id } = req.params
    await setDefaultProfile(id)
    const row = await getProfileById(id)
    res.json({ success: true, data: row })
  } catch (error) {
    console.error('Failed to set default AI profile:', error)
    res.status(500).json({ success: false, message: 'Failed to set default AI profile' })
  }
})

router.post('/settings/test', authenticateToken, requireAdmin, logActivity('test', 'ai_provider_settings'), async (req, res) => {
  try {
    const { profileId } = req.body || {}
    const settings = profileId ? await getProfileById(profileId) : await getDefaultProfile()
    if (!settings || settings.enabled === 0) {
      return res.status(400).json({ success: false, message: 'AI settings not configured or disabled' })
    }
    if (!settings.model) {
      return res.status(400).json({ success: false, message: 'AI model is required' })
    }
    if (settings.provider !== 'xinference' && !settings.api_key) {
      return res.status(400).json({ success: false, message: 'API key is required for this provider' })
    }

    const result = await callChatCompletion(settings, 'Say OK.')
    const content = result?.choices?.[0]?.message?.content || ''
    res.json({ success: true, data: { message: content } })
  } catch (error) {
    console.error('Failed to test AI settings:', error)
    res.status(500).json({ success: false, message: error.message || 'Failed to test AI settings' })
  }
})

// Templates
router.get('/templates', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM ai_prompt_templates ORDER BY component_type, template_name')
    res.json({ success: true, data: rows })
  } catch (error) {
    console.error('Failed to fetch AI templates:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch AI templates' })
  }
})

router.post('/templates', authenticateToken, requireAdmin, logActivity('create', 'ai_prompt_templates'), async (req, res) => {
  try {
    const {
      component_type,
      template_name,
      template_type,
      prompt_template,
      output_schema,
      is_default = 0,
      enabled = 1
    } = req.body || {}

    if (!component_type || !template_name || !template_type || !prompt_template) {
      return res.status(400).json({ success: false, message: 'Missing required fields' })
    }

    await db.execute(
      `
        INSERT INTO ai_prompt_templates
          (component_type, template_name, template_type, prompt_template, output_schema, is_default, enabled)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        component_type,
        template_name,
        template_type,
        prompt_template,
        output_schema ? JSON.stringify(output_schema) : null,
        is_default ? 1 : 0,
        enabled ? 1 : 0
      ]
    )

    res.json({ success: true })
  } catch (error) {
    console.error('Failed to create AI template:', error)
    res.status(500).json({ success: false, message: 'Failed to create AI template' })
  }
})

router.put('/templates/:id', authenticateToken, requireAdmin, logActivity('update', 'ai_prompt_templates'), async (req, res) => {
  try {
    const { id } = req.params
    const {
      component_type,
      template_name,
      template_type,
      prompt_template,
      output_schema,
      is_default,
      enabled
    } = req.body || {}

    await db.execute(
      `
        UPDATE ai_prompt_templates
        SET component_type = ?, template_name = ?, template_type = ?, prompt_template = ?,
            output_schema = ?, is_default = ?, enabled = ?
        WHERE id = ?
      `,
      [
        component_type,
        template_name,
        template_type,
        prompt_template,
        output_schema ? JSON.stringify(output_schema) : null,
        is_default ? 1 : 0,
        enabled ? 1 : 0,
        id
      ]
    )

    res.json({ success: true })
  } catch (error) {
    console.error('Failed to update AI template:', error)
    res.status(500).json({ success: false, message: 'Failed to update AI template' })
  }
})

router.delete('/templates/:id', authenticateToken, requireAdmin, logActivity('delete', 'ai_prompt_templates'), async (req, res) => {
  try {
    const { id } = req.params
    await db.execute('DELETE FROM ai_prompt_templates WHERE id = ?', [id])
    res.json({ success: true })
  } catch (error) {
    console.error('Failed to delete AI template:', error)
    res.status(500).json({ success: false, message: 'Failed to delete AI template' })
  }
})

// Generate
router.post('/generate', authenticateToken, requireEditor, logActivity('generate', 'ai'), async (req, res) => {
  try {
    const { componentType, templateType, userPrompt, currentProps } = req.body || {}

    if (!componentType || !templateType || !userPrompt) {
      return res.status(400).json({ success: false, message: 'componentType, templateType, userPrompt are required' })
    }

    const settings = await getDefaultProfile()
    if (!settings || settings.enabled === 0) {
      return res.status(400).json({ success: false, message: 'AI settings not configured or disabled' })
    }

    const [templates] = await db.execute(
      `
        SELECT * FROM ai_prompt_templates
        WHERE component_type = ? AND template_type = ? AND enabled = 1
        ORDER BY is_default DESC, id ASC
        LIMIT 1
      `,
      [componentType, templateType]
    )

    if (templates.length === 0) {
      return res.status(404).json({ success: false, message: 'No template found for this component' })
    }

    const template = templates[0]
    const prompt = interpolateTemplate(template.prompt_template, {
      component_type: componentType,
      user_prompt: userPrompt,
      current_props: JSON.stringify(currentProps || {})
    })

    const result = await callChatCompletion(settings, prompt)
    const content = result?.choices?.[0]?.message?.content || ''

    const parsed = parseJsonSafe(content.trim())
    if (parsed.ok) {
      return res.json({ success: true, data: { props: parsed.value, raw: content } })
    }

    return res.json({ success: true, data: { text: content } })
  } catch (error) {
    console.error('Failed to generate AI content:', error)
    res.status(500).json({ success: false, message: error.message || 'Failed to generate AI content' })
  }
})

module.exports = router
