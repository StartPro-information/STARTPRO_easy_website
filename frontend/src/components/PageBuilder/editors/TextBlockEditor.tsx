import React, { useEffect, useRef, useState } from 'react'

interface TextBlockEditorProps {
  content?: string
  onContentChange: (value: string) => void
}

const TOOLBAR_ALLOW_LIST = new Set([
  'heading',
  'bold',
  'italic',
  'underline',
  'strikethrough',
  'highlight',
  'link',
  'alignment',
  'codeBlock',
  'bulletedList',
  'numberedList',
  'todoList',
  'emoji',
  '|'
])

const buildToolbar = (baseConfig: any) => {
  const baseToolbar = Array.isArray(baseConfig?.toolbar)
    ? baseConfig.toolbar
    : Array.isArray(baseConfig?.toolbar?.items)
      ? baseConfig.toolbar.items
      : null

  const source = Array.isArray(baseToolbar) && baseToolbar.length > 0 ? baseToolbar : Array.from(TOOLBAR_ALLOW_LIST)
  const filtered = source.filter((item: any) => typeof item === 'string' && TOOLBAR_ALLOW_LIST.has(item))
  return filtered.length > 0 ? filtered : ['bold', 'italic', 'link']
}

const TextBlockEditor: React.FC<TextBlockEditorProps> = ({ content, onContentChange }) => {
  const editorHostRef = useRef<HTMLDivElement | null>(null)
  const editorInstanceRef = useRef<any>(null)
  const lastContentRef = useRef<string>('')
  const [editorError, setEditorError] = useState<string | null>(null)
  const [editorReady, setEditorReady] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    let mounted = true

    const loadAsset = (type: 'css' | 'js', url: string, attr: string) =>
      new Promise<void>((resolve, reject) => {
        if (document.querySelector(`[${attr}="${url}"]`)) {
          resolve()
          return
        }
        if (type === 'css') {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = url
          link.setAttribute(attr, url)
          link.onload = () => resolve()
          link.onerror = () => reject(new Error(`Failed to load ${url}`))
          document.head.appendChild(link)
          return
        }
        const script = document.createElement('script')
        script.src = url
        script.async = true
        script.setAttribute(attr, url)
        script.onload = () => resolve()
        script.onerror = () => reject(new Error(`Failed to load ${url}`))
        document.body.appendChild(script)
      })

    const initEditor = async () => {
      if (!editorHostRef.current || typeof window === 'undefined') return
      const w = window as any

      if (!w.CKEDITOR && !w.ClassicEditor && !w.CKEditor) {
        await loadAsset('css', '/ck-umd/cke-global.css', 'data-ckeditor-css')
        await loadAsset('js', '/ck-umd/cke-global.umd.js', 'data-ckeditor-js')
      }

      const ClassicEditor = w.CKEDITOR?.ClassicEditor || w.ClassicEditor || w.CKEditor?.ClassicEditor
      if (!ClassicEditor) {
        throw new Error('CKEditor not found')
      }

      w.CKEDITOR_LICENSE_KEY = 'GPL'
      const baseConfig = w.CKEDITOR_DEFAULT_CONFIG || {}
      const toolbar = buildToolbar(baseConfig)
      const filteredPlugins = Array.isArray(baseConfig.plugins)
        ? baseConfig.plugins.filter(
            (plugin: any) =>
              plugin?.pluginName !== 'Markdown' &&
              plugin?.pluginName !== 'Title' &&
              plugin?.pluginName !== 'TitleUI' &&
              plugin?.pluginName !== 'TitleEditing'
          )
        : baseConfig.plugins
      const baseHeading = baseConfig.heading || {}
      const headingOptions = Array.isArray(baseHeading.options)
        ? baseHeading.options
        : [
            { model: 'paragraph', title: '正文', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: '标题 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: '标题 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: '标题 3', class: 'ck-heading_heading3' }
          ]

      editorInstanceRef.current = await ClassicEditor.create(editorHostRef.current, {
        ...baseConfig,
        plugins: filteredPlugins,
        toolbar,
        removePlugins: ['Markdown', 'Title', 'TitleUI', 'TitleEditing'],
        heading: {
          ...baseHeading,
          options: headingOptions
        },
        licenseKey: 'GPL',
        placeholder: '请输入正文内容...'
      })


      const initial = typeof content === 'string' ? content : ''
        if (initial) {
          editorInstanceRef.current.setData(initial)
          lastContentRef.current = initial
        }

        const mainRoot = editorInstanceRef.current.model.document.getRoot('main')
        if (mainRoot) {
          editorInstanceRef.current.model.change((writer: any) => {
            writer.setSelection(writer.createPositionAt(mainRoot, 0))
          })
        }
        editorInstanceRef.current.editing.view.focus()

      editorInstanceRef.current.model.document.on('change:data', () => {
        const data = editorInstanceRef.current.getData()
        lastContentRef.current = data
        onContentChange(data)
      })

      if (mounted) {
        setEditorReady(true)
        setEditorError(null)
      }
    }

    if (isOpen) {
      initEditor().catch((error) => {
        console.error('TextBlock editor init failed:', error)
        if (mounted) {
          setEditorError('编辑器加载失败，已切换为纯文本。')
        }
      })
    }

    return () => {
      mounted = false
      if (editorInstanceRef.current) {
        editorInstanceRef.current.destroy().catch(() => {})
        editorInstanceRef.current = null
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (!editorInstanceRef.current) return
    const next = typeof content === 'string' ? content : ''
    if (next && next !== lastContentRef.current) {
      editorInstanceRef.current.setData(next)
      lastContentRef.current = next
    }
  }, [content])

  return (
    <div className="mb-6 bg-theme-surface p-4 rounded-lg border border-theme-divider space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-theme-textPrimary">内容</label>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-3 py-1.5 rounded-lg bg-tech-accent text-white text-xs hover:bg-tech-secondary transition-colors"
        >
          编辑内容
        </button>
      </div>
      <p className="text-xs text-theme-textSecondary">富文本内容建议在弹窗中编辑。</p>

      <div className={`fixed inset-0 z-50 ${isOpen ? '' : 'hidden'}`}>
        <div
          className="absolute inset-0 bg-color-surface"
          onClick={() => setIsOpen(false)}
        />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="text-block-editor-modal w-full max-w-4xl rounded-xl border border-theme-divider bg-theme-surface shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-theme-divider">
              <h3 className="text-sm font-semibold text-theme-textPrimary">编辑文本区块内容</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-theme-textSecondary hover:text-theme-textPrimary"
              >
                关闭
              </button>
            </div>
            <div className="p-4">
              {editorError ? (
                <textarea
                  value={content || ''}
                  onChange={(e) => onContentChange(e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 border border-theme-divider bg-theme-surfaceAlt theme-input focus:ring-2 focus:ring-tech-accent focus:border-transparent resize-none"
                  placeholder="请输入内容（支持 HTML）"
                />
              ) : (
                <>
                  {!editorReady && (
                    <div className="text-xs text-theme-textSecondary mb-2">正在加载富文本编辑器...</div>
                  )}
                  <div
                    ref={editorHostRef}
                    className="docs-ckeditor min-h-[320px] bg-theme-surfaceAlt rounded-md p-2 min-w-0"
                  />
                </>
              )}
              {editorError && <p className="text-xs text-theme-textSecondary mt-2">{editorError}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TextBlockEditor
