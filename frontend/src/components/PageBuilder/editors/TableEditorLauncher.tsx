import React from 'react'
import { Plus, Trash2, Save, X } from 'lucide-react'

interface TableColumn {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
}

interface TableEditorLauncherProps {
  columns: TableColumn[]
  rows: Record<string, any>[]
  highlightHeader?: boolean
  highlightFirstRow?: boolean
  highlightFirstColumn?: boolean
  onColumnsChange: (cols: TableColumn[]) => void
  onRowsChange: (rows: Record<string, any>[]) => void
  onStyleChange: (key: string, value: boolean) => void
}

const alignOptions: Array<{ label: string; value: TableColumn['align'] }> = [
  { label: '左对齐', value: 'left' },
  { label: '居中', value: 'center' },
  { label: '右对齐', value: 'right' }
]

const createEmptyRow = (cols: TableColumn[]) =>
  cols.reduce<Record<string, any>>((acc, col) => {
    acc[col.key] = ''
    return acc
  }, {})

const createColumnKey = (index: number, existing: Set<string>) => {
  let nextIndex = index + 1
  let key = `col_${nextIndex}`
  while (existing.has(key)) {
    nextIndex += 1
    key = `col_${nextIndex}`
  }
  return key
}

const buildColumnsFromRows = (rowData: Record<string, any>[]): TableColumn[] => {
  const keys = Array.from(new Set(rowData.flatMap(row => Object.keys(row || {}))))
  return keys.map(key => ({ key, label: key, align: 'left' as TableColumn['align'] }))
}

const TableEditorLauncher: React.FC<TableEditorLauncherProps> = ({
  columns,
  rows,
  highlightHeader,
  highlightFirstRow,
  highlightFirstColumn,
  onColumnsChange,
  onRowsChange,
  onStyleChange
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [draftCols, setDraftCols] = React.useState<TableColumn[]>(columns || [])
  const [draftRows, setDraftRows] = React.useState<Record<string, any>[]>(rows || [])
  const [activeColumnIndex, setActiveColumnIndex] = React.useState(0)
  const shouldHighlightHeader = highlightHeader !== false || Boolean(highlightFirstRow)

  React.useEffect(() => {
    if (!isOpen) return
    const safeRows = Array.isArray(rows) ? rows : []
    const safeCols: TableColumn[] = Array.isArray(columns) ? columns : []
    const nextCols: TableColumn[] = safeCols.length > 0 ? safeCols : buildColumnsFromRows(safeRows)
    setDraftCols(nextCols)
    setDraftRows(safeRows)
    setActiveColumnIndex((prev) => Math.min(prev, Math.max(nextCols.length - 1, 0)))
    if (safeCols.length === 0 && nextCols.length > 0) {
      onColumnsChange(nextCols)
    }
  }, [isOpen])

  React.useEffect(() => {
    if (isOpen) return
    setDraftCols(Array.isArray(columns) ? columns : [])
    setDraftRows(Array.isArray(rows) ? rows : [])
  }, [columns, rows, isOpen])

  const handleSave = () => {
    onColumnsChange(draftCols)
    onRowsChange(draftRows)
    setIsOpen(false)
  }

  const handleAddColumn = () => {
    const nextIndex = draftCols.length
    const existingKeys = new Set(draftCols.map(col => col.key))
    const key = createColumnKey(nextIndex, existingKeys)
    const nextCol: TableColumn = { key, label: `列${nextIndex + 1}`, align: 'left' }
    const nextCols = [...draftCols, nextCol]
    const nextRows = draftRows.map(row => ({ ...row, [key]: '' }))
    setDraftCols(nextCols)
    setDraftRows(nextRows)
    setActiveColumnIndex(nextCols.length - 1)
    onColumnsChange(nextCols)
    onRowsChange(nextRows)
  }

  const handleRemoveColumn = (index: number) => {
    const col = draftCols[index]
    if (!col) return
    const nextCols = draftCols.filter((_, idx) => idx !== index)
    const nextRows = draftRows.map(row => {
      const next = { ...row }
      delete next[col.key]
      return next
    })
    setDraftCols(nextCols)
    setDraftRows(nextRows)
    setActiveColumnIndex(Math.min(activeColumnIndex, Math.max(nextCols.length - 1, 0)))
    onColumnsChange(nextCols)
    onRowsChange(nextRows)
  }

  const handleUpdateColumn = (index: number, patch: Partial<TableColumn>) => {
    const next = [...draftCols]
    next[index] = { ...next[index], ...patch }
    setDraftCols(next)
    onColumnsChange(next)
  }

  const handleAddRow = () => {
    const next = [...draftRows, createEmptyRow(draftCols)]
    setDraftRows(next)
    onRowsChange(next)
  }

  const handleRemoveRow = (rowIndex: number) => {
    const next = draftRows.filter((_, idx) => idx !== rowIndex)
    setDraftRows(next)
    onRowsChange(next)
  }

  const handleCellChange = (rowIndex: number, colKey: string, value: string) => {
    const next = [...draftRows]
    next[rowIndex] = { ...(next[rowIndex] || {}), [colKey]: value }
    setDraftRows(next)
    onRowsChange(next)
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-semantic-panelBorder bg-semantic-panel p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-theme-text">表格数据</h4>
            <p className="text-xs text-theme-textSecondary">
              {draftRows.length} 行 · {draftCols.length} 列
            </p>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-tech-accent text-white hover:bg-tech-secondary transition-colors"
          >
            打开表格编辑器
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(var(--color-background-rgb, 15, 23, 42), 0.78)' }}
        >
          <div className="flex items-center justify-between px-5 py-3 border-b border-semantic-panelBorder bg-semantic-panel/95">
            <div>
              <h2 className="text-lg font-semibold text-theme-text">表格编辑器</h2>
              <p className="text-xs text-theme-textSecondary">所见即所得，直接编辑表格内容</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 text-sm rounded-lg border border-semantic-panelBorder bg-theme-surface text-theme-textSecondary hover:text-theme-text hover:bg-theme-surfaceAlt transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-tech-accent text-white hover:bg-tech-secondary"
              >
                <Save className="w-4 h-4" />
                保存表格
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-theme-textSecondary hover:text-theme-text"
                aria-label="关闭"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden bg-semantic-mutedBg">
            <div className="h-full flex flex-col">
              <div className="flex flex-wrap items-center gap-3 px-5 py-2 border-b border-semantic-panelBorder bg-semantic-panel/90">
                <button
                  onClick={handleAddColumn}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-tech-accent text-white hover:bg-tech-secondary"
                >
                  <Plus className="w-3 h-3" />
                  新增列
                </button>
                <button
                  onClick={handleAddRow}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-tech-accent text-white hover:bg-tech-secondary"
                >
                  <Plus className="w-3 h-3" />
                  新增行
                </button>
                <div className="flex items-center gap-2 text-xs text-theme-textSecondary">
                  <span>当前列</span>
                  <select
                    value={Math.min(activeColumnIndex, Math.max(draftCols.length - 1, 0))}
                    onChange={(e) => setActiveColumnIndex(parseInt(e.target.value, 10))}
                    className="px-2 py-1 text-xs rounded theme-input"
                  >
                    {draftCols.map((col, idx) => (
                      <option key={col.key} value={idx}>
                        {col.label || col.key || `列${idx + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-theme-textSecondary">
                  <label className="inline-flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={shouldHighlightHeader}
                      onChange={(e) => onStyleChange('highlightHeader', e.target.checked)}
                      className="rounded border-theme-divider text-tech-accent focus:ring-tech-accent"
                    />
                    表头强调
                  </label>
                  <label className="inline-flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={Boolean(highlightFirstColumn)}
                      onChange={(e) => onStyleChange('highlightFirstColumn', e.target.checked)}
                      className="rounded border-theme-divider text-tech-accent focus:ring-tech-accent"
                    />
                    首列强调
                  </label>
                </div>
                <span className="text-xs text-theme-textSecondary">
                  行{draftRows.length} · 列{draftCols.length}
                </span>
              </div>

              <div className="flex-1 overflow-auto">
                <table className="min-w-full border-separate border-spacing-0">
                  <thead className="sticky top-0 z-10 bg-semantic-panel/95 backdrop-blur">
                    <tr>
                      <th className="sticky left-0 z-20 border-b border-r border-theme-divider px-2 py-2 text-xs text-theme-textSecondary bg-semantic-panel/95">
                        #
                      </th>
                      {draftCols.map((col, colIndex) => {
                        const isActive = colIndex === activeColumnIndex
                        return (
                          <th
                            key={col.key}
                            className={`relative border-b border-r border-theme-divider px-2 py-2 align-top min-w-[150px] ${
                              isActive ? 'bg-[rgba(var(--color-accent-rgb),0.12)]' : 'bg-semantic-panel/95'
                            }`}
                            onClick={() => setActiveColumnIndex(colIndex)}
                          >
                            <div className="space-y-1 relative z-20">
                              <div className="flex items-center justify-between gap-2">
                                <select
                                  value={col.align || 'left'}
                                  onChange={(e) =>
                                    handleUpdateColumn(colIndex, { align: e.target.value as TableColumn['align'] })
                                  }
                                  onClick={(event) => event.stopPropagation()}
                                  onMouseDown={(event) => event.stopPropagation()}
                                  className="px-2 py-1 text-xs rounded theme-input"
                                >
                                  {alignOptions.map(option => (
                                    <option key={option.value} value={option.value || 'left'}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => handleRemoveColumn(colIndex)}
                                  onMouseDown={(event) => event.stopPropagation()}
                                  className="p-1 text-red-500 hover:text-red-600"
                                  aria-label="删除列"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={col.label}
                                onChange={(e) => handleUpdateColumn(colIndex, { label: e.target.value })}
                                onClick={(event) => event.stopPropagation()}
                                onMouseDown={(event) => event.stopPropagation()}
                                className="w-full px-2 py-1 text-sm rounded theme-input"
                                placeholder="列名"
                              />
                              <div className="text-[10px] text-theme-textSecondary">key: {col.key}</div>
                            </div>
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {draftRows.map((row, rowIndex) => {
                      const rowBgClass =
                        rowIndex % 2 === 0 ? 'bg-theme-surface/95' : 'bg-theme-surfaceAlt/80'
                      return (
                        <tr key={rowIndex} className={rowBgClass}>
                          <td
                            className={`sticky left-0 z-10 border-b border-r border-theme-divider px-2 py-2 text-xs text-theme-textSecondary ${rowBgClass}`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{rowIndex + 1}</span>
                              <button
                                onClick={() => handleRemoveRow(rowIndex)}
                                className="p-1 text-red-500 hover:text-red-600"
                                aria-label="删除行"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          {draftCols.map(col => (
                            <td
                              key={`${rowIndex}-${col.key}`}
                              className="border-b border-r border-theme-divider px-2 py-1"
                            >
                              <input
                                type="text"
                                value={row?.[col.key] ?? ''}
                                onChange={(e) => handleCellChange(rowIndex, col.key, e.target.value)}
                                className="w-full px-2 py-1 text-sm rounded theme-input"
                              />
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                    {draftRows.length === 0 && (
                      <tr>
                        <td
                          colSpan={draftCols.length + 1}
                          className="px-4 py-6 text-center text-sm text-theme-textSecondary"
                        >
                          暂无数据，点击“新增行”开始编辑
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TableEditorLauncher
