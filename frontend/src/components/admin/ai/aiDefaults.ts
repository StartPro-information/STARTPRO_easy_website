export type AiSettings = {
  provider: string
  api_base: string
  api_key: string
  model: string
  temperature: number
  max_tokens: number
  top_p: number
  enabled: boolean
}

export type AiTemplate = {
  id?: number
  component_type: string
  template_name: string
  template_type: string
  prompt_template: string
  output_schema?: any
  is_default: number
  enabled: number
}

export const DEFAULT_SETTINGS: AiSettings = {
  provider: 'openai',
  api_base: '',
  api_key: '',
  model: '',
  temperature: 0.7,
  max_tokens: 800,
  top_p: 1.0,
  enabled: true
}

export const DEFAULT_TEMPLATES: AiTemplate[] = [
  {
    component_type: 'text-block',
    template_name: '默认文本区块',
    template_type: 'generate_props',
    prompt_template:
      '你是内容写作助手。请根据用户需求生成文本区块内容，只返回 JSON，不要额外解释。\n' +
      '组件字段：title, content\n' +
      '用户需求：{{user_prompt}}\n' +
      '当前内容：{{current_props}}\n' +
      '输出 JSON 示例：{"title":"...","content":"..."}',
    output_schema: { title: 'string', content: 'string' },
    is_default: 1,
    enabled: 1
  },
  {
    component_type: 'faq-section',
    template_name: '默认FAQ',
    template_type: 'generate_props',
    prompt_template:
      '你是FAQ内容助手。根据需求生成FAQ，返回 JSON，不要额外解释。\n' +
      '字段：title, subtitle, faqs(数组，每项包含 question, answer)\n' +
      '用户需求：{{user_prompt}}\n' +
      '当前内容：{{current_props}}\n' +
      '输出 JSON 示例：{"title":"...","subtitle":"...","faqs":[{"question":"...","answer":"..."}]}',
    output_schema: { title: 'string', subtitle: 'string', faqs: [{ question: 'string', answer: 'string' }] },
    is_default: 1,
    enabled: 1
  },
  {
    component_type: 'image-text',
    template_name: '默认图文(上下)',
    template_type: 'generate_props',
    prompt_template:
      '你是内容写作助手。生成图文展示(上下)内容，只返回 JSON。\n' +
      '字段：title, description\n' +
      '用户需求：{{user_prompt}}\n' +
      '当前内容：{{current_props}}\n' +
      '输出 JSON 示例：{"title":"...","description":"..."}',
    output_schema: { title: 'string', description: 'string' },
    is_default: 1,
    enabled: 1
  },
  {
    component_type: 'image-text-horizontal',
    template_name: '默认图文(左右)',
    template_type: 'generate_props',
    prompt_template:
      '你是内容写作助手。生成图文展示(左右)内容，只返回 JSON。\n' +
      '字段：title, description\n' +
      '用户需求：{{user_prompt}}\n' +
      '当前内容：{{current_props}}\n' +
      '输出 JSON 示例：{"title":"...","description":"..."}',
    output_schema: { title: 'string', description: 'string' },
    is_default: 1,
    enabled: 1
  },
  {
    component_type: 'feature-grid',
    template_name: '默认功能网格',
    template_type: 'generate_props',
    prompt_template:
      '你是产品文案助手。生成功能网格内容，只返回 JSON。\n' +
      '字段：title, subtitle, features(数组，每项包含 title, description)\n' +
      '不要改动 icon/link 字段，仅输出标题与描述。\n' +
      '用户需求：{{user_prompt}}\n' +
      '当前内容：{{current_props}}\n' +
      '输出 JSON 示例：{"title":"...","subtitle":"...","features":[{"title":"...","description":"..."}]}',
    output_schema: { title: 'string', subtitle: 'string', features: [{ title: 'string', description: 'string' }] },
    is_default: 1,
    enabled: 1
  },
  {
    component_type: 'feature-grid-large',
    template_name: '默认功能网格-大图',
    template_type: 'generate_props',
    prompt_template:
      '你是产品文案助手。生成大图功能网格内容，只返回 JSON。\n' +
      '字段：title, subtitle, features(数组，每项包含 title, description)\n' +
      '不要改动 icon/link 字段，仅输出标题与描述。\n' +
      '用户需求：{{user_prompt}}\n' +
      '当前内容：{{current_props}}\n' +
      '输出 JSON 示例：{"title":"...","subtitle":"...","features":[{"title":"...","description":"..."}]}',
    output_schema: { title: 'string', subtitle: 'string', features: [{ title: 'string', description: 'string' }] },
    is_default: 1,
    enabled: 1
  },
  {
    component_type: 'timeline',
    template_name: '默认时间轴',
    template_type: 'generate_props',
    prompt_template:
      '你是时间轴内容助手。生成时间轴内容，只返回 JSON。\n' +
      '字段：title, subtitle, events(数组，每项包含 date, title, description)\n' +
      '用户需求：{{user_prompt}}\n' +
      '当前内容：{{current_props}}\n' +
      '输出 JSON 示例：{"title":"...","subtitle":"...","events":[{"date":"...","title":"...","description":"..."}]}',
    output_schema: { title: 'string', subtitle: 'string', events: [{ date: 'string', title: 'string', description: 'string' }] },
    is_default: 1,
    enabled: 1
  },
  {
    component_type: 'testimonials',
    template_name: '默认客户评价',
    template_type: 'generate_props',
    prompt_template:
      '你是客户评价内容助手。生成评价列表，只返回 JSON。\n' +
      '字段：title, subtitle, testimonials(数组，每项包含 name, role, content, rating)\n' +
      '用户需求：{{user_prompt}}\n' +
      '当前内容：{{current_props}}\n' +
      '输出 JSON 示例：{"title":"...","subtitle":"...","testimonials":[{"name":"...","role":"...","content":"...","rating":5}]}',
    output_schema: { title: 'string', subtitle: 'string', testimonials: [{ name: 'string', role: 'string', content: 'string', rating: 'number' }] },
    is_default: 1,
    enabled: 1
  },
  {
    component_type: 'news-list',
    template_name: '默认新闻列表',
    template_type: 'generate_props',
    prompt_template:
      '你是新闻摘要助手。生成新闻列表，只返回 JSON。\n' +
      '字段：title, subtitle, articles(数组，每项包含 title, summary, date, link)\n' +
      '不要改动 image 字段，仅输出标题摘要与链接。\n' +
      '用户需求：{{user_prompt}}\n' +
      '当前内容：{{current_props}}\n' +
      '输出 JSON 示例：{"title":"...","subtitle":"...","articles":[{"title":"...","summary":"...","date":"2025-01-01","link":"/news/..."}]}',
    output_schema: { title: 'string', subtitle: 'string', articles: [{ title: 'string', summary: 'string', date: 'string', link: 'string' }] },
    is_default: 1,
    enabled: 1
  },
  {
    component_type: 'cyber-timeline',
    template_name: '默认赛博时间线',
    template_type: 'generate_props',
    prompt_template:
      '你是赛博时间线助手。生成赛博时间线内容，只返回 JSON。\n' +
      '字段：title, subtitle, events(数组，每项包含 phase, date, title, description, tags)\n' +
      'tags 为数组，每项包含 label, highlighted(布尔)\n' +
      '用户需求：{{user_prompt}}\n' +
      '当前内容：{{current_props}}\n' +
      '输出 JSON 示例：{"title":"...","subtitle":"...","events":[{"phase":"Phase 01","date":"T0-T3","title":"...","description":"...","tags":[{"label":"...","highlighted":true}]}]}',
    output_schema: { title: 'string', subtitle: 'string', events: [{ phase: 'string', date: 'string', title: 'string', description: 'string', tags: [{ label: 'string', highlighted: 'boolean' }] }] },
    is_default: 1,
    enabled: 1
  },
  {
    component_type: 'cyber-showcase',
    template_name: '默认赛博展示面板',
    template_type: 'generate_props',
    prompt_template:
      '你是赛博展示面板助手。生成展示面板内容，只返回 JSON。\n' +
      '字段：controls(数组，每项包含 id, label, title, description, imageDescription)\n' +
      '不要改动 icon/image/iconColor 字段，仅输出文字。\n' +
      '用户需求：{{user_prompt}}\n' +
      '当前内容：{{current_props}}\n' +
      '输出 JSON 示例：{"controls":[{"id":"item1","label":"...","title":"...","description":"...","imageDescription":"..."}]}',
    output_schema: { controls: [{ id: 'string', label: 'string', title: 'string', description: 'string', imageDescription: 'string' }] },
    is_default: 1,
    enabled: 1
  },
  {
    component_type: 'cyber-super-card',
    template_name: '默认赛博超级卡片',
    template_type: 'generate_props',
    prompt_template:
      '你是赛博卡片助手。生成超级卡片内容，只返回 JSON。\n' +
      '字段：cards(数组，每项包含 id, title, description, tags)\n' +
      'tags 为数组，每项包含 label, highlighted(布尔)\n' +
      '不要改动 icon/image/iconColor/link 字段，仅输出文字。\n' +
      '用户需求：{{user_prompt}}\n' +
      '当前内容：{{current_props}}\n' +
      '输出 JSON 示例：{"cards":[{"id":"card1","title":"...","description":"...","tags":[{"label":"...","highlighted":true}]}]}',
    output_schema: { cards: [{ id: 'string', title: 'string', description: 'string', tags: [{ label: 'string', highlighted: 'boolean' }] }] },
    is_default: 1,
    enabled: 1
  },
  {
    component_type: 'raw-html',
    template_name: '默认自定义HTML',
    template_type: 'generate_props',
    prompt_template:
      '你是HTML内容助手。根据需求生成一段HTML片段，只返回 JSON。\n' +
      '字段：html\n' +
      '用户需求：{{user_prompt}}\n' +
      '当前内容：{{current_props}}\n' +
      '输出 JSON 示例：{"html":"<p>...</p>"}',
    output_schema: { html: 'string' },
    is_default: 1,
    enabled: 1
  },
  {
    component_type: 'hero',
    template_name: '默认英雄区块',
    template_type: 'generate_props',
    prompt_template:
      '你是页面文案助手。生成英雄区块文案，只返回 JSON。\n' +
      '字段：title, subtitle, buttonText, buttonLink\n' +
      '不要改动背景图与颜色字段。\n' +
      '用户需求：{{user_prompt}}\n' +
      '当前内容：{{current_props}}\n' +
      '输出 JSON 示例：{"title":"...","subtitle":"...","buttonText":"...","buttonLink":"#"}',
    output_schema: { title: 'string', subtitle: 'string', buttonText: 'string', buttonLink: 'string' },
    is_default: 1,
    enabled: 1
  },
  {
    component_type: 'image-block',
    template_name: '默认图片区块',
    template_type: 'generate_props',
    prompt_template:
      '你是图片文案助手。生成图片描述文案，只返回 JSON。\n' +
      '字段：alt, caption\n' +
      '不要改动 src/link 字段。\n' +
      '用户需求：{{user_prompt}}\n' +
      '当前内容：{{current_props}}\n' +
      '输出 JSON 示例：{"alt":"...","caption":"..."}',
    output_schema: { alt: 'string', caption: 'string' },
    is_default: 1,
    enabled: 1
  },
  {
    component_type: 'banner-carousel',
    template_name: '默认横幅轮播图',
    template_type: 'generate_props',
    prompt_template:
      '你是轮播图文案助手。生成轮播图文案，只返回 JSON。\n' +
      '字段：title, subtitle, slides(数组，每项包含 title, description, buttonText, buttonLink)\n' +
      '不要改动 slides 的 image 字段。\n' +
      '用户需求：{{user_prompt}}\n' +
      '当前内容：{{current_props}}\n' +
      '输出 JSON 示例：{"title":"...","subtitle":"...","slides":[{"title":"...","description":"...","buttonText":"...","buttonLink":"#"}]}',
    output_schema: {
      title: 'string',
      subtitle: 'string',
      slides: [{ title: 'string', description: 'string', buttonText: 'string', buttonLink: 'string' }]
    },
    is_default: 1,
    enabled: 1
  },
  {
    component_type: 'logo-wall',
    template_name: '默认Logo墙',
    template_type: 'generate_props',
    prompt_template:
      '你是页面文案助手。生成Logo墙标题文案，只返回 JSON。\n' +
      '字段：title, subtitle\n' +
      '不要改动 logos 数组。\n' +
      '用户需求：{{user_prompt}}\n' +
      '当前内容：{{current_props}}\n' +
      '输出 JSON 示例：{"title":"...","subtitle":"..."}',
    output_schema: { title: 'string', subtitle: 'string' },
    is_default: 1,
    enabled: 1
  },
  {
    component_type: 'logo-scroll',
    template_name: '默认Logo滚动',
    template_type: 'generate_props',
    prompt_template:
      '你是页面文案助手。生成Logo滚动标题文案，只返回 JSON。\n' +
      '字段：title, subtitle\n' +
      '不要改动 logos 数组。\n' +
      '用户需求：{{user_prompt}}\n' +
      '当前内容：{{current_props}}\n' +
      '输出 JSON 示例：{"title":"...","subtitle":"..."}',
    output_schema: { title: 'string', subtitle: 'string' },
    is_default: 1,
    enabled: 1
  },
  {
    component_type: 'contact-form',
    template_name: '默认联系表单',
    template_type: 'generate_props',
    prompt_template:
      '你是表单文案助手。生成联系表单标题与副标题，只返回 JSON。\n' +
      '字段：title, subtitle\n' +
      '不要改动 fields 数组。\n' +
      '用户需求：{{user_prompt}}\n' +
      '当前内容：{{current_props}}\n' +
      '输出 JSON 示例：{"title":"...","subtitle":"..."}',
    output_schema: { title: 'string', subtitle: 'string' },
    is_default: 1,
    enabled: 1
  },
  {
    component_type: 'call-to-action',
    template_name: '默认行动号召',
    template_type: 'generate_props',
    prompt_template:
      '你是行动号召文案助手。生成 CTA 文案，只返回 JSON。\n' +
      '字段：title, subtitle, buttonText, buttonLink\n' +
      '用户需求：{{user_prompt}}\n' +
      '当前内容：{{current_props}}\n' +
      '输出 JSON 示例：{"title":"...","subtitle":"...","buttonText":"...","buttonLink":"#"}',
    output_schema: { title: 'string', subtitle: 'string', buttonText: 'string', buttonLink: 'string' },
    is_default: 1,
    enabled: 1
  },
  {
    component_type: 'link-block',
    template_name: '默认链接区块',
    template_type: 'generate_props',
    prompt_template:
      '你是链接区块助手。生成链接列表，只返回 JSON。\n' +
      '字段：title, links(数组，每项包含 text, url)\n' +
      '用户需求：{{user_prompt}}\n' +
      '当前内容：{{current_props}}\n' +
      '输出 JSON 示例：{"title":"...","links":[{"text":"...","url":"https://example.com"}]}',
    output_schema: { title: 'string', links: [{ text: 'string', url: 'string' }] },
    is_default: 1,
    enabled: 1
  },
  {
    component_type: 'table',
    template_name: '默认表格',
    template_type: 'generate_props',
    prompt_template:
      '你是表格内容助手。生成表格列与行，只返回 JSON。\n' +
      '字段：title, columns(数组: key,label,align), rows(数组: 对应 key 的值)\n' +
      '用户需求：{{user_prompt}}\n' +
      '当前内容：{{current_props}}\n' +
      '输出 JSON 示例：{"title":"...","columns":[{"key":"col1","label":"列1","align":"left"}],"rows":[{"col1":"值"}]}',
    output_schema: {
      title: 'string',
      columns: [{ key: 'string', label: 'string', align: 'string' }],
      rows: [{ any: 'string' }]
    },
    is_default: 1,
    enabled: 1
  },
  {
    component_type: 'pricing-cards',
    template_name: '默认价格方案',
    template_type: 'generate_props',
    prompt_template:
      '你是定价文案助手。生成价格方案列表，只返回 JSON。\n' +
      '字段：title, subtitle, plans(数组: name, price, period, features, recommended)\n' +
      '用户需求：{{user_prompt}}\n' +
      '当前内容：{{current_props}}\n' +
      '输出 JSON 示例：{"title":"...","subtitle":"...","plans":[{"name":"...","price":"99","period":"每月","features":["..."],"recommended":false}]}',
    output_schema: { title: 'string', subtitle: 'string', plans: [{ name: 'string', price: 'string', period: 'string', features: ['string'], recommended: 'boolean' }] },
    is_default: 1,
    enabled: 1
  },
  {
    component_type: 'team-grid',
    template_name: '默认团队展示',
    template_type: 'generate_props',
    prompt_template:
      '你是团队介绍助手。生成团队成员列表，只返回 JSON。\n' +
      '字段：title, subtitle, members(数组: name, role, bio)\n' +
      '不要改动 avatar 字段。\n' +
      '用户需求：{{user_prompt}}\n' +
      '当前内容：{{current_props}}\n' +
      '输出 JSON 示例：{"title":"...","subtitle":"...","members":[{"name":"...","role":"...","bio":"..."}]}',
    output_schema: { title: 'string', subtitle: 'string', members: [{ name: 'string', role: 'string', bio: 'string' }] },
    is_default: 1,
    enabled: 1
  },
  {
    component_type: 'stats-section',
    template_name: '默认统计数据',
    template_type: 'generate_props',
    prompt_template:
      '你是统计数据助手。生成统计数据内容，只返回 JSON。\n' +
      '字段：title, subtitle, stats(数组: label, value)\n' +
      '不要改动 icon 字段。\n' +
      '用户需求：{{user_prompt}}\n' +
      '当前内容：{{current_props}}\n' +
      '输出 JSON 示例：{"title":"...","subtitle":"...","stats":[{"label":"...","value":"..."}]}',
    output_schema: { title: 'string', subtitle: 'string', stats: [{ label: 'string', value: 'string' }] },
    is_default: 1,
    enabled: 1
  },
  {
    component_type: 'product-showcase-card',
    template_name: '默认商品展示卡片',
    template_type: 'generate_props',
    prompt_template:
      '你是商品展示文案助手。生成商品卡片文案，只返回 JSON。\n' +
      '字段：cards(数组: eyebrow, title, subtitle, badgeText, primaryButtonText, primaryButtonLink, secondaryButtonText, secondaryButtonLink)\n' +
      '不要改动 image 字段。\n' +
      '用户需求：{{user_prompt}}\n' +
      '当前内容：{{current_props}}\n' +
      '输出 JSON 示例：{"cards":[{"eyebrow":"...","title":"...","subtitle":"...","badgeText":"...","primaryButtonText":"...","primaryButtonLink":"#","secondaryButtonText":"...","secondaryButtonLink":"#"}]}',
    output_schema: {
      cards: [
        {
          eyebrow: 'string',
          title: 'string',
          subtitle: 'string',
          badgeText: 'string',
          primaryButtonText: 'string',
          primaryButtonLink: 'string',
          secondaryButtonText: 'string',
          secondaryButtonLink: 'string'
        }
      ]
    },
    is_default: 1,
    enabled: 1
  },
  {
    component_type: 'video-player',
    template_name: '默认视频组件',
    template_type: 'generate_props',
    prompt_template:
      '你是视频文案助手。生成视频组件标题与描述，只返回 JSON。\n' +
      '字段：title, description\n' +
      '不要改动 videoUrl/poster 字段。\n' +
      '用户需求：{{user_prompt}}\n' +
      '当前内容：{{current_props}}\n' +
      '输出 JSON 示例：{"title":"...","description":"..."}',
    output_schema: { title: 'string', description: 'string' },
    is_default: 1,
    enabled: 1
  }
]
