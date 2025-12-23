import { ComponentDefinition } from '@/types/templates'
import { CyberShowcasePreview, CyberSuperCardPreview, CyberTimelinePreview } from '@/components/PageBuilder/previews'

export const cyberComponents: ComponentDefinition[] = [
  {
    type: 'cyber-timeline',
    name: '赛博时间线',
    description: '高科技感的阶段式时间线组件',
    icon: '🚀',
    category: '赛博组件',
    defaultProps: {
      title: '数据智能应用之路',
      subtitle: '从试点到全域落地的实际路径',
      widthOption: 'full',
      backgroundColorOption: 'default',
      events: [
        {
          phase: 'Phase 01',
          date: 'T0 - T3 个月',
          title: '试验与模型验证',
          description: '聚焦业务目标指标，完成 PoC 与 MVP 验证，明确技术路线与上线范围。',
          link: '',
          tags: [
            { label: 'PoC', highlighted: true },
            { label: '算法底座' },
            { label: '指标标准' }
          ]
        },
        {
          phase: 'Phase 02',
          date: 'T3 - T9 个月',
          title: '业务单点落地',
          description: '对接现有业务系统，定义标杆作业流程，建立监控与反馈机制。',
          link: '',
          tags: [
            { label: 'ERP 接入' },
            { label: 'CRM 共建', highlighted: true },
            { label: '流程导入' }
          ]
        },
        {
          phase: 'Phase 03',
          date: 'T9+ 个月',
          title: '全域推广与 AIOps',
          description: '构建设备/数据中枢，形成组件化供给与智能运维闭环，支撑持续上线。',
          link: '',
          tags: [
            { label: '工程化' },
            { label: 'AIOps', highlighted: true },
            { label: '持续交付' }
          ]
        }
      ]
    },
    editableFields: [
      { key: 'title', label: '标题', type: 'text', value: '' },
      { key: 'subtitle', label: '副标题', type: 'text', value: '' },
      {
        key: 'widthOption',
        label: '宽度设置',
        type: 'text',
        value: 'full',
        options: [
          { label: '全宽', value: 'full' },
          { label: '标准宽度', value: 'standard' }
        ]
      },
      {
        key: 'backgroundColorOption',
        label: '背景',
        type: 'text',
        value: 'default',
        options: [
          { label: '默认背景', value: 'default' },
          { label: '透明背景', value: 'transparent' }
        ]
      }
    ],
    previewComponent: CyberTimelinePreview
  },
  {
    type: 'cyber-showcase',
    name: '赛博展示面板',
    description: '左右布局的按钮切换图片展示模块',
    icon: '🛸',
    category: '赛博组件',
    defaultProps: {
      widthOption: 'full',
      backgroundColorOption: 'default',
      imagePosition: 'right',
      controls: [
        {
          id: 'infra',
          label: '智能运维',
          title: 'IT基础架构服务',
          icon: '🛰️',
          iconColor: '#38bdf8',
          image: '/images/banners/banner1.jpg',
          description: '统一监控边缘/混合架构，覆盖服务器、网络与安全容量规划。',
          imageDescription: '运维大屏展示机房拓扑、实时告警与资源利用率。'
        },
        {
          id: 'security',
          label: '安全运营',
          title: '网络安全管控',
          icon: '🛡️',
          iconColor: '#a855f7',
          image: '/images/banners/banner2.jpg',
          description: '融合威胁情报、态势感知与自动化响应，为企业构建端到端安全体系。',
          imageDescription: '安全运营中心面板展示威胁检测、阻断与响应流程。'
        },
        {
          id: 'service',
          label: '技术服务',
          title: '全栈技术支持',
          icon: '🧠',
          iconColor: '#f97316',
          image: '/images/hero-bg.jpg',
          description: '团队提供咨询、迁移与托管服务，保障业务稳定持续上线。',
          imageDescription: '项目交付看板展示 SLA、服务动作与客户满意度。'
        }
      ]
    },
    editableFields: [
      {
        key: 'imagePosition',
        label: '图片位置',
        type: 'text',
        value: 'right',
        options: [
          { label: '右侧图片', value: 'right' },
          { label: '左侧图片', value: 'left' }
        ]
      },
      {
        key: 'widthOption',
        label: '宽度设置',
        type: 'text',
        value: 'full',
        options: [
          { label: '全宽', value: 'full' },
          { label: '标准宽度', value: 'standard' }
        ]
      },
      {
        key: 'backgroundColorOption',
        label: '背景',
        type: 'text',
        value: 'default',
        options: [
          { label: '默认背景', value: 'default' },
          { label: '透明背景', value: 'transparent' }
        ]
      },
      {
        key: 'controls',
        label: '按钮与展示图片',
        type: 'array',
        value: [],
        subFields: [
          { key: 'title', label: '展示标题', type: 'text', value: '' },
          { key: 'label', label: '按钮文字', type: 'text', value: '' },
          { key: 'description', label: '展示描述', type: 'textarea', value: '' },
          { key: 'icon', label: '按钮图标', type: 'text', value: '' },
          { key: 'iconColor', label: '图标颜色', type: 'text', value: '#60a5fa' },
          { key: 'image', label: '图片 URL', type: 'image', value: '' },
          { key: 'imageDescription', label: '图片描述（可选）', type: 'textarea', value: '' }
        ]
      }
    ],
    previewComponent: CyberShowcasePreview
  },
  {
    type: 'cyber-super-card',
    name: '赛博超级卡片',
    description: '带全局控制的炫彩卡片组合，支持默认图标或大图模式。',
    icon: '🧬',
    category: '赛博组件',
    defaultProps: {
      widthOption: 'full',
      backgroundColorOption: 'default',
      cardsPerRow: 3,
      layoutMode: 'default',
      visualMode: 'icon',
      alignment: 'left',
      hoverEffect: true,
      flowingLight: true,
      iconFrame: true,
      cards: [
        {
          id: 'vision',
          title: '幻觉控制和优化',
          description: '通过召回得分设置和应答策略选择，可有效控制 LLM 带来的幻觉影响，守住内容可信度。',
          icon: '/system-default/icons/ai-vision.svg',
          iconColor: '#0ea5e9',
          image: '/images/banners/banner1.jpg',
          tags: [
            { label: 'LLM 策略', highlighted: true },
            { label: '推理守卫' }
          ],
          link: ''
        },
        {
          id: 'context',
          title: '上下文守护',
          description: '自动注入安全上下文与审计提示，保障跨业务场景的回答合规，减少人工覆核成本。',
          icon: '/system-default/icons/context-shield.svg',
          iconColor: '#a855f7',
          image: '/images/banners/banner2.jpg',
          tags: [
            { label: '安全沙箱' },
            { label: '动态提示', highlighted: true }
          ],
          link: ''
        },
        {
          id: 'insight',
          title: '智能洞察面板',
          description: '实时监控用户反馈、性能指标与对话热点，异常数据将被高亮并推送治理建议。',
          icon: '/system-default/icons/insight-gauge.svg',
          iconColor: '#22d3ee',
          image: '/images/hero-bg.jpg',
          tags: [
            { label: '实时监控' },
            { label: '绿色通道', highlighted: true }
          ],
          link: ''
        }
      ]
    },
    editableFields: [
      {
        key: 'cardsPerRow',
        label: '单行卡片数',
        type: 'text',
        value: '3',
        options: [
          { label: '1', value: '1' },
          { label: '2', value: '2' },
          { label: '3', value: '3' },
          { label: '4', value: '4' },
          { label: '5', value: '5' },
          { label: '6', value: '6' }
        ]
      },
      {
        key: 'layoutMode',
        label: '卡片布局',
        type: 'text',
        value: 'default',
        options: [
          { label: '默认模式', value: 'default' },
          { label: '无边距模式', value: 'tight' }
        ]
      },
      {
        key: 'visualMode',
        label: '图标模式',
        type: 'text',
        value: 'icon',
        options: [
          { label: '默认图标', value: 'icon' },
          { label: '大图模式', value: 'image' }
        ]
      },
      {
        key: 'alignment',
        label: '对齐方式',
        type: 'text',
        value: 'left',
        options: [
          { label: '左对齐', value: 'left' },
          { label: '居中', value: 'center' },
          { label: '右对齐', value: 'right' }
        ]
      },
      {
        key: 'hoverEffect',
        label: '悬停特效',
        type: 'text',
        value: 'true',
        options: [
          { label: '启用', value: 'true' },
          { label: '关闭', value: 'false' }
        ]
      },
      {
        key: 'flowingLight',
        label: '卡片流光',
        type: 'text',
        value: 'true',
        options: [
          { label: '启用', value: 'true' },
          { label: '关闭', value: 'false' }
        ]
      },
      {
        key: 'iconFrame',
        label: '图标边框',
        type: 'text',
        value: 'true',
        options: [
          { label: '启用', value: 'true' },
          { label: '关闭', value: 'false' }
        ]
      },
      {
        key: 'widthOption',
        label: '宽度设置',
        type: 'text',
        value: 'full',
        options: [
          { label: '全宽', value: 'full' },
          { label: '标准宽度', value: 'standard' }
        ]
      },
      {
        key: 'backgroundColorOption',
        label: '背景',
        type: 'text',
        value: 'default',
        options: [
          { label: '默认背景', value: 'default' },
          { label: '透明背景', value: 'transparent' }
        ]
      },
      {
        key: 'cards',
        label: '卡片内容',
        type: 'array',
        value: [],
        subFields: [
          { key: 'title', label: '标题', type: 'text', value: '' },
          { key: 'description', label: '描述', type: 'textarea', value: '' },
          { key: 'icon', label: '图标/图片', type: 'text', value: '' },
          { key: 'iconColor', label: '图标颜色', type: 'text', value: '' },
          { key: 'image', label: '大图', type: 'image', value: '' },
          { key: 'tags', label: '标签', type: 'text', value: '' },
          { key: 'link', label: '链接', type: 'link', value: '' }
        ]
      }
    ],
    previewComponent: CyberSuperCardPreview
  }
]
