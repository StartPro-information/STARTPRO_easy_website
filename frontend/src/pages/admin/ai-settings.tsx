import React from 'react'
import AdminLayout from '@/components/AdminLayout'
import AiSettingsPanel from '@/components/admin/ai/AiSettingsPanel'
import AiTemplatesPanel from '@/components/admin/ai/AiTemplatesPanel'

export default function AdminAiSettingsPage() {
  return (
    <AdminLayout title="AI 接入配置" description="配置 AI 供应商与提示词模板">
      <div className="space-y-6">
        <AiSettingsPanel />
        <AiTemplatesPanel />
      </div>
    </AdminLayout>
  )
}
