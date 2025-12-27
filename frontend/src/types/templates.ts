// 页面模板系统类型定义

export interface TemplateComponent {
  id: string
  type: ComponentType
  props: Record<string, any>
  children?: TemplateComponent[]
}

export interface PageTemplate {
  id: string
  name: string
  description: string
  category: string
  thumbnail: string
  components: TemplateComponent[]
}

export interface EditableField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'image' | 'link' | 'rich-text' | 'array'
  value: any
  placeholder?: string
  required?: boolean
  options?: Array<{ label: string; value: string }>
  subFields?: EditableField[]
}

export type ComponentType =
  | 'hero'
  | 'text-block'
  | 'image-block'
  | 'feature-grid'
  | 'feature-grid-large'
  | 'video-player'
  | 'pricing-cards'
  | 'contact-form'
  | 'team-grid'
  | 'timeline'
  | 'cyber-timeline'
  | 'cyber-showcase'
  | 'cyber-super-card'
  | 'call-to-action'
  | 'testimonials'
  | 'faq-section'
  | 'stats-section'
  | 'news-list'
  | 'logo-wall'
  | 'logo-scroll'
  | 'image-text'
  | 'image-text-horizontal'
  | 'banner-carousel'
  | 'product-showcase-card'
  | 'raw-html'
  | 'link-block'
  | 'table'

export interface ComponentDefinition {
  type: ComponentType
  name: string
  description: string
  icon: string
  category: string
  defaultProps: Record<string, any>
  editableFields: EditableField[]
  previewComponent: React.ComponentType<any>
}

export interface PageBuilderState {
  components: TemplateComponent[]
  selectedComponent: string | null
  isDragging: boolean
  previewMode: boolean
}

export interface TemplatePreviewProps {
  template: PageTemplate
  onSelect: (template: PageTemplate) => void
  selected?: boolean
}
