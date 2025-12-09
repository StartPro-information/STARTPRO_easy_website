import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { motion } from 'framer-motion'
import {
  FileText,
  BookOpen,
  Users,
  BarChart3,
  Activity,
  TrendingUp,
  Eye,
  Calendar
} from 'lucide-react'
import { statsApi } from '@/utils/api'
import type { Stats } from '@/types'

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await statsApi.getDashboard()
        if (response.success) {
          setStats(response.data)
        }
      } catch (error) {
        console.error('获取统计数据失败:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <AdminLayout title="仪表盘">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tech-accent"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="仪表盘" description="关键业务指标概览">
      <div className="space-y-6">
        {/* 欢迎信息 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-theme-surfaceAlt border border-semantic-panelBorder rounded-lg p-6 text-theme-text shadow-md"
        >
          <h1 className="text-2xl font-bold mb-2">欢迎回来！</h1>
          <p className="text-theme-textSecondary">
            今天是 {new Date().toLocaleDateString('zh-CN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}
          </p>
        </motion.div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="总页面数"
            value={stats?.total_pages || 0}
            icon={<FileText className="w-6 h-6" />}
            color="from-blue-500 to-blue-600"
            delay={0.1}
          />
          <StatCard
            title="已发布页面"
            value={stats?.published_pages || 0}
            icon={<Eye className="w-6 h-6" />}
            color="from-green-500 to-green-600"
            delay={0.2}
          />
          <StatCard
            title="总文档数"
            value={stats?.total_docs || 0}
            icon={<BookOpen className="w-6 h-6" />}
            color="from-purple-500 to-purple-600"
            delay={0.3}
          />
          <StatCard
            title="已发布文档"
            value={stats?.published_docs || 0}
            icon={<BookOpen className="w-6 h-6" />}
            color="from-indigo-500 to-indigo-600"
            delay={0.35}
          />
        </div>

        {/* 访问量统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="总访问量（页面）"
            value={stats?.total_visits || 0}
            icon={<BarChart3 className="w-6 h-6" />}
            color="from-orange-500 to-orange-600"
            delay={0.4}
          />
          <StatCard
            title="当天访问量"
            value={stats?.today_visits || 0}
            icon={<Calendar className="w-6 h-6" />}
            color="from-cyan-500 to-cyan-600"
            delay={0.5}
          />
          <StatCard
            title="近一周访问量"
            value={stats?.week_visits || 0}
            icon={<TrendingUp className="w-6 h-6" />}
            color="from-teal-500 to-teal-600"
            delay={0.6}
          />
          <StatCard
            title="近一月访问量"
            value={stats?.month_visits || 0}
            icon={<Activity className="w-6 h-6" />}
            color="from-indigo-500 to-indigo-600"
            delay={0.7}
          />
        </div>

        {/* 文档访问量统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="总访问量（文档）"
            value={stats?.total_doc_visits || 0}
            icon={<BookOpen className="w-6 h-6" />}
            color="from-orange-500 to-orange-600"
            delay={0.45}
          />
          <StatCard
            title="当天文档访问"
            value={stats?.today_doc_visits || 0}
            icon={<Calendar className="w-6 h-6" />}
            color="from-cyan-500 to-cyan-600"
            delay={0.55}
          />
          <StatCard
            title="近一周文档访问"
            value={stats?.week_doc_visits || 0}
            icon={<TrendingUp className="w-6 h-6" />}
            color="from-teal-500 to-teal-600"
            delay={0.65}
          />
          <StatCard
            title="近一月文档访问"
            value={stats?.month_doc_visits || 0}
            icon={<Activity className="w-6 h-6" />}
            color="from-indigo-500 to-indigo-600"
            delay={0.75}
          />
        </div>

        {/* 详细分析 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white dark:bg-tech-light rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            详细数据分析
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            查看详细的访问数据、用户行为分析和更多维度的统计信息。
          </p>
          <a
            href="/admin/analytics"
            className="inline-flex items-center px-4 py-2 bg-tech-accent text-white rounded-lg hover:bg-tech-secondary transition-colors text-sm"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            进入详细分析
          </a>
        </motion.div>

        {/* 系统状态 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white dark:bg-tech-light rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            系统状态
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                服务状态
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-900 dark:text-white">正常</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                数据库
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-900 dark:text-white">连接正常</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                CPU 使用率
              </span>
              <span className="text-sm text-gray-900 dark:text-white">
                {stats?.system_status?.cpu_percent || 0}%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                内存使用情况
              </span>
              <span className="text-sm text-gray-900 dark:text-white">
                {stats?.system_status?.memory?.used || '0 GB'} / {stats?.system_status?.memory?.total || '0 GB'} ({stats?.system_status?.memory?.percent || 0}%)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                存储空间
              </span>
              <span className="text-sm text-gray-900 dark:text-white">
                {stats?.system_status?.storage?.used || '0 GB'} / {stats?.system_status?.storage?.total || '0 GB'} ({stats?.system_status?.storage?.percent || 'N/A'})
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  )
}

// 统计卡片组件
interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: string
  delay: number
}

function StatCard({ title, value, icon, color, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white dark:bg-tech-light rounded-lg border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value.toLocaleString()}
          </p>
        </div>
        <div className={`p-3 bg-gradient-to-r ${color} rounded-lg text-white`}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}

