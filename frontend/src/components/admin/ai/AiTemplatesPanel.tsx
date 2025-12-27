import React, { useEffect, useMemo, useState } from 'react'
import { aiApi } from '@/utils/api'
import toast from 'react-hot-toast'
import { AiTemplate, DEFAULT_TEMPLATES } from './aiDefaults'

const AiTemplatesPanel = () => {
  const [templates, setTemplates] = useState<AiTemplate[]>([])
  const [templateForm, setTemplateForm] = useState<AiTemplate>({
    component_type: '',
    template_name: '',
    template_type: 'generate_props',
    prompt_template: '',
    output_schema: '',
    is_default: 0,
    enabled: 1
  })
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null)

  const parsedOutputSchema = useMemo(() => {
    if (!templateForm.output_schema) return null
    if (typeof templateForm.output_schema === 'object') return templateForm.output_schema
    try {
      return JSON.parse(String(templateForm.output_schema))
    } catch {
      return null
    }
  }, [templateForm.output_schema])

  const loadTemplates = async () => {
    try {
      const response = await aiApi.listTemplates()
      if (response.success) {
        setTemplates(response.data || [])
      }
    } catch (error) {
      console.error('Load AI templates failed:', error)
      toast.error('加载提示词模板失败')
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [])

  const resetTemplateForm = () => {
    setTemplateForm({
      component_type: '',
      template_name: '',
      template_type: 'generate_props',
      prompt_template: '',
      output_schema: '',
      is_default: 0,
      enabled: 1
    })
    setEditingTemplateId(null)
  }

  const handleEditTemplate = (template: AiTemplate) => {
    setEditingTemplateId(template.id || null)
    setTemplateForm({
      component_type: template.component_type,
      template_name: template.template_name,
      template_type: template.template_type,
      prompt_template: template.prompt_template,
      output_schema: template.output_schema || '',
      is_default: template.is_default || 0,
      enabled: template.enabled || 0
    })
  }

  const handleSaveTemplate = async () => {
    if (!templateForm.component_type || !templateForm.template_name || !templateForm.prompt_template) {
      toast.error('请填写完整的模板信息')
      return
    }
    if (templateForm.output_schema && !parsedOutputSchema) {
      toast.error('输出结构不是有效的 JSON')
      return
    }

    try {
      const payload = {
        ...templateForm,
        output_schema: parsedOutputSchema
      }
      if (editingTemplateId) {
        await aiApi.updateTemplate(editingTemplateId, payload)
        toast.success('模板已更新')
      } else {
        await aiApi.createTemplate(payload)
        toast.success('模板已创建')
      }
      resetTemplateForm()
      await loadTemplates()
    } catch (error) {
      console.error('Save AI template failed:', error)
      toast.error('保存模板失败')
    }
  }

  const handleDeleteTemplate = async (id?: number) => {
    if (!id) return
    if (!confirm('确定要删除这个模板吗？')) return
    try {
      await aiApi.deleteTemplate(id)
      toast.success('模板已删除')
      await loadTemplates()
    } catch (error) {
      console.error('Delete AI template failed:', error)
      toast.error('删除模板失败')
    }
  }

  const handleSeedTemplates = async () => {
    const existing = new Set(
      templates.map((item) => `${item.component_type}:${item.template_type}:${item.template_name}`)
    )
    const pending = DEFAULT_TEMPLATES.filter(
      (item) => !existing.has(`${item.component_type}:${item.template_type}:${item.template_name}`)
    )
    if (pending.length === 0) {
      toast('默认模板已存在')
      return
    }
    try {
      for (const item of pending) {
        await aiApi.createTemplate(item)
      }
      toast.success('默认模板已添加')
      await loadTemplates()
    } catch (error) {
      console.error('Seed AI templates failed:', error)
      toast.error('添加默认模板失败')
    }
  }

  return (
    <div className="bg-white dark:bg-tech-light rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">提示词模板</h2>
        <button
          type="button"
          onClick={handleSeedTemplates}
          className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-700 dark:text-gray-200"
        >
          添加默认模板
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          {templates.length === 0 ? (
            <div className="text-sm text-gray-500">暂无模板</div>
          ) : (
            templates.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-gray-200 dark:border-gray-700 p-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.template_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.component_type} / {item.template_type}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditTemplate(item)}
                      className="text-sm text-tech-accent"
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTemplate(item.id)}
                      className="text-sm text-rose-500"
                    >
                      删除
                    </button>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {item.is_default ? '默认模板' : '普通模板'} · {item.enabled ? '启用' : '停用'}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            {editingTemplateId ? '编辑模板' : '新增模板'}
          </h3>
          <div className="space-y-3">
            <input
              value={templateForm.component_type}
              onChange={(e) => setTemplateForm((prev) => ({ ...prev, component_type: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-tech-dark px-3 py-2 text-sm"
              placeholder="组件类型，例如 text-block"
            />
            <input
              value={templateForm.template_name}
              onChange={(e) => setTemplateForm((prev) => ({ ...prev, template_name: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-tech-dark px-3 py-2 text-sm"
              placeholder="模板名称"
            />
            <input
              value={templateForm.template_type}
              onChange={(e) => setTemplateForm((prev) => ({ ...prev, template_type: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-tech-dark px-3 py-2 text-sm"
              placeholder="模板类型，例如 generate_props"
            />
            <textarea
              value={templateForm.prompt_template}
              onChange={(e) => setTemplateForm((prev) => ({ ...prev, prompt_template: e.target.value }))}
              rows={6}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-tech-dark px-3 py-2 text-sm"
              placeholder="提示词内容，支持 {{user_prompt}}、{{current_props}}"
            />
            <textarea
              value={
                typeof templateForm.output_schema === 'string'
                  ? templateForm.output_schema
                  : JSON.stringify(templateForm.output_schema)
              }
              onChange={(e) => setTemplateForm((prev) => ({ ...prev, output_schema: e.target.value }))}
              rows={4}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-tech-dark px-3 py-2 text-sm"
              placeholder="输出结构 JSON（可选）"
            />
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(templateForm.is_default)}
                  onChange={(e) => setTemplateForm((prev) => ({ ...prev, is_default: e.target.checked ? 1 : 0 }))}
                />
                默认模板
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(templateForm.enabled)}
                  onChange={(e) => setTemplateForm((prev) => ({ ...prev, enabled: e.target.checked ? 1 : 0 }))}
                />
                启用
              </label>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveTemplate}
              className="rounded-lg bg-tech-accent px-4 py-2 text-sm text-white hover:bg-tech-secondary"
            >
              {editingTemplateId ? '保存修改' : '新增模板'}
            </button>
            {editingTemplateId && (
              <button
                type="button"
                onClick={resetTemplateForm}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-700 dark:text-gray-200"
              >
                取消编辑
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AiTemplatesPanel
