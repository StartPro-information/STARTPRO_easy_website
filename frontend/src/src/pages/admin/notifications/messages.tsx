import React, { useEffect, useMemo, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { notificationsApi } from '@/utils/api'
import type { ContactMessage, ContactMessageField } from '@/types'
import toast from 'react-hot-toast'

interface MessageListResponse {
  success: boolean
  data: ContactMessage[]
  meta?: { total: number; page: number; limit: number }
}

const StatusPill = ({ status }: { status: string }) => (
  <span
    className={`px-2 py-1 rounded text-xs ${
      status === 'read'
        ? 'bg-theme-surfaceAlt text-theme-textSecondary'
        : 'bg-emerald-500/20 text-emerald-600'
    }`}
  >
    {status === 'read' ? '已读' : '未读'}
  </span>
)

const EmailStatus = ({ result }: { result?: string | null }) => {
  if (!result) return <span className="px-2 py-1 rounded text-xs border border-theme-divider text-theme-textSecondary">未发送</span>
  if (result === 'success') return <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-600">已发送</span>
  return <span className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-600">失败</span>
}

const renderFieldList = (fields?: ContactMessageField[]) => {
  if (!fields || !fields.length) return <p className="text-sm text-theme-textSecondary">无更多字段</p>
  return (
    <div className="space-y-2">
      {fields.map((f, idx) => (
        <div key={idx} className="text-sm">
          <span className="font-medium text-theme-text">{f.label || f.name}：</span>
          <span className="text-theme-textSecondary break-all">{f.value || ''}</span>
        </div>
      ))}
    </div>
  )
}

export default function NotificationMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [selected, setSelected] = useState<ContactMessage | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const totalPages = useMemo(() => Math.ceil(total / limit) || 1, [total, limit])

  const fetchList = async (opts?: { page?: number }) => {
    try {
      setIsLoading(true)
      const response = await notificationsApi.getMessages({
        page: opts?.page || page,
        limit,
        keyword: keyword || undefined,
        status: statusFilter || undefined
      }) as unknown as MessageListResponse
      if (response.success) {
        setMessages(response.data || [])
        setTotal(response.meta?.total || 0)
        if (opts?.page) setPage(opts.page)
      } else {
        toast.error('获取通知记录失败')
      }
    } catch (error) {
      console.error('获取通知记录失败', error)
      toast.error('获取通知记录失败')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchList({ page: 1 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openDetail = async (id: number) => {
    try {
      const res = await notificationsApi.getMessage(id)
      if (res.success) {
        const fields = Array.isArray(res.data?.fields_json) ? res.data.fields_json : []
        setSelected({ ...res.data, fields_json: fields })
      } else {
        toast.error(res.message || '获取详情失败')
      }
    } catch (error) {
      console.error('获取详情失败', error)
      toast.error('获取详情失败')
    }
  }

  const markStatus = async (id: number, next: 'new' | 'read') => {
    try {
      const res = await notificationsApi.markMessageRead(id, next)
      if (res.success) {
        toast.success('状态已更新')
        setSelected(prev => prev && prev.id === id ? { ...prev, status: next } : prev)
        fetchList()
      } else {
        toast.error(res.message || '更新失败')
      }
    } catch (error) {
      console.error('更新状态失败', error)
      toast.error('更新状态失败')
    }
  }

  const deleteMessage = async (id: number) => {
    if (!confirm('确认删除该记录吗？')) return
    try {
      const res = await notificationsApi.deleteMessage(id)
      if (res.success) {
        toast.success('已删除')
        setSelected(prev => prev && prev.id === id ? null : prev)
        fetchList()
      } else {
        toast.error(res.message || '删除失败')
      }
    } catch (error) {
      console.error('删除失败', error)
      toast.error('删除失败')
    }
  }

  const resend = async (id: number) => {
    try {
      const res = await notificationsApi.resendMessage(id)
      if (res.success) {
        toast.success('已重发')
        fetchList()
      } else {
        toast.error(res.message || '重发失败')
      }
    } catch (error) {
      console.error('重发失败', error)
      toast.error('重发失败')
    }
  }

  const handleFilter = () => fetchList({ page: 1 })

  return (
    <AdminLayout title="通知设置 - 通知记录" description="查看联系表单提交并管理通知邮件状态">
      <div className="space-y-4">
        <div className="bg-semantic-panel p-4 rounded-xl border border-semantic-panelBorder flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-semibold text-theme-text">通知记录</h1>
              <p className="text-sm text-theme-textSecondary">查看并管理联系表单的通知邮件</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <input
              placeholder="关键词（姓名/邮箱/电话/内容）"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              className="min-w-[220px] px-3 py-2 border border-theme-divider rounded-lg bg-theme-surface text-theme-text"
            />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="min-w-[120px] px-3 py-2 border border-theme-divider rounded-lg bg-theme-surface text-theme-text"
            >
              <option value="">全部状态</option>
              <option value="new">未读</option>
              <option value="read">已读</option>
            </select>
            <button
              onClick={handleFilter}
              className="px-4 py-2 rounded-lg bg-tech-accent text-white hover:bg-tech-accent/90"
            >
              筛选
            </button>
          </div>
        </div>

        <div className="bg-semantic-panel rounded-xl border border-semantic-panelBorder overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[960px] w-full text-sm">
              <thead className="bg-theme-surfaceAlt text-theme-textSecondary">
                <tr>
                  <th className="px-4 py-2 text-left">姓名</th>
                  <th className="px-4 py-2 text-left">邮箱</th>
                  <th className="px-4 py-2 text-left">电话</th>
                  <th className="px-4 py-2 text-left">来源</th>
                  <th className="px-4 py-2 text-left">状态</th>
                  <th className="px-4 py-2 text-left">邮件</th>
                  <th className="px-4 py-2 text-left">时间</th>
                  <th className="px-4 py-2 text-left">操作</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td className="px-4 py-6 text-center" colSpan={8}>加载中...</td></tr>
                ) : messages.length ? messages.map(msg => (
                  <tr key={msg.id} className="border-t border-theme-divider hover:bg-theme-surfaceAlt/60">
                    <td className="px-4 py-2 whitespace-nowrap">{msg.name || '未填'}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{msg.email || '-'}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{msg.phone || '-'}</td>
                    <td className="px-4 py-2">{msg.source_page || '-'}</td>
                    <td className="px-4 py-2"><StatusPill status={msg.status} /></td>
                    <td className="px-4 py-2"><EmailStatus result={msg.email_result} /></td>
                    <td className="px-4 py-2 whitespace-nowrap">{msg.created_at ? new Date(msg.created_at).toLocaleString() : ''}</td>
                    <td className="px-4 py-2 flex flex-wrap gap-2 min-w-[220px]">
                      <button
                        className="px-2 py-1 text-sm border border-theme-divider rounded-lg hover:bg-theme-surfaceAlt"
                        onClick={() => openDetail(msg.id)}
                      >查看</button>
                      <button
                        className="px-2 py-1 text-sm border border-theme-divider rounded-lg hover:bg-theme-surfaceAlt"
                        onClick={() => markStatus(msg.id, msg.status === 'read' ? 'new' : 'read')}
                      >
                        {msg.status === 'read' ? '标为未读' : '标记已读'}
                      </button>
                      <button
                        className="px-2 py-1 text-sm border border-theme-divider rounded-lg hover:bg-theme-surfaceAlt"
                        onClick={() => resend(msg.id)}
                      >重发</button>
                      <button
                        className="px-2 py-1 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                        onClick={() => deleteMessage(msg.id)}
                      >删除</button>
                    </td>
                  </tr>
                )) : (
                  <tr><td className="px-4 py-6 text-center" colSpan={8}>暂无数据</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between p-4 text-sm text-theme-textSecondary">
            <span>共 {total} 条</span>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 text-sm border border-theme-divider rounded-lg disabled:opacity-50"
                disabled={page <= 1}
                onClick={() => fetchList({ page: page - 1 })}
              >上一页</button>
              <span>{page} / {totalPages}</span>
              <button
                className="px-3 py-1 text-sm border border-theme-divider rounded-lg disabled:opacity-50"
                disabled={page >= totalPages}
                onClick={() => fetchList({ page: page + 1 })}
              >下一页</button>
            </div>
          </div>
        </div>

        {selected && (
          <div className="bg-semantic-panel rounded-xl border border-semantic-panelBorder p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-theme-text">消息详情</h3>
                <p className="text-sm text-theme-textSecondary">ID: {selected.id}</p>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-2 text-sm border border-theme-divider rounded-lg hover:bg-theme-surfaceAlt"
                  onClick={() => setSelected(null)}
                >关闭</button>
                <button
                  className="px-3 py-2 text-sm bg-tech-accent text-white rounded-lg hover:bg-tech-accent/90"
                  onClick={() => markStatus(selected.id, selected.status === 'read' ? 'new' : 'read')}
                >
                  {selected.status === 'read' ? '标为未读' : '标记已读'}
                </button>
                <button
                  className="px-3 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                  onClick={() => deleteMessage(selected.id)}
                >删除</button>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div><span className="font-medium text-theme-text">姓名：</span>{selected.name || '未填'}</div>
              <div><span className="font-medium text-theme-text">邮箱：</span>{selected.email || '未填'}</div>
              <div><span className="font-medium text-theme-text">电话：</span>{selected.phone || '未填'}</div>
              <div><span className="font-medium text-theme-text">来源：</span>{selected.source_page || '-'}</div>
              <div><span className="font-medium text-theme-text">时间：</span>{selected.created_at ? new Date(selected.created_at).toLocaleString() : ''}</div>
              <div><span className="font-medium text-theme-text">邮件：</span><EmailStatus result={selected.email_result} /></div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-theme-text mb-1">留言</h4>
              <p className="text-sm text-theme-textSecondary whitespace-pre-wrap">{selected.message || '（无）'}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-theme-text mb-1">全部字段</h4>
              {renderFieldList(selected.fields_json)}
            </div>
            <div className="text-xs text-theme-textSecondary">
              IP：{selected.ip_address || '-'} | UA：{selected.user_agent || '-'}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
