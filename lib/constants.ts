// 常量定义

export const PLATFORMS = {
  wechat: { name: '微信公众号', icon: 'MessageCircle', color: '#07C160' },
  zhihu: { name: '知乎', icon: 'HelpCircle', color: '#0084FF' },
  xiaohongshu: { name: '小红书', icon: 'Heart', color: '#FE2C55' },
  manual: { name: '手动导入', icon: 'FileText', color: '#6B7280' },
} as const;

export const MATERIAL_TYPES = {
  quote: { name: '金句', icon: 'Quote', color: '#F59E0B' },
  case: { name: '案例', icon: 'Briefcase', color: '#10B981' },
  data: { name: '数据', icon: 'BarChart', color: '#3B82F6' },
  viewpoint: { name: '观点', icon: 'Lightbulb', color: '#8B5CF6' },
  story: { name: '故事', icon: 'BookOpen', color: '#EC4899' },
} as const;

export const TASK_STATUS = {
  pending: { name: '等待中', color: '#9CA3AF' },
  processing: { name: '处理中', color: '#3B82F6' },
  completed: { name: '已完成', color: '#10B981' },
  failed: { name: '失败', color: '#EF4444' },
} as const;