import { useState, useEffect } from 'react'
import {
  File,
  Image,
  Video,
  FileText,
  Download,
  Search,
  Filter,
  Grid,
  List,
  Folder,
  FolderOpen,
  FileAudio,
  FileVideo,
  FileImage,
  FileArchive,
  FileCode,
  MoreHorizontal,
  Loader2
} from 'lucide-react'
import { formatDateTime } from '@/utils'
import toast from 'react-hot-toast'

type FileKind = 'image' | 'video' | 'audio' | 'document' | 'icon' | 'other'

interface FileItem {
  id: string
  name: string
  type: FileKind
  size: number
  url: string
  created_at: string
  mime_type: string
  folder: string
  extension?: string
  rawType?: string
}

interface FolderItem {
  id: string
  name: string
  path: string
  type: 'root' | 'folder'
  children?: FolderItem[]
}

interface SystemDefaultAssetsProps {
  onFolderChange?: (folderId: string, folderPath: string) => void
}

export default function SystemDefaultAssets({ onFolderChange }: SystemDefaultAssetsProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [currentFolder, setCurrentFolder] = useState<string>('root')
  const [currentFolderPath, setCurrentFolderPath] = useState<string>('root')
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalFiles, setTotalFiles] = useState(0)
  const [filesPerPage, setFilesPerPage] = useState(40)
  const pageSizeOptions: Array<40 | 80 | 160> = [40, 80, 160]
  const iconPreviewThemes = {
    dark: { label: '默认', color: 'var(--color-text-primary)' },
    brand: { label: '品牌', color: '#0ea5e9' }
  } as const
  type IconPreviewKey = keyof typeof iconPreviewThemes
  const [iconPreviewTheme, setIconPreviewTheme] = useState<IconPreviewKey>('dark')
  const [svgCache, setSvgCache] = useState<Record<string, string>>({})

  // 构建文件夹树形结构
  const buildFolderTree = (flatFolders: FolderItem[]): FolderItem[] => {
    const rootName = flatFolders.find(folder => folder.id === 'root')?.name || '系统默认素材'
    const root: FolderItem = { id: 'root', name: rootName, path: 'root', type: 'root', children: [] }

    const pathToNode: { [key: string]: FolderItem } = {}

    flatFolders.forEach(folder => {
      if (folder.id === 'root') return

      const node: FolderItem = {
        id: folder.id,
        name: folder.name,
        path: folder.path,
        type: folder.type || 'folder',
        children: []
      }

      pathToNode[folder.path] = node
    })

    flatFolders.forEach(folder => {
      if (folder.id === 'root') return

      const currentPath = folder.path
      const node = pathToNode[currentPath]

      let parentPath = ''
      if (currentPath.includes('/')) {
        const pathParts = currentPath.split('/')
        if (pathParts.length > 1) {
          parentPath = pathParts.slice(0, -1).join('/')
        }
      }

      if (parentPath && pathToNode[parentPath]) {
        pathToNode[parentPath].children?.push(node)
      } else {
        root.children?.push(node)
      }
    })

    if (root.children) {
      root.children.sort((a, b) => a.path.localeCompare(b.path))
    }

    return [root]
  }

  // 获取文件类型
  const getFileTypeFromMimeType = (extension: string): FileKind => {
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'tif', 'ico', 'heic', 'heif']
    const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v']
    const audioExts = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma']
    const docExts = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'ppt', 'pptx']

    const ext = extension.toLowerCase()
    if (ext === 'svg') return 'icon'
    if (imageExts.includes(ext)) return 'image'
    if (videoExts.includes(ext)) return 'video'
    if (audioExts.includes(ext)) return 'audio'
    if (docExts.includes(ext)) return 'document'
    return 'other'
  }

  // 获取MIME类型
  const getMimeTypeFromExtension = (extension: string): string => {
    const mimeTypes: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'bmp': 'image/bmp',
      'tiff': 'image/tiff',
      'tif': 'image/tiff',
      'ico': 'image/x-icon',
      'heic': 'image/heic',
      'heif': 'image/heif',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'mp4': 'video/mp4',
      'avi': 'video/x-msvideo',
      'mov': 'video/quicktime',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav'
    }
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream'
  }

  const sanitizeSvgContent = (svg: string) =>
    svg
      .replace(/<\?xml.*?\?>/gi, '')
      .replace(/<!DOCTYPE.*?>/gi, '')
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')

  const renderIconPreview = (file: FileItem, size: 'md' | 'sm' = 'md') => {
    const theme = iconPreviewThemes[iconPreviewTheme]
    const wrapperSize = size === 'md' ? 'w-20 h-20' : 'w-14 h-14'
    const innerSize = size === 'md' ? 'w-16 h-16' : 'w-10 h-10'
    const svgMarkup = svgCache[file.url]

    const renderContent = () => {
      if (svgMarkup === '') {
        return <Image className="w-6 h-6 text-gray-400" />
      }
      if (svgMarkup) {
        return (
          <div
            className={`${innerSize} flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:object-contain`}
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
          />
        )
      }
      return <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
    }

    return (
      <div className={`${wrapperSize} flex items-center justify-center`} style={{ color: theme.color, lineHeight: 0 }}>
        {renderContent()}
      </div>
    )
  }

  // 获取系统默认素材文件和文件夹
  const fetchSystemDefaultAssets = async (
    folderPath: string = currentFolderPath,
    page: number = currentPage,
    limit: number = filesPerPage
  ) => {
    try {
      setIsLoading(true)

      const effectiveFolder = folderPath && folderPath !== '' ? folderPath : 'root'
      const params = new URLSearchParams({
        folder: effectiveFolder,
        page: page.toString(),
        limit: limit.toString()
      })

      // 并行获取文件和文件夹
      const [filesResponse, foldersResponse] = await Promise.all([
        fetch(`/api/system-default/files?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        }).then(res => res.json()),
        fetch('/api/system-default/folders', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        }).then(res => res.json())
      ])

      if (filesResponse.success && Array.isArray(filesResponse.data)) {
        // 转换后端API数据格式
        const formattedFiles = filesResponse.data.map((file: any) => {
          const extension = (file.extension || file.name?.split('.').pop() || '').toLowerCase()
          const derivedType: FileKind =
            file.type === 'icon'
              ? 'icon'
              : getFileTypeFromMimeType(extension || file.type || '')

          return {
            id: file.path || `${effectiveFolder}-${file.name}`,
            name: file.name,
            type: derivedType,
            rawType: file.type,
            extension,
            size: file.size,
            url: file.url,
            created_at: file.modified ? new Date(file.modified).toISOString() : new Date().toISOString(),
            mime_type: getMimeTypeFromExtension(extension || file.type || ''),
            folder: effectiveFolder
          }
        })
        setFiles(formattedFiles)

        // 更新分页信息
        if (filesResponse.meta) {
          setTotalPages(filesResponse.meta.total_pages || 1)
          setTotalFiles(filesResponse.meta.total || formattedFiles.length)
          setCurrentPage(filesResponse.meta.current_page || page)
        }
      } else {
        setFiles([])
      }

      if (foldersResponse.success && Array.isArray(foldersResponse.data)) {
        const treeFolders = buildFolderTree(foldersResponse.data)
        setFolders(treeFolders)
      }
    } catch (error) {
      console.error('获取系统默认素材失败:', error)
      toast.error('获取系统默认素材失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 处理文件夹切换
  const handleFolderChange = (folderId: string, folderPath: string) => {
    setCurrentFolder(folderId)
    setCurrentFolderPath(folderPath)
    setCurrentPage(1)
    fetchSystemDefaultAssets(folderPath, 1)

    // 调用父组件的回调
    if (onFolderChange) {
      onFolderChange(folderId, folderPath)
    }
  }

  // 文件夹树形组件
  const FolderTree = ({ folders, onFolderSelect }: { folders: FolderItem[], onFolderSelect: (id: string, path: string) => void }) => {
    const renderFolder = (folder: FolderItem) => (
      <div key={folder.id} className="space-y-1">
        <div className="flex items-center">
          <button
            onClick={() => onFolderSelect(folder.id, folder.path)}
            className={`flex-1 text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center ${
              currentFolder === folder.id
                ? 'bg-tech-accent text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>{folder.name}</span>
          </button>
        </div>
        {folder.children && folder.children.length > 0 && (
          <div className="ml-4 space-y-1">
            {folder.children.map(child => renderFolder(child))}
          </div>
        )}
      </div>
    )

    return <div className="space-y-2">{folders.map(renderFolder)}</div>
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 获取文件图标
  const getFileIcon = (type: string, mimeType: string = '') => {
    if (mimeType.includes('audio')) {
      return <FileAudio className="w-6 h-6" />
    }
    if (mimeType.includes('video')) {
      return <FileVideo className="w-6 h-6" />
    }
    if (mimeType.includes('image')) {
      return <FileImage className="w-6 h-6" />
    }
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) {
      return <FileArchive className="w-6 h-6" />
    }
    if (mimeType.includes('code') || mimeType.includes('javascript') || mimeType.includes('json') || mimeType.includes('xml')) {
      return <FileCode className="w-6 h-6" />
    }

    switch (type) {
      case 'image':
        return <FileImage className="w-6 h-6" />
      case 'video':
        return <FileVideo className="w-6 h-6" />
      case 'audio':
        return <FileAudio className="w-6 h-6" />
      case 'document':
        return <FileText className="w-6 h-6" />
      case 'icon':
        return <FileImage className="w-6 h-6" />
      default:
        return <File className="w-6 h-6" />
    }
  }

  // 获取文件类型颜色
  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'image':
        return 'text-green-600'
      case 'video':
        return 'text-blue-600'
      case 'audio':
        return 'text-purple-600'
      case 'document':
        return 'text-red-600'
      case 'icon':
        return 'text-teal-600'
      default:
        return 'text-gray-600'
    }
  }

  // 过滤文件
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !typeFilter || file.type === typeFilter
    return matchesSearch && matchesType
  })

  useEffect(() => {
    const svgFiles = files.filter(file => file.type === 'icon' && !svgCache[file.url])
    if (!svgFiles.length) {
      return
    }

    let cancelled = false
    const controller = new AbortController()

    const loadSvgs = async () => {
      for (const file of svgFiles) {
        try {
          const response = await fetch(file.url, { signal: controller.signal })
          if (!response.ok) {
            throw new Error(`Failed to fetch ${file.url}`)
          }
          const text = await response.text()
          if (!cancelled) {
            setSvgCache(prev => ({
              ...prev,
              [file.url]: sanitizeSvgContent(text)
            }))
          }
        } catch (error) {
          if ((error as Error).name !== 'AbortError' && !cancelled) {
            console.warn('加载 SVG 预览失败:', file.url)
            setSvgCache(prev => ({ ...prev, [file.url]: '' }))
          }
        }
      }
    }

    loadSvgs()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [files, svgCache])

  useEffect(() => {
    fetchSystemDefaultAssets()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tech-accent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
        {/* 主要内容区域 - 双面板布局 */}
        <div className="flex gap-6">
          {/* 左侧文件夹导航 */}
          <div className="w-64 bg-white dark:bg-tech-light rounded-lg border border-gray-200 dark:border-gray-700 p-4 h-fit">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">文件夹</h3>
            <FolderTree
              folders={folders}
              onFolderSelect={handleFolderChange}
            />
          </div>

          {/* 右侧文件列表 */}
          <div className="flex-1">
          {/* 搜索和筛选 */}
          <div className="bg-white dark:bg-tech-light rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="搜索文件名..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-tech-accent focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="sm:w-48">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-tech-accent focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">所有类型</option>
                    <option value="image">图片</option>
                    <option value="icon">图标</option>
                    <option value="video">视频</option>
                    <option value="document">文档</option>
                    <option value="other">其他</option>
                  </select>
                </div>
                <div className="sm:w-32">
                  <select
                    value={filesPerPage}
                    onChange={(e) => {
                      const newLimit = parseInt(e.target.value)
                      setFilesPerPage(newLimit)
                      setCurrentPage(1)
                      fetchSystemDefaultAssets(currentFolderPath, 1, newLimit)
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-tech-accent focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {pageSizeOptions.map(size => (
                      <option key={size} value={size}>{size} 项/页</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-tech-accent text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-tech-accent text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-xs text-gray-500">图标预览主题:</span>
              {Object.entries(iconPreviewThemes).map(([key, theme]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setIconPreviewTheme(key as IconPreviewKey)}
                  className={`px-3 py-1 rounded-full border text-xs transition-colors ${
                    iconPreviewTheme === key
                      ? 'bg-tech-accent text-white border-tech-accent'
                      : 'border-gray-300 text-gray-600 hover:border-tech-accent hover:text-tech-accent'
                  }`}
                >
                  {theme.label}
                </button>
              ))}
              <span className="text-xs text-gray-400">用于预览 SVG 的 currentColor 效果</span>
            </div>
          </div>

          {/* 文件列表 */}
          <div className="bg-white dark:bg-tech-light rounded-lg border border-gray-200 dark:border-gray-700">
            {viewMode === 'grid' ? (
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      className="relative group bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 cursor-default"
                    >
                      <div className="absolute top-2 left-2">
                        <div className="w-5 h-5 rounded-full border-2 border-gray-400 dark:border-gray-500 flex items-center justify-center bg-white dark:bg-gray-800">
                        </div>
                      </div>
                      <div className="flex flex-col items-center space-y-2 mt-2">
                        {file.type === 'image' ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : file.type === 'icon' ? (
                          renderIconPreview(file)
                        ) : file.type === 'audio' ? (
                          <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-gray-200 dark:bg-gray-600">
                            <audio
                              src={file.url}
                              className="w-12 h-8"
                              controls
                            />
                          </div>
                        ) : file.type === 'video' ? (
                          <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-gray-200 dark:bg-gray-600 relative">
                            <video
                              src={file.url}
                              className="w-16 h-16 object-cover rounded-lg"
                              poster={file.url + '?thumbnail=1'}
                              muted
                              autoPlay={false}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8 5v10l7-5-7-5z"/>
                              </svg>
                            </div>
                          </div>
                        ) : (
                          <div className={`w-16 h-16 rounded-lg flex items-center justify-center bg-gray-200 dark:bg-gray-600 ${getFileTypeColor(file.type)}`}>
                            {getFileIcon(file.type, file.mime_type)}
                          </div>
                        )}
                        <div className="text-center">
                          <p className="text-xs font-medium text-gray-900 dark:text-white truncate w-full">
                            {file.name}
                          </p>
                          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                            <p>{formatFileSize(file.size)}</p>
                            <p>{formatDateTime(file.created_at)}</p>
                            <p className="truncate">{file.mime_type}</p>
                          </div>
                        </div>
                      </div>

                      {/* 悬浮操作 - 只读模式 */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => window.open(file.url, '_blank')}
                            className="p-1 bg-white dark:bg-gray-800 rounded shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <Download className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                          </button>
                          <div className="p-1 bg-white dark:bg-gray-800 rounded shadow-sm opacity-50 cursor-not-allowed">
                            <span className="text-xs text-gray-400">只读</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        文件名
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        类型
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        大小
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        创建时间
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {filteredFiles.map((file) => (
                      <tr
                        key={file.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              {file.type === 'icon' ? (
                                renderIconPreview(file, 'sm')
                              ) : (
                                <div className={getFileTypeColor(file.type)}>
                                  {getFileIcon(file.type, file.mime_type)}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {file.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {file.mime_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatFileSize(file.size)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDateTime(file.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => window.open(file.url, '_blank')}
                              className="text-tech-accent hover:text-tech-secondary"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <span className="text-xs text-gray-400">只读</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filteredFiles.length === 0 && (
              <div className="text-center py-12">
                <Folder className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  暂无文件
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  系统默认素材目录为空。
                </p>
              </div>
            )}

            {/* 分页控件 */}
            {totalPages > 1 && filteredFiles.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  显示第 {(currentPage - 1) * filesPerPage + 1} - {Math.min(currentPage * filesPerPage, totalFiles)} 条，共 {totalFiles} 条
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      if (currentPage > 1) {
                        setCurrentPage(currentPage - 1)
                        fetchSystemDefaultAssets(currentFolderPath, currentPage - 1)
                      }
                    }}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-gray-700 dark:text-gray-400 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    上一页
                  </button>

                  <div className="flex items-center space-x-1">
                    {currentPage > 3 && (
                      <>
                        <button
                          onClick={() => {
                            setCurrentPage(1)
                            fetchSystemDefaultAssets(currentFolderPath, 1)
                          }}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-gray-700 dark:text-gray-400 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                          1
                        </button>
                        {currentPage > 4 && (
                          <span className="px-2 py-2 text-sm text-gray-500">...</span>
                        )}
                      </>
                    )}

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i
                      if (pageNum >= 1 && pageNum <= totalPages) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => {
                              setCurrentPage(pageNum)
                              fetchSystemDefaultAssets(currentFolderPath, pageNum)
                            }}
                            className={`px-3 py-2 text-sm font-medium rounded-lg border ${
                              currentPage === pageNum
                                ? 'bg-tech-accent text-white border-tech-accent'
                                : 'text-gray-500 bg-white dark:bg-gray-700 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      }
                      return null
                    }).filter(Boolean)}

                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && (
                          <span className="px-2 py-2 text-sm text-gray-500">...</span>
                        )}
                        <button
                          onClick={() => {
                            setCurrentPage(totalPages)
                            fetchSystemDefaultAssets(currentFolderPath, totalPages)
                          }}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-gray-700 dark:text-gray-400 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (currentPage < totalPages) {
                        setCurrentPage(currentPage + 1)
                        fetchSystemDefaultAssets(currentFolderPath, currentPage + 1)
                      }
                    }}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-gray-700 dark:text-gray-400 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
