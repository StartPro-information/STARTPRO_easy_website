import { useState, useEffect, useMemo, type ReactNode } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  BookOpen,
  Eye,
  Calendar,
  RefreshCw
} from 'lucide-react'
import { statsApi } from '@/utils/api'
import { formatDateTime } from '@/utils'
import toast from 'react-hot-toast'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2'
import type { AnalyticsData } from '@/types'
import { useSettings } from '@/contexts/SettingsContext'
import { getVisualPalette, type VisualPalette } from '@/utils/themeAdapters'
import { getThemeById, type ColorTheme } from '@/styles/themes'
import { getShadowStyle } from '@/styles/themeMotion'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface ChartData {
  name: string
  value: number
  date?: string
}

const hexToRgba = (hex: string, alpha: number) => {
  const sanitized = hex.replace('#', '')
  const bigint = parseInt(sanitized, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const resolveCssColor = (variable: string, fallback: string) => {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable)
  return value?.trim() || fallback
}

const rangeLabelMap: Record<string, string> = {
  '7days': '近 7 天',
  '30days': '近 30 天',
  '90days': '近 90 天',
  '1year': '近一年'
}

const formatDuration = (seconds?: number) => {
  if (!seconds && seconds !== 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const formatNumber = (value?: number | null) => {
  if (typeof value !== 'number') return '--'
  return value.toLocaleString('zh-CN')
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState('7days')
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const { settings } = useSettings()
  const currentThemeId = settings?.site_theme || 'neo-futuristic'
  const visualPalette = useMemo(() => getVisualPalette(currentThemeId), [currentThemeId])
  const currentTheme = useMemo(() => getThemeById(currentThemeId), [currentThemeId])
  const readableRange = rangeLabelMap[dateRange] || '最近一段时间'

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      const response = await statsApi.getAnalytics({ range: dateRange })
      if (response.success) {
        const pageViewsTrend = response.data.pageViewsTrend.map((item: any) => ({
          name: item.date,
          value: item.views
        }))

        const docViewsTrend = (response.data.docViewsTrend || []).map((item: any) => ({
          name: item.date,
          value: item.views
        }))

        const userActivity = response.data.userActivity.map((item: any) => ({
          name:
            item.action === 'login'
              ? '登录'
              : item.action === 'view'
                ? '页面浏览'
                : item.action === 'create'
                  ? '内容创建'
                  : item.action === 'update'
                    ? '内容编辑'
                    : item.action === 'delete'
                      ? '内容删除'
                      : item.action,
          value: item.count
        }))

        const popularPages = response.data.popularPages.map((item: any) => ({
          name: item.title,
          value: item.view_count
        }))

        const popularDocs = (response.data.popularDocs || []).map((item: any) => ({
          name: item.title_path || item.slug || item.title,
          slug: item.slug,
          value: item.view_count
        }))

        const deviceStats = response.data.deviceStats.map((item: any) => ({
          name: item.device_type,
          value: item.count
        }))

        const browserStats = response.data.browserStats.map((item: any) => ({
          name: item.browser,
          value: item.count
        }))

        const pageDetails = response.data.pageDetails.map((item: any) => ({
          title: item.title,
          views: item.views,
          unique_visitors: item.unique_visitors,
          avg_time: item.avg_time,
          bounce_rate: item.bounce_rate
        }))

        const docDetails = (response.data.docDetails || []).map((item: any) => ({
          title: item.title,
          slug: item.slug,
          title_path: item.title_path,
          views: item.views,
          unique_visitors: item.unique_visitors,
          avg_time: item.avg_time,
          bounce_rate: item.bounce_rate
        }))

        setAnalyticsData({
          pageViewsTrend,
          docViewsTrend,
          userActivity,
          popularPages,
          popularDocs,
          deviceStats,
          browserStats,
          metrics: response.data.metrics,
          docMetrics: response.data.docMetrics,
          pageDetails,
          docDetails
        })
        setLastUpdated(new Date().toISOString())
      }
    } catch (error) {
      console.error('获取数据分析失败:', error)
      toast.error('获取数据分析失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAnalytics()
    setRefreshing(false)
    toast.success('数据已刷新')
  }

  if (isLoading) {
    return (
      <AdminLayout title="数据分析">
        <div className="flex items-center justify-center h-64">
          <div className="h-12 w-12 rounded-full border-2 border-t-transparent border-semantic-hero-accent animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  const metricCards = [
    {
      key: 'totalVisits',
      title: '总访问量',
      value: formatNumber(analyticsData?.metrics?.totalVisits),
      icon: <Eye className="w-6 h-6" />,
      accentColor: visualPalette.series[0]
    },
    {
      key: 'uniqueVisitors',
      title: '独立访客',
      value: formatNumber(analyticsData?.metrics?.uniqueVisitors),
      icon: <Users className="w-6 h-6" />,
      accentColor: visualPalette.series[1] || visualPalette.series[0]
    },
    {
      key: 'pageViews',
      title: '页面浏览量',
      value: formatNumber(analyticsData?.metrics?.pageViews),
      icon: <FileText className="w-6 h-6" />,
      accentColor: visualPalette.series[2] || visualPalette.series[0]
    },
    {
      key: 'avgTime',
      title: '平均停留时间',
      value: analyticsData?.metrics?.avgTimeOnPage || '0:00',
      icon: <Calendar className="w-6 h-6" />,
      accentColor: visualPalette.series[3] || visualPalette.series[0]
    },
    {
      key: 'docViews',
      title: '文档浏览量',
      value: formatNumber(analyticsData?.docMetrics?.pageViews),
      icon: <BookOpen className="w-6 h-6" />,
      accentColor: visualPalette.series[4] || visualPalette.series[0]
    },
    {
      key: 'docVisitors',
      title: '文档独立访客',
      value: formatNumber(analyticsData?.docMetrics?.uniqueVisitors),
      icon: <Users className="w-6 h-6" />,
      accentColor: visualPalette.series[5] || visualPalette.series[1] || visualPalette.series[0]
    }
  ]

  const chartConfigs = [
    {
      key: 'pageViewsTrend',
      title: '页面浏览趋势',
      subtitle: `${readableRange}的访问变化`,
      type: 'line' as const,
      data: analyticsData?.pageViewsTrend || []
    },
    {
      key: 'docViewsTrend',
      title: '文档浏览趋势',
      subtitle: `${readableRange}的文档访问变化`,
      type: 'line' as const,
      data: analyticsData?.docViewsTrend || []
    },
    {
      key: 'userActivity',
      title: '用户活动分布',
      subtitle: '行为类型占比',
      type: 'pie' as const,
      data: analyticsData?.userActivity || []
    },
    {
      key: 'popularPages',
      title: '热门页面',
      subtitle: '访问量最高的页面',
      type: 'bar' as const,
      data: analyticsData?.popularPages || []
    },
    {
      key: 'popularDocs',
      title: '热门文档',
      subtitle: '访问量最高的文档',
      type: 'bar' as const,
      data: analyticsData?.popularDocs || []
    },
    {
      key: 'deviceStats',
      title: '设备与浏览器',
      subtitle: '设备占比 + 浏览器趋势',
      type: 'doughnut' as const,
      data: analyticsData ? [...analyticsData.deviceStats, ...analyticsData.browserStats] : []
    }
  ]

  const tableRows = analyticsData?.pageDetails || []
  const docRows = analyticsData?.docDetails || []

  return (
    <AdminLayout title="数据分析" description="了解官网访问情况与用户行为">
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-theme-text">数据分析</h1>
            <p className="text-theme-textSecondary">多维度洞察页面表现与访问趋势</p>
            <p className="text-xs text-theme-textSecondary mt-1">
              最近更新：{lastUpdated ? formatDateTime(lastUpdated) : '---'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={dateRange}
              onChange={event => setDateRange(event.target.value)}
              className="px-4 py-2 rounded-lg border border-semantic-panelBorder bg-semantic-mutedBg text-theme-text focus:outline-none focus:ring-2 focus:ring-semantic-hero-accent"
            >
              {Object.entries(rangeLabelMap).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 rounded-lg border border-semantic-panelBorder bg-semantic-panel text-theme-text hover:bg-semantic-mutedBg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              刷新
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {metricCards.map(card => (
            <MetricCard
              key={card.key}
              title={card.title}
              value={card.value}
              icon={card.icon}
              accentColor={card.accentColor}
              theme={currentTheme}
              positiveColor={visualPalette.positive}
              negativeColor={visualPalette.negative}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {chartConfigs.map(config => (
            <ChartCard
              key={config.key}
              title={config.title}
              subtitle={config.subtitle}
              data={config.data}
              type={config.type}
              palette={visualPalette}
              theme={currentTheme}
            />
          ))}
        </div>

        <div className="bg-semantic-panel border border-semantic-panelBorder rounded-2xl p-6" style={getShadowStyle(currentTheme.id, 1)}>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-theme-text">页面详情</h2>
              <p className="text-sm text-theme-textSecondary">按照浏览量排序</p>
            </div>
            <span className="text-xs text-theme-textSecondary">
              共 {tableRows.length} 条记录
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-semantic-mutedBg">
                <tr>
                  {['页面', '浏览量', '独立访客', '平均停留时间', '跳出率'].map(header => (
                    <th
                      key={header}
                      className="px-4 py-3 text-xs font-semibold text-theme-textSecondary uppercase tracking-wide"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-semantic-panelBorder/60">
                {tableRows.length > 0 ? (
                  tableRows.map((row, index) => (
                    <tr key={`${row.title}-${index}`} className="hover:bg-semantic-mutedBg/60 transition-colors">
                      <td className="px-4 py-4 text-sm font-medium text-theme-text">{row.title}</td>
                      <td className="px-4 py-4 text-sm text-theme-textSecondary">
                        {row.views.toLocaleString('zh-CN')}
                      </td>
                      <td className="px-4 py-4 text-sm text-theme-textSecondary">
                        {row.unique_visitors.toLocaleString('zh-CN')}
                      </td>
                      <td className="px-4 py-4 text-sm text-theme-textSecondary">
                        {formatDuration(row.avg_time)}
                      </td>
                      <td className="px-4 py-4 text-sm text-theme-textSecondary">
                        {`${row.bounce_rate ?? analyticsData?.metrics?.bounceRate ?? 0}%`}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-theme-textSecondary">
                      暂无页面数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-semantic-panel border border-semantic-panelBorder rounded-2xl p-6" style={getShadowStyle(currentTheme.id, 1)}>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-theme-text">文档详情</h2>
              <p className="text-sm text-theme-textSecondary">按照浏览量排序</p>
            </div>
            <span className="text-xs text-theme-textSecondary">
              共 {docRows.length} 条记录
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-semantic-mutedBg">
                <tr>
                  {['文档', '浏览量', '独立访客', '平均停留时间', '跳出率'].map(header => (
                    <th
                      key={header}
                      className="px-4 py-3 text-xs font-semibold text-theme-textSecondary uppercase tracking-wide"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-semantic-panelBorder/60">
                {docRows.length > 0 ? (
                  docRows.map((row, index) => (
                    <tr key={`${row.title}-${index}`} className="hover:bg-semantic-mutedBg/60 transition-colors">
                      <td className="px-4 py-4 text-sm font-medium text-theme-text">
                        {row.title_path || row.slug || row.title}
                      </td>
                      <td className="px-4 py-4 text-sm text-theme-textSecondary">
                        {row.views.toLocaleString('zh-CN')}
                      </td>
                      <td className="px-4 py-4 text-sm text-theme-textSecondary">
                        {row.unique_visitors.toLocaleString('zh-CN')}
                      </td>
                      <td className="px-4 py-4 text-sm text-theme-textSecondary">
                        {formatDuration(row.avg_time)}
                      </td>
                      <td className="px-4 py-4 text-sm text-theme-textSecondary">
                        {`${row.bounce_rate ?? analyticsData?.docMetrics?.bounceRate ?? 0}%`}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-theme-textSecondary">
                      暂无文档数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

function MetricCard({
  title,
  value,
  icon,
  accentColor,
  positiveColor,
  negativeColor,
  theme
}: {
  title: string
  value: string
  icon: ReactNode
  accentColor: string
  positiveColor: string
  negativeColor: string
  theme: ColorTheme
}) {
  const cardShadow = getShadowStyle(theme.id, 1)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-semantic-panel rounded-2xl border border-semantic-panelBorder p-6"
      style={cardShadow}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-theme-textSecondary">{title}</p>
          <p className="mt-1 text-2xl font-bold text-theme-text">{value}</p>
        </div>
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: hexToRgba(accentColor, 0.18), color: accentColor }}
        >
          {icon}
        </div>
      </div>
      <div className="mt-4 h-1 rounded-full bg-semantic-mutedBg overflow-hidden">
        <span
          className="block h-full rounded-full"
          style={{
            width: '60%',
            background: `linear-gradient(90deg, ${positiveColor}, ${negativeColor})`
          }}
        />
      </div>
    </motion.div>
  )
}

function ChartCard({
  title,
  subtitle,
  data,
  type,
  palette,
  theme
}: {
  title: string
  subtitle: string
  data: ChartData[]
  type: 'line' | 'bar' | 'pie' | 'doughnut'
  palette: VisualPalette
  theme: ColorTheme
}) {
  const cardClass =
    'bg-semantic-panel rounded-2xl border border-semantic-panelBorder p-6 flex flex-col gap-6'
  const labelColor = resolveCssColor('--color-text-secondary', palette.tooltipText)
  const cardShadow = getShadowStyle(theme.id, 1)

  if (!data || data.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={cardClass} style={cardShadow}>
        <div>
          <h3 className="text-lg font-semibold text-theme-text">{title}</h3>
          <p className="text-sm text-theme-textSecondary">{subtitle}</p>
        </div>
        <div className="flex flex-1 items-center justify-center rounded-xl bg-semantic-mutedBg border border-semantic-panelBorder/60">
          <div className="text-center">
            <BarChart3 className="mx-auto mb-4 h-10 w-10 text-theme-textSecondary" />
            <p className="text-theme-textSecondary">暂无数据</p>
          </div>
        </div>
      </motion.div>
    )
  }

  const baseColor = palette.series[0]
  const datasetBackground = type === 'line' ? hexToRgba(baseColor, 0.2) : palette.series
  const datasetBorder = type === 'line' ? baseColor : palette.series

  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        label: title,
        data: data.map(item => item.value),
        backgroundColor: datasetBackground,
        borderColor: datasetBorder,
        borderWidth: type === 'line' ? 2 : 1,
        fill: type === 'line',
        pointBackgroundColor: baseColor,
        pointBorderColor: '#fff'
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: labelColor,
          font: { size: 12 }
        }
      },
      title: { display: false },
      tooltip: {
        backgroundColor: palette.tooltipBg,
        titleColor: palette.tooltipText,
        bodyColor: palette.tooltipText,
        borderColor: palette.tooltipText,
        borderWidth: 1
      }
    },
    scales:
      type === 'pie' || type === 'doughnut'
        ? {}
        : {
            x: {
              ticks: { color: labelColor, font: { size: 11 } },
              grid: { color: palette.grid }
            },
            y: {
              ticks: { color: labelColor, font: { size: 11 } },
              grid: { color: palette.grid }
            }
          }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={cardClass} style={cardShadow}>
      <div>
        <h3 className="text-lg font-semibold text-theme-text">{title}</h3>
        <p className="text-sm text-theme-textSecondary">{subtitle}</p>
      </div>
      <div className="h-64">
        {type === 'line' && <Line data={chartData} options={chartOptions} />}
        {type === 'bar' && <Bar data={chartData} options={chartOptions} />}
        {type === 'pie' && <Pie data={chartData} options={chartOptions} />}
        {type === 'doughnut' && <Doughnut data={chartData} options={chartOptions} />}
      </div>
    </motion.div>
  )
}
