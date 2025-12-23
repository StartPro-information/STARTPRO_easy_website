import { PageTemplate, ComponentDefinition } from '@/types/templates'
import { cardComponents } from './componentDefinitions/cardComponents'
import { cyberComponents } from './componentDefinitions/cyberComponents'
import { imageComponents } from './componentDefinitions/imageComponents'
import { textComponents } from './componentDefinitions/textComponents'
import { uncategorizedComponents } from './componentDefinitions/uncategorizedComponents'

// 组件定义，按新分类拆分后的聚合
export const componentDefinitions: ComponentDefinition[] = [
  ...imageComponents,
  ...cardComponents,
  ...textComponents,
  ...cyberComponents,
  ...uncategorizedComponents
]

export const pageTemplates: PageTemplate[] = [
  {
    id: 'simple-page',
    name: '简单页面',
    description: '基础的单页面模板，适合快速创建内容',
    category: '基础页面',
    thumbnail: '/images/templates/simple.jpg',
    components: [
      {
        id: 'hero-5',
        type: 'hero',
        props: {
          title: '页面标题',
          subtitle: '页面副标题或简要描述',
          backgroundImage: '/images/simple-hero.jpg'
        }
      },
      {
        id: 'text-4',
        type: 'text-block',
        props: {
          title: '内容标题',
          content: '在这里添加您的页面内容。您可以根据需要修改文字、添加图片或其他元素。'
        }
      }
    ]
  }
]
// 根据分类获取模板
export const getTemplatesByCategory = (category?: string): PageTemplate[] => {
  if (!category) return pageTemplates
  return pageTemplates.filter(template => template.category === category)
}
