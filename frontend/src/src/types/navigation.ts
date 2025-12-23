import type { FooterLayout, FooterSocialLink } from './index'

/**
 * 导航项目接口
 */
export interface NavItem {
  /**
   * 导航项显示文本
   */
  label: string
  
  /**
   * 导航项链接
   */
  href: string
  
  /**
   * 子导航项
   */
  children?: NavItem[]
  
  /**
   * 是否在新窗口打开
   */
  external?: boolean
  
  /**
   * 图标
   */
  icon?: React.ReactNode
  
  /**
   * 自定义CSS类名
   */
  className?: string
}

/**
 * 导航栏样式配置接口
 */
export interface NavStyles {
  /**
   * 背景色
   */
  backgroundColor: string
  
  /**
   * 文本颜色
   */
  textColor: string
  
  /**
   * 边框颜色
   */
  borderColor: string
  
  /**
   * 悬停颜色
   */
  hoverColor: string
  
  /**
   * 活动颜色
   */
  activeColor: string
  
  /**
   * 下拉菜单背景色
   */
  dropdownBgColor: string
  
  /**
   * 下拉菜单边框颜色
   */
  dropdownBorderColor: string
  
  /**
   * 阴影颜色
   */
  shadowColor: string
}

/**
 * 导航栏布局类型
 */
export type NavLayoutType = 'horizontal' | 'vertical' | 'mobile'

/**
 * 导航栏配置接口
 */
export interface NavConfig {
  /**
   * 导航栏布局类型
   */
  layout: NavLayoutType
  
  /**
   * 是否固定在顶部
   */
  fixed?: boolean
  
  /**
   * 是否显示滚动效果
   */
  scrollEffects?: boolean
  
  /**
   * 是否显示Logo
   */
  showLogo?: boolean
  
  /**
   * 是否显示网站名称
   */
  showSiteName?: boolean
  
  /**
   * 移动端菜单断点
   */
  mobileBreakpoint?: number
  
  /**
   * 动画持续时间（毫秒）
   */
  animationDuration?: number
}

/**
 * 主题感知导航栏属性接口
 */
export interface ThemeAwareHeaderProps {
  /**
   * Logo URL
   */
  logo?: string
  
  /**
   * 网站名称
   */
  siteName?: string
  
  /**
   * 导航项目数组
   */
  navigation?: NavItem[]
  
  /**
   * 导航栏布局样式
   */
  
  /**
   * 自定义导航栏配置
   */
  config?: NavConfig
  
  /**
   * 自定义类名
   */
  className?: string
  
  /**
   * 自定义事件处理器 - 主题变更
   */
  onThemeChange?: (themeId: string) => void
  
  /**
   * 自定义事件处理器 - 滚动
   */
  onScroll?: (scrolled: boolean) => void
}

/**
 * 页脚样式配置接口
 */
export interface FooterStyles {
  /**
   * 背景色
   */
  backgroundColor: string
  
  /**
   * 文本颜色
   */
  textColor: string
  
  /**
   * 边框颜色
   */
  borderColor: string
  
  /**
   * 链接颜色
   */
  linkColor: string
  
  /**
   * 链接悬停颜色
   */
  hoverColor: string
  
  /**
   * 标题颜色
   */
  titleColor: string
  
  /**
   * 描述文本颜色
   */
  descriptionColor: string
  
  /**
   * 图标背景色
   */
  iconBackgroundColor: string
}

/**
 * 主题感知页脚属性接口
 */
export interface ThemeAwareFooterProps {
  /**
   * 网站名称
   */
  siteName?: string
  
  /**
   * ICP备案号
   */
  icpNumber?: string
  
  /**
   * 联系信息
   */
  contactInfo?: {
    email?: string
    phone?: string
    address?: string
  }
  
  /**
   * 社交媒体链接
   */
  socialLinks?: {
    weibo?: string
    wechat?: string
    qq?: string
    email?: string
  }
  
  /**
   * 快速链接数组
   */
  quickLinks?: Array<{
    label: string
    href: string
    external?: boolean
  }>
  /**
   * 全新页脚布局数据
   */
  footerLayout?: FooterLayout
  /**
   * 社交媒体图标列表
   */
  footerSocialLinks?: FooterSocialLink[]
  
  /**
   * 自定义类名
   */
  className?: string
  
  /**
   * 自定义事件处理器 - 主题变更
   */
  onThemeChange?: (themeId: string) => void
}
