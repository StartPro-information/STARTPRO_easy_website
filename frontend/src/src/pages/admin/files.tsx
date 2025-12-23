import { useState, useEffect, Fragment } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { motion } from 'framer-motion'
import {
  Upload,
  File,
  Image,
  Video,
  FileText,
  Download,
  Trash2,
  Search,
  Filter,
  Grid,
  List,
  Plus,
  Folder,
  FolderOpen,
  Play,
  FileAudio,
  FileVideo,
  FileImage,
  FileArchive,
  FileCode,
  MoreHorizontal,
  Users,
  Box
} from 'lucide-react'
import { uploadApi } from '@/utils/api'
import { formatDateTime } from '@/utils'
import toast from 'react-hot-toast'
import SystemDefaultAssets from '@/components/admin/SystemDefaultAssets'

interface FileItem {
  id: string
  name: string
  type: 'image' | 'video' | 'audio' | 'document' | 'other'
  size: number
  url: string
  created_at: string
  mime_type: string
  folder: string
}

interface FolderItem {
  id: string
  name: string
  path: string
  type: 'root' | 'category' | 'folder'
  children?: FolderItem[]
}

type ImageCompressLevel = 'light' | 'medium' | 'heavy'

export default function FilesPage() {
  const [activeTab, setActiveTab] = useState<'user' | 'system'>('user')
  const [files, setFiles] = useState<FileItem[]>([])
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [currentFolder, setCurrentFolder] = useState<string>('root')
  const [currentFolderPath, setCurrentFolderPath] = useState<string>('root')
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null)
  const [newFileName, setNewFileName] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [copyingFileId, setCopyingFileId] = useState<string | null>(null)
  const [newCopyFileName, setNewCopyFileName] = useState('')
  const [movingFileId, setMovingFileId] = useState<string | null>(null)
  const [newMoveFileName, setNewMoveFileName] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalFiles, setTotalFiles] = useState(0)
  const [filesPerPage, setFilesPerPage] = useState(20)
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [parentFolderForNew, setParentFolderForNew] = useState<string>('root')

  const [imageCompressEnabled, setImageCompressEnabled] = useState(false)
  const [imageCompressLevel, setImageCompressLevel] = useState<ImageCompressLevel>('medium')
  const [imageCompressSaving, setImageCompressSaving] = useState(false)

  useEffect(() => {
    fetchFilesAndFolders()
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const res: any = await uploadApi.getPreferences()
        if (res?.success && res?.data) {
          setImageCompressEnabled(Boolean(res.data.image_compress_enabled))
          setImageCompressLevel((res.data.image_compress_level || 'medium') as ImageCompressLevel)
        }
      } catch (e) {
        // preferences are optional; ignore failures
      }
    })()
  }, [])

  const buildFolderTree = (flatFolders: FolderItem[]): FolderItem[] => {
    // 创建根节点
    const root: FolderItem = { id: 'root', name: '根目录', path: 'root', type: 'root', children: [] }

    // 创建路径到节点的映射，用于快速查找
    const pathToNode: { [key: string]: FolderItem } = {}

    // 首先处理所有文件夹，创建节点映射
    flatFolders.forEach(folder => {
      if (folder.id === 'root') return

      // 为每个文件夹创建节点
      const node: FolderItem = {
        id: folder.id,
        name: folder.name,
        path: folder.path,
        type: folder.type || 'folder',
        children: []
      }

      pathToNode[folder.path] = node
    })

    // 构建树形结构
    flatFolders.forEach(folder => {
      if (folder.id === 'root') return

      const currentPath = folder.path
      const node = pathToNode[currentPath]

      // 确定父路径
      let parentPath = ''
      if (currentPath.includes('/')) {
        // 对于包含斜杠的路径，找到父路径
        const pathParts = currentPath.split('/')
        if (pathParts.length > 1) {
          parentPath = pathParts.slice(0, -1).join('/')
        }
      }

      // 找到父节点并添加子节点
      if (parentPath && pathToNode[parentPath]) {
        // 父节点存在，添加到父节点的children
        pathToNode[parentPath].children?.push(node)
      } else {
        // 没有父节点或者父节点不存在，添加到根节点
        root.children?.push(node)
      }
    })


    // 对根节点的子节点进行排序
    if (root.children) {
      root.children.sort((a, b) => {
        // 按路径排序
        return a.path.localeCompare(b.path)
      })
    }

    return [root]
  }

  const fetchFilesAndFolders = async (folderPath: string = 'root', page: number = currentPage, limit: number = filesPerPage) => {
    try {
      setIsLoading(true)

      // 并行获取文件和文件夹
      const [filesResponse, foldersResponse] = await Promise.all([
        uploadApi.getFiles({ folder: folderPath, page, limit }),
        uploadApi.getFolders()
      ])

      if (filesResponse.success) {
        // 转换后端API数据格式
        const formattedFiles = filesResponse.data.map((file: any) => ({
          id: file.name,
          name: file.name,
          type: getFileTypeFromMimeType(file.type),
          size: file.size,
          url: file.url,
          created_at: file.modified,
          mime_type: getMimeTypeFromExtension(file.type),
          folder: folderPath
        }))
        setFiles(formattedFiles)

        // 更新分页信息 - 使用类型断言
        const responseWithMeta = filesResponse as any
        if (responseWithMeta.meta) {
          setTotalPages(responseWithMeta.meta.total_pages || 1)
          setTotalFiles(responseWithMeta.meta.total || formattedFiles.length)
          setCurrentPage(responseWithMeta.meta.current_page || page)
        }
      }

      if (foldersResponse.success) {
        const treeFolders = buildFolderTree(foldersResponse.data)
        setFolders(treeFolders)
      }
    } catch (error) {
      console.error('获取文件和文件夹列表失败:', error)
      // 如果失败，使用示例数据
      setFiles([
        {
          id: '1',
          name: 'logo.png',
          type: 'image',
          size: 245760,
          url: '/uploads/logo.png',
          created_at: '2024-01-15T10:30:00Z',
          mime_type: 'image/png',
          folder: folderPath
        },
        {
          id: '2',
          name: 'banner.jpg',
          type: 'image',
          size: 1024000,
          url: '/uploads/banner.jpg',
          created_at: '2024-01-14T15:20:00Z',
          mime_type: 'image/jpeg',
          folder: folderPath
        },
        {
          id: '3',
          name: 'company-intro.pdf',
          type: 'document',
          size: 2048000,
          url: '/uploads/company-intro.pdf',
          created_at: '2024-01-13T09:15:00Z',
          mime_type: 'application/pdf',
          folder: folderPath
        }
      ])

      const sampleFolders: FolderItem[] = [
        { id: 'root', name: '根目录', path: 'root', type: 'root' },
        { id: 'images', name: '图片', path: 'images', type: 'category' },
        { id: 'images_banners', name: '横幅图片', path: 'images/banners', type: 'folder' },
        { id: 'images_icons', name: '图标', path: 'images/icons', type: 'folder' },
        { id: 'images_products', name: '产品图片', path: 'images/products', type: 'folder' },
        { id: 'media', name: '媒体文件', path: 'media', type: 'category' },
        { id: 'media_videos', name: '视频', path: 'media/videos', type: 'folder' },
        { id: 'media_audio', name: '音频', path: 'media/audio', type: 'folder' },
        { id: 'files', name: '其他文件', path: 'files', type: 'folder' }
      ]

      const treeFolders = buildFolderTree(sampleFolders)
      setFolders(treeFolders)

      // 重置分页信息
      setTotalPages(1)
      setTotalFiles(3)
      setCurrentPage(1)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFolderChange = (folderId: string, folderPath: string) => {
    setCurrentFolder(folderId)
    setCurrentFolderPath(folderPath)
    setCurrentPage(1)
    clearSelection() // Clear selected files when changing folders
    fetchFilesAndFolders(folderPath, 1)
  }

  // 文件夹树形组件
  const FolderTree = ({ folders, onFolderSelect }: { folders: FolderItem[], onFolderSelect: (id: string, path: string) => void }) => {
    const [showFolderActions, setShowFolderActions] = useState<string | null>(null)

    const handleCreateSubFolder = (folderPath: string) => {
      startCreateFolder(folderPath)
      setShowFolderActions(null)
    }

    const handleDeleteFolder = async (folderPath: string) => {
      if (!confirm('确定要删除这个文件夹吗？文件夹必须为空才能删除。')) return
      try {
        await uploadApi.deleteFolder(folderPath)
        toast.success('文件夹删除成功')
        setShowFolderActions(null)
        // 刷新文件夹列表
        fetchFilesAndFolders(currentFolderPath)
      } catch (error) {
        console.error('删除文件夹失败:', error)
        toast.error('删除文件夹失败')
      }
    }

    const renderFolder = (folder: FolderItem) => (
      <div key={folder.id} className="space-y-1 relative">
        <div className="flex items-center justify-between">
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
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowFolderActions(showFolderActions === folder.id ? null : folder.id)
            }}
            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
        {showFolderActions === folder.id && (
          <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
            <button
              onClick={() => handleCreateSubFolder(folder.path)}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              创建子目录
            </button>
            {folder.path !== 'root' && (
              <button
                onClick={() => handleDeleteFolder(folder.path)}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                删除目录
              </button>
            )}
          </div>
        )}
        {folder.children && folder.children.length > 0 && (
          <div className="ml-4 space-y-1">
            {folder.children.map(child => renderFolder(child))}
          </div>
        )}
      </div>
    )

    return <div className="space-y-2">{folders.map(renderFolder)}</div>
  }
  
  const getFileTypeFromMimeType = (extension: string): 'image' | 'video' | 'audio' | 'document' | 'other' => {
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'tif', 'ico', 'heic', 'heif']
    const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v']
    const audioExts = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma']
    const docExts = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'ppt', 'pptx']

    const ext = extension.toLowerCase()
    if (imageExts.includes(ext)) return 'image'
    if (videoExts.includes(ext)) return 'video'
    if (audioExts.includes(ext)) return 'audio'
    if (docExts.includes(ext)) return 'document'
    return 'other'
  }
  
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

  const uploadFilesToCurrentFolder = async (filesToUpload: File[]) => {
    if (!filesToUpload.length) return
    const folderPath = currentFolderPath !== 'root' ? currentFolderPath : 'root'

    try {
      setUploading(true)
      for (let i = 0; i < filesToUpload.length; i += 1) {
        const file = filesToUpload[i]
        setUploadProgress(0)

        const uploader = file.type.startsWith('image/') ? uploadApi.image : uploadApi.file
        const res: any = await uploader(
          file,
          (progress) => setUploadProgress(progress),
          folderPath !== 'root' ? folderPath : undefined
        )

        if (file.type.startsWith('image/') && res?.success && res?.data?.compression) {
          const c = res.data.compression
          if (c.applied) {
            const fromKb = c.originalSize ? Math.round(c.originalSize / 1024) : null
            const toKb = c.finalSize ? Math.round(c.finalSize / 1024) : null
            toast.success(`已压缩：${file.name}${fromKb && toKb ? `（${fromKb}KB → ${toKb}KB）` : ''}`)
          } else if (c.reason === 'disabled') {
            // no-op
          } else if (c.reason === 'larger_after_compress') {
            toast(`压缩后变大，已保留原图：${file.name}`)
          } else if (c.reason === 'too_large') {
            toast(`像素过大，已跳过压缩：${file.name}`)
          } else if (c.reason === 'sharp_not_available') {
            toast.error(`压缩未生效（服务端缺少 sharp）：${file.name}`)
          }
        }
      }

      toast.success(`成功上传 ${filesToUpload.length} 个文件`)
      fetchFilesAndFolders(folderPath, 1)
    } catch (error) {
      console.error('文件上传失败:', error)
      toast.error('文件上传失败，请稍后重试')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    if (!fileList || fileList.length === 0) return

    await uploadFilesToCurrentFolder(Array.from(fileList))
    event.target.value = ''
  }


  const handleDropUpload = async (files: File[]) => {
    if (!files.length) return
    await uploadFilesToCurrentFolder(files)
  }


  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('确定要删除这个文件吗？此操作不可恢复。')) return

    try {
      // 获取当前文件夹路径（直接使用 currentFolderPath 状态）
      const folderPath = currentFolderPath !== 'root' ? currentFolderPath : 'root'

      // 获取要删除的文件信息
      const fileToDelete = files.find(file => file.id === fileId)
      if (!fileToDelete) {
        toast.error('文件未找到')
        return
      }

      // 调用删除API，传递文件夹信息
      await uploadApi.deleteFile(fileId, folderPath)

      setFiles(prev => prev.filter(file => file.id !== fileId))
      toast.success('文件删除成功')
    } catch (error) {
      console.error('文件删除失败:', error)
      toast.error('文件删除失败')
    }
  }

  const startRenameFile = (file: FileItem) => {
    setRenamingFileId(file.id)
    setNewFileName(file.name)
  }

  const cancelRename = () => {
    setRenamingFileId(null)
    setNewFileName('')
  }

  const startCopyFile = (file: FileItem) => {
    setCopyingFileId(file.id)
    // 在文件名前添加"副本_"前缀
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'))
    const ext = file.name.substring(file.name.lastIndexOf('.'))
    setNewCopyFileName(nameWithoutExt ? `${nameWithoutExt}_副本${ext}` : `${file.name}_副本`)
  }

  const cancelCopy = () => {
    setCopyingFileId(null)
    setNewCopyFileName('')
  }

  const startMoveFile = (file: FileItem) => {
    setMovingFileId(file.id)
    setNewMoveFileName(file.name)
  }

  const cancelMove = () => {
    setMovingFileId(null)
    setNewMoveFileName('')
  }

  const startCreateFolder = (parentPath: string = 'root') => {
    setCreatingFolder(true)
    setNewFolderName('')
    setParentFolderForNew(parentPath)
  }

  const cancelCreateFolder = () => {
    setCreatingFolder(false)
    setNewFolderName('')
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('文件夹名称不能为空')
      return
    }

    try {
      await uploadApi.createFolder(newFolderName, parentFolderForNew)
      toast.success('文件夹创建成功')
      cancelCreateFolder()
      // 刷新文件夹列表
      fetchFilesAndFolders(currentFolderPath)
    } catch (error) {
      console.error('创建文件夹失败:', error)
      toast.error('创建文件夹失败')
    }
  }

  const handleCopyFile = async (file: FileItem) => {
    if (!newCopyFileName.trim()) {
      toast.error('文件名不能为空')
      return
    }

    if (newCopyFileName === file.name) {
      toast.error('复制文件名不能与原文件名相同')
      return
    }

    try {
      // 获取当前文件夹路径（直接使用 currentFolderPath 状态）
      const folderPath = currentFolderPath !== 'root' ? currentFolderPath : 'root'

      // 调用复制API
      const response = await uploadApi.copyFile(file.name, newCopyFileName, folderPath, folderPath)

      if (response.success) {
        // 刷新文件列表
        fetchFilesAndFolders(folderPath || 'root')
        toast.success('文件复制成功')
        cancelCopy()
      }
    } catch (error) {
      console.error('文件复制失败:', error)
      toast.error('文件复制失败')
    }
  }

  const handleMoveFile = async (file: FileItem) => {
    if (!newMoveFileName.trim()) {
      toast.error('文件名不能为空')
      return
    }

    if (newMoveFileName === file.name) {
      cancelMove()
      return
    }

    try {
      // 获取当前文件夹路径（直接使用 currentFolderPath 状态）
      const folderPath = currentFolderPath !== 'root' ? currentFolderPath : 'root'

      // 调用移动API
      const response = await uploadApi.moveFile(file.name, newMoveFileName, folderPath, folderPath)

      if (response.success) {
        // 刷新文件列表
        fetchFilesAndFolders(folderPath || 'root')
        toast.success('文件移动成功')
        cancelMove()
      }
    } catch (error) {
      console.error('文件移动失败:', error)
      toast.error('文件移动失败')
    }
  }

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    )
  }

  const selectAllFiles = () => {
    if (selectedFiles.length === filteredFiles.length && filteredFiles.length > 0) {
      setSelectedFiles([])
    } else {
      setSelectedFiles(filteredFiles.map(file => file.id))
    }
  }

  const clearSelection = () => {
    setSelectedFiles([])
  }

  const handleBatchDelete = async () => {
    if (selectedFiles.length === 0) {
      toast.error('请先选择要删除的文件')
      return
    }

    if (!confirm(`确定要删除选中的 ${selectedFiles.length} 个文件吗？此操作不可恢复。`)) {
      return
    }

    try {
      const selectedFileObjects = files.filter(file => selectedFiles.includes(file.id))

      // 获取当前文件夹路径（直接使用 currentFolderPath 状态）
      const folderPath = currentFolderPath !== 'root' ? currentFolderPath : 'root'

      // 批量删除所有选中的文件（使用当前文件夹上下文）
      const filenames = selectedFileObjects.map(f => f.name)
      await uploadApi.batchDeleteFiles(filenames, undefined, folderPath)

      // 更新文件列表
      setFiles(prev => prev.filter(file => !selectedFiles.includes(file.id)))
      clearSelection()
      toast.success(`成功删除 ${selectedFiles.length} 个文件`)
    } catch (error) {
      console.error('批量删除文件失败:', error)
      toast.error('批量删除文件失败')
    }
  }

  const handleRenameFile = async (file: FileItem) => {
    if (!newFileName.trim()) {
      toast.error('文件名不能为空')
      return
    }

    if (newFileName === file.name) {
      cancelRename()
      return
    }

    try {
      // 获取当前文件夹路径（直接使用 currentFolderPath 状态）
      const folderPath = currentFolderPath !== 'root' ? currentFolderPath : 'root'

      // 调用重命名API，传递文件夹信息
      const response = await uploadApi.renameFile(file.name, newFileName, undefined, folderPath)

      if (response.success) {
        // 更新文件列表中的文件名
        setFiles(prev =>
          prev.map(f =>
            f.id === file.id
              ? { ...f, name: newFileName, id: newFileName, url: response.data.url }
              : f
          )
        )
        toast.success('文件重命名成功')
        cancelRename()
      }
    } catch (error) {
      console.error('文件重命名失败:', error)
      toast.error('文件重命名失败')
    }
  }

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !typeFilter || file.type === typeFilter
    return matchesSearch && matchesType
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string, mimeType: string = '') => {
    // 根据具体的MIME类型返回更精确的图标
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
      default:
        return <File className="w-6 h-6" />
    }
  }

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
      default:
        return 'text-gray-600'
    }
  }


  if (isLoading) {
    return (
      <AdminLayout title="文件管理">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tech-accent"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="素材管理" description="管理网站素材和媒体资源">
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">素材管理</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              管理网站素材和媒体资源
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <>
              <button
                onClick={() => startCreateFolder(currentFolderPath)}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Folder className="w-4 h-4 mr-2" />
                创建目录
              </button>
              <label className="inline-flex items-center px-4 py-2 bg-tech-accent text-white rounded-lg hover:bg-tech-secondary transition-colors cursor-pointer">
                <Plus className="w-4 h-4 mr-2" />
                上传文件
                <input
                  type="file" multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                />
              </label>
            </>
          </div>
        </div>

        {/* 标签页切换 */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('user')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'user'
                ? 'text-tech-accent border-b-2 border-tech-accent'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            用户素材
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'system'
                ? 'text-tech-accent border-b-2 border-tech-accent'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Box className="w-4 h-4 inline mr-2" />
            系统默认素材
          </button>
        </div>

        {/* 创建目录输入框 */}
        {creatingFolder && (
          <div className="bg-white dark:bg-tech-light rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateFolder()
                  } else if (e.key === 'Escape') {
                    cancelCreateFolder()
                  }
                }}
                placeholder="输入文件夹名称"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-tech-accent focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                autoFocus
              />
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-tech-accent text-white rounded-lg hover:bg-tech-secondary transition-colors"
              >
                创建
              </button>
              <button
                onClick={cancelCreateFolder}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {activeTab === 'user' && (
          <Fragment>
            <div className="bg-white dark:bg-tech-light rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">图片自动压缩</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    开启后，所有上传到 <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700">/uploads</code> 的 JPG/PNG 会自动压缩并去掉元数据；压缩后变大则不会替换；超大像素图会跳过压缩。
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-tech-accent focus:ring-tech-accent"
                      checked={imageCompressEnabled}
                      onChange={(e) => setImageCompressEnabled(e.target.checked)}
                    />
                    启用
                  </label>
                  <select
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    value={imageCompressLevel}
                    onChange={(e) => setImageCompressLevel(e.target.value as ImageCompressLevel)}
                    disabled={!imageCompressEnabled}
                  >
                    <option value="light">轻量压缩</option>
                    <option value="medium">中等压缩</option>
                    <option value="heavy">重度压缩</option>
                  </select>
                  <button
                    type="button"
                    disabled={imageCompressSaving}
                    onClick={async () => {
                      try {
                        setImageCompressSaving(true)
                        const res: any = await uploadApi.updatePreferences({
                          image_compress_enabled: imageCompressEnabled,
                          image_compress_level: imageCompressLevel
                        })
                        if (res?.success) toast.success('保存成功')
                      } catch (e) {
                        toast.error('保存失败')
                      } finally {
                        setImageCompressSaving(false)
                      }
                    }}
                    className="px-4 py-2 bg-tech-accent text-white rounded-lg hover:bg-tech-secondary transition-colors disabled:opacity-60 text-sm"
                  >
                    保存
                  </button>
                </div>
              </div>
            </div>
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
              <div
                className={`flex-1 relative ${isDragging ? 'border-2 border-dashed border-tech-accent rounded-lg' : ''}`}
                onDragEnter={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsDragging(true)
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onDragLeave={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  // 只有当鼠标真正离开整个区域时才移除拖拽状态
                  if (e.currentTarget === e.target) {
                    setIsDragging(false)
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsDragging(false)
                  const files = Array.from(e.dataTransfer.files)
                  if (files.length > 0) {
                    handleDropUpload(files)
                  }
                }}
              >
                {isDragging && (
                  <div className="absolute inset-0 bg-tech-accent/10 flex items-center justify-center z-10 rounded-lg">
                    <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                      <Upload className="w-12 h-12 mx-auto text-tech-accent mb-4" />
                      <p className="text-lg font-medium text-gray-900 dark:text-white">释放文件以上传</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">支持图片、视频、文档等文件</p>
                    </div>
                  </div>
                )}
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
                            fetchFilesAndFolders(currentFolderPath, 1, newLimit)
                          }}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-tech-accent focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="20">20 条/页</option>
                          <option value="50">50 条/页</option>
                          <option value="100">100 条/页</option>
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
                </div>

                {/* 上传进度 */}
                {uploading && (
                  <div className="bg-white dark:bg-tech-light rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        上传中...
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {uploadProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-tech-accent h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* 批量操作工具栏 */}
                {selectedFiles.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          已选择 {selectedFiles.length} 个文件
                        </span>
                        <button
                          onClick={clearSelection}
                          className="text-sm text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                        >
                          取消选择
                        </button>
                      </div>
                      <div className="mt-2 sm:mt-0">
                        <button
                          onClick={handleBatchDelete}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>批量删除</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 文件列表 */}
                <div className="bg-white dark:bg-tech-light rounded-lg border border-gray-200 dark:border-gray-700">
                  {viewMode === 'grid' ? (
                    <div className="p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        {filteredFiles.map((file) => (
                          <motion.div
                            key={file.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative group bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                            onClick={() => toggleFileSelection(file.id)}
                          >
                            <div className="absolute top-2 left-2">
                              <div className="w-5 h-5 rounded-full border-2 border-gray-400 dark:border-gray-500 flex items-center justify-center bg-white dark:bg-gray-800">
                                {selectedFiles.includes(file.id) && (
                                  <div className="w-3 h-3 rounded-full bg-tech-accent"></div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-center space-y-2 mt-2">
                              {file.type === 'image' ? (
                                <img
                                  src={file.url}
                                  alt={file.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
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
                                    // 静音预览，避免自动播放声音
                                    muted
                                    // 不自动播放
                                    autoPlay={false}
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Play className="w-6 h-6 text-white" />
                                  </div>
                                </div>
                              ) : (
                                <div className={`w-16 h-16 rounded-lg flex items-center justify-center bg-gray-200 dark:bg-gray-600 ${getFileTypeColor(file.type)}`}>
                                  {getFileIcon(file.type, file.mime_type)}
                                </div>
                              )}
                              <div className="text-center">
                                {renamingFileId === file.id ? (
                                  <div className="w-full">
                                    <input
                                      type="text"
                                      value={newFileName}
                                      onChange={(e) => setNewFileName(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleRenameFile(file)
                                        } else if (e.key === 'Escape') {
                                          cancelRename()
                                        }
                                      }}
                                      onBlur={() => cancelRename()}
                                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-tech-accent focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                      autoFocus
                                    />
                                  </div>
                                ) : copyingFileId === file.id ? (
                                  <div className="w-full">
                                    <input
                                      type="text"
                                      value={newCopyFileName}
                                      onChange={(e) => setNewCopyFileName(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleCopyFile(file)
                                        } else if (e.key === 'Escape') {
                                          cancelCopy()
                                        }
                                      }}
                                      onBlur={() => cancelCopy()}
                                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-tech-accent focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                      autoFocus
                                    />
                                  </div>
                                ) : movingFileId === file.id ? (
                                  <div className="w-full">
                                    <input
                                      type="text"
                                      value={newMoveFileName}
                                      onChange={(e) => setNewMoveFileName(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleMoveFile(file)
                                        } else if (e.key === 'Escape') {
                                          cancelMove()
                                        }
                                      }}
                                      onBlur={() => cancelMove()}
                                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-tech-accent focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                      autoFocus
                                    />
                                  </div>
                                ) : (
                                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate w-full">
                                    {file.name}
                                  </p>
                                )}
                                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                  <p>{formatFileSize(file.size)}</p>
                                  <p>{formatDateTime(file.created_at)}</p>
                                  <p className="truncate">{file.mime_type}</p>
                                </div>
                              </div>
                            </div>

                            {/* 悬浮操作 */}
                            <div className={`absolute top-2 right-2 ${selectedFiles.includes(file.id) ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => window.open(file.url, '_blank')}
                                  className="p-1 bg-white dark:bg-gray-800 rounded shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  <Download className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                                </button>
                                <button
                                  onClick={() => startCopyFile(file)}
                                  className="p-1 bg-white dark:bg-gray-800 rounded shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  <File className="w-3 h-3 text-green-600" />
                                </button>
                                <button
                                  onClick={() => startMoveFile(file)}
                                  className="p-1 bg-white dark:bg-gray-800 rounded shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  <Folder className="w-3 h-3 text-yellow-600" />
                                </button>
                                <button
                                  onClick={() => startRenameFile(file)}
                                  className="p-1 bg-white dark:bg-gray-800 rounded shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  <FileText className="w-3 h-3 text-blue-600" />
                                </button>
                                <button
                                  onClick={() => handleDeleteFile(file.id)}
                                  className="p-1 bg-white dark:bg-gray-800 rounded shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  <Trash2 className="w-3 h-3 text-red-600" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              <input
                                type="checkbox"
                                checked={selectedFiles.length > 0 && selectedFiles.length === filteredFiles.length}
                                onChange={selectAllFiles}
                                className="rounded border-gray-300 dark:border-gray-600 text-tech-accent focus:ring-tech-accent"
                              />
                            </th>
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
                            <motion.tr
                              key={file.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedFiles.includes(file.id)}
                                  onChange={() => toggleFileSelection(file.id)}
                                  className="rounded border-gray-300 dark:border-gray-600 text-tech-accent focus:ring-tech-accent"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className={`flex-shrink-0 ${getFileTypeColor(file.type)}`}>
                                    {getFileIcon(file.type, file.mime_type)}
                                  </div>
                                  <div className="ml-4">
                                    {renamingFileId === file.id ? (
                                      <input
                                        type="text"
                                        value={newFileName}
                                        onChange={(e) => setNewFileName(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            handleRenameFile(file)
                                          } else if (e.key === 'Escape') {
                                            cancelRename()
                                          }
                                        }}
                                        onBlur={() => cancelRename()}
                                        className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-tech-accent focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        autoFocus
                                      />
                                    ) : copyingFileId === file.id ? (
                                      <input
                                        type="text"
                                        value={newCopyFileName}
                                        onChange={(e) => setNewCopyFileName(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            handleCopyFile(file)
                                          } else if (e.key === 'Escape') {
                                            cancelCopy()
                                          }
                                        }}
                                        onBlur={() => cancelCopy()}
                                        className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-tech-accent focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        autoFocus
                                      />
                                    ) : movingFileId === file.id ? (
                                      <input
                                        type="text"
                                        value={newMoveFileName}
                                        onChange={(e) => setNewMoveFileName(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            handleMoveFile(file)
                                          } else if (e.key === 'Escape') {
                                            cancelMove()
                                          }
                                        }}
                                        onBlur={() => cancelMove()}
                                        className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-tech-accent focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        autoFocus
                                      />
                                    ) : (
                                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {file.name}
                                      </div>
                                    )}
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
                                  <button
                                    onClick={() => startRenameFile(file)}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    <FileText className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteFile(file.id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {filteredFiles.length === 0 && (
                    <div className="text-center py-12">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                        暂无文件
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        开始上传文件到系统中。
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
                              fetchFilesAndFolders(currentFolderPath, currentPage - 1)
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
                                  fetchFilesAndFolders(currentFolderPath, 1)
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
                                    fetchFilesAndFolders(currentFolderPath, pageNum)
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
                                  fetchFilesAndFolders(currentFolderPath, totalPages)
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
                              fetchFilesAndFolders(currentFolderPath, currentPage + 1)
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
          </Fragment>
        )}
        {activeTab === 'system' && (
          <SystemDefaultAssets
            onFolderChange={(folderId, folderPath) => {
              setCurrentFolder(folderId)
              setCurrentFolderPath(folderPath)
            }}
          />
        )}
      </div>
    </AdminLayout>
  )
}
