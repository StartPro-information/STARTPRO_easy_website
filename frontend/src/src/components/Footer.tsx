import React from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin, ExternalLink, Github, Twitter, Linkedin } from 'lucide-react'

interface FooterProps {
  siteName?: string
  icpNumber?: string
  contactInfo?: {
    email?: string
    phone?: string
    address?: string
  }
  socialLinks?: {
    weibo?: string
    wechat?: string
    qq?: string
    email?: string
  }
  quickLinks?: Array<{
    label: string
    href: string
    external?: boolean
  }>
}

export default function Footer({
  siteName = '科技公司',
  icpNumber = '京ICP备xxxxxxxx号',
  contactInfo = {
    email: 'contact@example.com',
    phone: '400-123-4567',
    address: '北京市朝阳区科技园'
  },
  socialLinks = {},
  quickLinks
}: FooterProps) {
  const currentYear = new Date().getFullYear()

  // 检查是否在客户端环境
  const isClient = typeof window !== 'undefined';

  return (
    <footer className="footer-container">
      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* 公司信息 */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="text-xl font-bold text-gradient company-name">{siteName}</span>
            </div>
            
            <p className="mb-6 max-w-md leading-relaxed footer-description">
              专注于为企业提供前沿的技术解决方案，致力于推动数字化转型，
              以创新的技术和专业的服务帮助客户实现业务增长。
            </p>

            {/* 联系信息 */}
            <div className="space-y-4 contact-info">
              {contactInfo.email && (
                <div className="flex items-center space-x-4 transition-transform duration-300 hover:-translate-x-1">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <Mail className="w-5 h-5" />
                  </div>
                  <a href={`mailto:${contactInfo.email}`} className="text-sm hover:text-accent transition-colors duration-300">
                    {contactInfo.email}
                  </a>
                </div>
              )}
              
              {contactInfo.phone && (
                <div className="flex items-center space-x-4 transition-transform duration-300 hover:-translate-x-1">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <Phone className="w-5 h-5" />
                  </div>
                  <a href={`tel:${contactInfo.phone}`} className="text-sm hover:text-accent transition-colors duration-300">
                    {contactInfo.phone}
                  </a>
                </div>
              )}
              
              {contactInfo.address && (
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="text-sm">{contactInfo.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* 快速链接 */}
          <div>
            <h3 className="font-semibold mb-6 footer-section-title">快速链接</h3>
            <ul className="space-y-0 quick-links" style={{ marginTop: '-0.5rem', marginBottom: '-0.5rem' }}>
              {quickLinks && quickLinks.slice(0, 6).map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="footer-link"
                    {...(link.external && { target: '_blank', rel: 'noopener noreferrer' })}
                  >
                    <span>{link.label}</span>
                    {link.external && <ExternalLink className="w-3 h-3 ml-1 inline" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 社交媒体和关注我们 */}
          <div>
            <h3 className="font-semibold mb-6 footer-section-title">关注我们</h3>
            
            {/* 社交媒体链接 */}
            <div className="flex justify-start space-x-4 social-links" style={{ marginLeft: '0' }}>
              <a href="#" className="social-icon" aria-label="GitHub">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="social-icon" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="social-icon" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 底部版权信息 */}
      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
          </div>
        </div>
      </div>
    </footer>
  )
}
