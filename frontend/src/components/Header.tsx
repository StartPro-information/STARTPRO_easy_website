import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Menu, X, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { settingsApi, navigationApi } from '@/utils/api'
import type { NavigationItem } from '@/types'
import { getCurrentThemeId, getThemeById } from '@/styles/themes'

interface NavItem {
  label: string
  href: string
  children?: NavItem[]
  external?: boolean
}

interface HeaderProps {
  logo?: string
  siteName?: string
  navigation?: NavItem[]
}

const defaultNavigation: NavItem[] = [
  { label: '首页', href: '/' },
  { 
    label: '产品服务', 
    href: '/services',
    children: [
      { label: '技术咨询', href: '/services/consulting' },
      { label: '软件开发', href: '/services/development' },
      { label: '系统集成', href: '/services/integration' }
    ]
  },
  { label: '解决方案', href: '/solutions' },
  { label: '案例展示', href: '/cases' },
  { label: '关于我们', href: '/about' },
  { label: '联系我们', href: '/contact' }
]

export default function Header({ 
  logo, 
  siteName,
  navigation
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [dynamicNavigation, setDynamicNavigation] = useState<NavItem[]>(defaultNavigation) // 初始化为默认导航
  const [dynamicSettings, setDynamicSettings] = useState<{ site_name?: string; site_logo?: string; company_name?: string; nav_color_style?: string }>({})
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // 检查是否在客户端环境
  const [isClient, setIsClient] = useState(typeof window !== 'undefined');
  const [currentThemeId, setCurrentThemeId] = useState('');

  // 获取当前主题ID
  useEffect(() => {
    if (isClient) {
      const themeId = getCurrentThemeId();
      setCurrentThemeId(themeId);
      
      // 添加主题变化监听器（模拟，实际应用中可能需要自定义事件）
      const handleThemeChange = () => {
        setCurrentThemeId(getCurrentThemeId());
      };
      
      // 这里可以添加事件监听器，比如自定义的主题变更事件
      // window.addEventListener('themeChanged', handleThemeChange);
      
      return () => {
        // window.removeEventListener('themeChanged', handleThemeChange);
      };
    }
  }, [isClient]);

  // 检查导航项是否为当前活动项
  const isActiveRoute = (href: string) => {
    return router.pathname === href || (href !== '/' && router.pathname.startsWith(href));
  };

  useEffect(() => {
    setIsClient(true);
  }, []);
  // 获取动态导航数据
  useEffect(() => {
    const fetchDynamicData = async () => {
      try {
        // 获取导航数据
        const navResponse = await navigationApi.getAll()
        console.log('导航API返回的原始数据:', navResponse);
        if (navResponse.success && navResponse.data) {
          const navItems = navResponse.data.map((item: NavigationItem) => ({
            label: item.name,
            href: item.url,
            external: item.target === '_blank',
            children: item.children && item.children.length > 0
              ? item.children.map(child => ({
                  label: child.name,
                  href: child.url,
                  external: child.target === '_blank'
                }))
              : undefined
          }))
          console.log('处理后的导航数据:', navItems);
          setDynamicNavigation(navItems)
        } else {
          // 如果 API 返回数据为空，使用默认导航
          console.log('使用默认导航数据');
          setDynamicNavigation(defaultNavigation)
        }

        // 获取网站设置
        try {
          const settingsResponse = await settingsApi.get()
          if (settingsResponse.success && settingsResponse.data) {
            // 后端返回的是一个对象，直接使用
            setDynamicSettings(settingsResponse.data)
          }
        } catch (error) {
          console.log('获取设置失败，使用默认值:', error)
        }
      } catch (error) {
        console.log('获取导航失败，使用默认导航:', error)
        setDynamicNavigation(defaultNavigation)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDynamicData()
  }, [])

  // 使用动态数据或传入的props，加载时使用默认导航
  const currentNavigation = navigation || dynamicNavigation
  const currentSiteName = siteName || dynamicSettings.company_name || dynamicSettings.site_name || '科技公司'
  const currentLogo = logo || dynamicSettings.site_logo || '/logo.png'
  useEffect(() => {
    if (!isClient) return;
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isClient])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
    setActiveDropdown(null)
  }

  const toggleDropdown = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label)
  }

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return router.pathname === '/'
    }
    return router.pathname.startsWith(href)
  }

  // 使用现代科技风格的导航栏

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-black/70 backdrop-blur-md border-b border-white/10 nav-container ${scrolled ? 'py-2 shadow-lg shadow-primary/10' : 'py-3'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between" style={{ height: '90px' }}>
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img 
                src={currentLogo} 
                alt={currentSiteName} 
                className="h-8 w-auto transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iIzAwZDRmZiIvPgo8cGF0aCBkPSJNOCAxMmg0djhoLTR2LTh6TTEyIDhoNHYxMmgtNHYtMTJ6TTE2IDRoNHYxNmgtNHYtMTZ6IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded"></div>
            </div>
            {/* 根据主题配置的companyName颜色决定公司名称的样式 */}
            <span 
              className="text-lg font-bold hidden sm:block drop-shadow-lg"
              style={{ color: getThemeById(currentThemeId).colors.companyName }}
            >
              {currentSiteName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {currentNavigation.map((item: NavItem) => (
              <div key={item.label} className="relative group">
                {item.children && item.children.length > 0 ? (
                  <div className="relative">
                    <div className="flex items-center">
                      <Link
                        href={item.href}
                        className={`flex items-center space-x-1 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-300 ${isActiveLink(item.href) ? 'text-primary font-medium' : ''}`}
                      >
                        <span>{item.label}</span>
                      </Link>
                      <button
                        className="p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-300"
                        onMouseEnter={() => setActiveDropdown(item.label)}
                        onMouseLeave={() => setActiveDropdown(null)}
                      >
                        <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
                      </button>
                    </div>

                    <AnimatePresence>
                      {activeDropdown === item.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-56 bg-black/90 border border-white/10 rounded-lg shadow-xl backdrop-blur-md"
                          onMouseEnter={() => setActiveDropdown(item.label)}
                          onMouseLeave={() => setActiveDropdown(null)}
                        >
                          <div className="py-2">
                            {item.children.map((child: NavItem) => (
                              <Link
                                key={child.label}
                                href={child.href}
                                className="block px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-primary/10 hover:text-[var(--color-primary)] transition-colors duration-200 rounded-md"
                                {...(child.external && { target: '_blank', rel: 'noopener noreferrer' })}
                              >
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-300 ${isActiveLink(item.href) ? 'text-primary font-medium' : ''}`}
                    {...(item.external && { target: '_blank', rel: 'noopener noreferrer' })}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200"
            aria-label="切换菜单"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 移动端菜单 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-full left-0 right-0 bg-black/95 border-t border-white/10 shadow-xl backdrop-blur-md"
          >
            <div className="px-4 py-4 space-y-2">
              {currentNavigation.map((item: NavItem) => (
                <div key={item.label}>
                  {item.children && item.children.length > 0 ? (
                    <div>
                      <div className="flex items-center">
                          <Link
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex-1 px-3 py-2 text-left text-base font-medium rounded-md transition-colors duration-200 ${isActiveLink(item.href) ? 'text-primary bg-primary/10' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]'}`}
                          >
                            {item.label}
                          </Link>
                          <button
                            onClick={() => toggleDropdown(item.label)}
                            className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
                          >
                            <ChevronDown
                              className={`w-5 h-5 transition-transform duration-200 ${activeDropdown === item.label ? 'rotate-180' : ''}`}
                            />
                          </button>
                      </div>

                      <AnimatePresence>
                        {activeDropdown === item.label && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-2 pl-4 space-y-1"
                          >
                            {item.children.map((child: NavItem) => (
                              <Link
                                key={child.label}
                                href={child.href}
                                onClick={() => setIsOpen(false)}
                                className={`block px-3 py-2 text-sm rounded-md transition-colors duration-200 ${isActiveLink(child.href) ? 'text-primary bg-primary/10' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]'}`}
                                {...(child.external && { target: '_blank', rel: 'noopener noreferrer' })}
                              >
                                {child.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`block px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${isActiveLink(item.href) ? 'text-primary bg-primary/10' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]'}`}
                      {...(item.external && { target: '_blank', rel: 'noopener noreferrer' })}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
