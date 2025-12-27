import React, { useState } from 'react'

interface AiAssistModalProps {
  isOpen: boolean
  componentName: string
  onClose: () => void
  onGenerate: (prompt: string) => Promise<void>
  isLoading?: boolean
}

const AiAssistModal: React.FC<AiAssistModalProps> = ({
  isOpen,
  componentName,
  onClose,
  onGenerate,
  isLoading = false
}) => {
  const [prompt, setPrompt] = useState('')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/40 px-4">
      <div
        className="w-full max-w-xl rounded-xl border border-semantic-panelBorder bg-semantic-panel shadow-xl"
        style={{ backgroundColor: 'var(--semantic-panel-bg, var(--color-surface, #0f172a))' }}
      >
        <div className="flex items-center justify-between border-b border-theme-divider px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-theme-text">AI 内容生成</h3>
            <p className="text-xs text-theme-textSecondary">当前组件：{componentName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-theme-textSecondary hover:text-theme-text"
          >
            关闭
          </button>
        </div>
        <div className="space-y-4 px-5 py-4">
          <div>
            <label className="block text-sm font-medium text-theme-text mb-2">生成需求</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              className="w-full rounded-lg border border-theme-divider bg-theme-surfaceAlt px-3 py-2 text-sm text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent"
              placeholder="例如：写一段面向企业客户的产品介绍，语气正式，字数控制在200字以内"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-theme-divider px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-theme-divider px-4 py-2 text-sm text-theme-textSecondary hover:text-theme-text"
          >
            取消
          </button>
          <button
            type="button"
            onClick={() => onGenerate(prompt)}
            disabled={!prompt.trim() || isLoading}
            className="rounded-lg bg-tech-accent text-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-tech-secondary disabled:opacity-50"
          >
            {isLoading ? '生成中...' : '生成内容'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AiAssistModal
