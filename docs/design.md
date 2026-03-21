# MyClawNote - 个人专属知识管理工具 设计文档

> 创建时间: 2026-03-21
> 状态: 已确认

## 1. 产品概览

### 1.1 定位
基于 OpenClaw 的个人专属私有化 Web 端知识管理工具，实现内容一键抓取、AI 深度结构化处理、个性化知识体系搭建。

### 1.2 核心价值
- 解决跨平台内容碎片化问题
- AI 驱动的深度内容提纯
- 知识自动关联形成体系
- 私有化永久存档

## 2. 技术选型

| 项目 | 选择 | 理由 |
|------|------|------|
| 框架 | Next.js 14 | 全栈开发，API Routes 支持后端逻辑 |
| 前端 | React 18 + Tailwind CSS | 现代化 UI 开发体验 |
| 状态管理 | Zustand | 轻量级，适合中等复杂度 |
| 数据库 | SQLite (better-sqlite3) | 零配置，适合个人使用 |
| AI 能力 | OpenClaw HTTP 接口 | 复用现有服务 |
| 抓取 | RSSHub + Playwright | 混合方案，覆盖三大平台 |
| 图谱可视化 | React Flow / D3.js | 知识关联可视化 |

## 3. 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js 全栈应用                        │
├─────────────────────────────────────────────────────────────┤
│  前端层 (React + Tailwind)                                   │
│  ├── 页面：首页 / 抓取 / 笔记 / 知识图谱 / 素材库 / 设置      │
│  ├── 组件：富文本编辑器 / 知识图谱可视化 / 规则引擎配置       │
│  └── 状态：Zustand / React Query                             │
├─────────────────────────────────────────────────────────────┤
│  API 层 (Next.js API Routes)                                 │
│  ├── /api/notes - 笔记 CRUD                                  │
│  ├── /api/capture - 内容抓取                                 │
│  ├── /api/ai - AI 处理（调用 OpenClaw）                      │
│  ├── /api/materials - 素材库                                 │
│  └── /api/rules - 规则引擎                                   │
├─────────────────────────────────────────────────────────────┤
│  服务层                                                      │
│  ├── CaptureService - 抓取服务（RSSHub/Playwright）          │
│  ├── AIService - AI 处理（摘要/关键词/关联）                 │
│  ├── RuleEngine - 规则引擎执行                               │
│  └── SnapshotService - 快照存档                              │
├─────────────────────────────────────────────────────────────┤
│  数据层                                                      │
│  ├── SQLite (better-sqlite3) - 笔记/素材/规则/元数据         │
│  └── 文件系统 - 快照/备份/导出文件                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │    OpenClaw     │
                    │  (AI 能力服务)   │
                    └─────────────────┘
```

## 4. 数据模型

### 4.1 笔记 (notes)
```sql
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,           -- 结构化内容 JSON
  summary TEXT,           -- AI 生成的摘要
  source_url TEXT,        -- 原文链接
  source_platform TEXT,   -- wechat/zhihu/xiaohongshu/manual
  snapshot_path TEXT,     -- 快照文件路径
  category_id TEXT,
  tags TEXT,              -- JSON 数组
  keywords TEXT,          -- JSON 数组
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT 0
);
```

### 4.2 分类 (categories)
```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.3 素材 (materials)
```sql
CREATE TABLE materials (
  id TEXT PRIMARY KEY,
  type TEXT,              -- quote/case/data/viewpoint/story
  content TEXT NOT NULL,
  source_note_id TEXT,
  tags TEXT,
  use_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.4 规则 (rules)
```sql
CREATE TABLE rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  trigger TEXT,           -- JSON 触发条件
  actions TEXT,           -- JSON 数组 执行动作列表
  output_template TEXT,   -- 输出模板
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.5 知识关联 (relations)
```sql
CREATE TABLE relations (
  id TEXT PRIMARY KEY,
  note_id_a TEXT NOT NULL,
  note_id_b TEXT NOT NULL,
  relation_type TEXT,     -- similar/reference/extend
  similarity_score REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.6 抓取任务 (capture_tasks)
```sql
CREATE TABLE capture_tasks (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  platform TEXT,
  status TEXT,            -- pending/processing/completed/failed
  result_note_id TEXT,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);
```

## 5. 核心模块设计

### 5.1 抓取服务 (CaptureService)

#### 流程图
```
用户提交 URL
      │
      ▼
平台识别 (域名判断)
      │
      ▼
┌─────────────┐     失败      ┌─────────────┐     失败      ┌─────────────┐
│ RSSHub 抓取 │ ─────────────▶│ Playwright  │ ─────────────▶│ 手动导入    │
└─────────────┘               └─────────────┘               └─────────────┘
      │ 成功                        │ 成功
      └──────────────┬─────────────┘
                      ▼
              内容解析 → 快照存档 → AI 结构化 → 规则引擎 → 入库保存
```

#### 平台支持
| 平台 | RSSHub 路由 | Playwright 备选 |
|------|-------------|-----------------|
| 微信公众号 | `/wechat/mp/msgalbum/{biz}/{hid}` | 需要 Cookie |
| 知乎 | `/zhihu/answer/{id}` | 支持登录态 |
| 小红书 | 暂不支持 | 需要 Cookie |

### 5.2 AI 服务 (AIService)

#### 接口设计
```typescript
interface AIService {
  // 摘要生成
  summarize(content: string): Promise<string>;
  
  // 关键词提取
  extractKeywords(content: string): Promise<string[]>;
  
  // 内容降噪
  denoise(content: string, rules?: NoiseRule[]): Promise<string>;
  
  // 语义关联
  findRelated(noteId: string, allNotes: Note[]): Promise<Relation[]>;
  
  // 素材提取
  extractMaterials(content: string): Promise<Material[]>;
  
  // 执行自定义规则
  executeRule(content: string, rule: Rule): Promise<ProcessResult>;
}
```

#### OpenClaw 调用方式
```typescript
// 通过 sessions_spawn 调用 OpenClaw AI 能力
const response = await fetch('http://localhost:3000/api/ai/process', {
  method: 'POST',
  body: JSON.stringify({
    task: 'summarize',
    content: noteContent,
    options: { maxLength: 300 }
  })
});
```

### 5.3 规则引擎 (RuleEngine)

#### 规则结构
```typescript
interface Rule {
  id: string;
  name: string;
  trigger: {
    platform?: string;      // 触发平台
    type?: string;          // 内容类型
    keywords?: string[];    // 关键词匹配
  };
  actions: Action[];
  output: {
    category?: string;
    tags?: string[];
    template?: string;
  };
}

interface Action {
  type: 'denoise' | 'extract' | 'generate' | 'transform';
  options: Record<string, any>;
}
```

#### 规则示例
```typescript
const zhihuRule: Rule = {
  name: "知乎回答处理",
  trigger: { platform: "zhihu", type: "answer" },
  actions: [
    { type: "denoise", options: { removeAds: true, removeWatermark: true } },
    { type: "extract", options: { fields: ["arguments", "cases"] } },
    { type: "generate", options: { template: "金句", count: 3 } }
  ],
  output: {
    category: "知乎精选",
    tags: ["知乎", "待整理"]
  }
};
```

### 5.4 快照服务 (SnapshotService)

#### 存储结构
```
snapshots/
├── {note_id}/
│   ├── original.html      # 原始 HTML
│   ├── metadata.json      # 元数据
│   └── assets/            # 图片等资源
│       ├── image1.jpg
│       └── image2.png
```

#### 元数据格式
```json
{
  "url": "https://...",
  "title": "原文标题",
  "author": "作者",
  "publishTime": "2026-03-21T10:00:00Z",
  "captureTime": "2026-03-21T11:00:00Z",
  "platform": "zhihu",
  "wordCount": 3000
}
```

## 6. 前端页面设计

### 6.1 路由结构
```
/                      # 首页仪表盘
/capture               # 抓取页面
/notes                 # 笔记列表
/notes/[id]            # 笔记详情/编辑
/graph                 # 知识图谱
/materials             # 素材库
/rules                 # 规则引擎
/settings              # 设置
/snapshot/[id]         # 快照查看
```

### 6.2 核心页面功能

#### 首页仪表盘
- 最近抓取的笔记（5条）
- 待处理任务数
- 知识图谱预览（简化版）
- 快速抓取入口

#### 抓取页面
- 单链接抓取输入框
- 批量链接导入（textarea）
- 抓取任务进度展示
- 支持平台说明

#### 笔记列表
- 左侧：分类树形导航
- 右侧：笔记卡片列表
- 顶部：搜索栏 + 筛选器
- 支持：全文检索、标签筛选、时间排序

#### 笔记详情
- 阅读模式 / 编辑模式切换
- 富文本编辑器
- 关联笔记推荐
- 素材推荐插入
- 快照对比查看

#### 知识图谱
- 力导向图展示知识关联
- 节点大小 = 关联数量
- 点击节点跳转笔记
- 支持筛选特定分类

#### 素材库
- 按类型分组：金句/案例/数据/观点/故事
- 搜索 + 标签筛选
- 一键复制/插入笔记
- 显示来源笔记

#### 规则引擎
- 规则列表（启用/禁用）
- 可视化规则编辑器
- 规则模板库
- 执行测试预览

#### 设置
- 分类管理（增删改、拖拽排序）
- 标签管理
- 数据备份/恢复
- 导出设置

## 7. 功能清单

### 7.1 基础核心功能
- [x] 多平台内容抓取（微信/知乎/小红书）
- [x] AI 结构化笔记生成
- [x] 富文本笔记编辑
- [x] 内容去重检测
- [x] 分类管理
- [x] 标签管理
- [x] 全文检索
- [x] 多格式导出（MD/PDF/TXT）
- [x] 回收站机制
- [x] 数据备份恢复

### 7.2 差异化功能
- [x] 知识关联自动生成
- [x] 知识图谱可视化
- [x] 低代码规则引擎
- [x] 私有化快照存档
- [x] 素材库自动提取
- [x] 智能素材推荐
- [x] 内容降噪处理
- [x] 干货提纯

## 8. 部署方案

### 8.1 开发环境
```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 数据库初始化
pnpm db:init
```

### 8.2 生产部署
```bash
# 构建
pnpm build

# 启动（使用 PM2）
pm2 start npm --name "myclawnote" -- start

# Nginx 反向代理配置
server {
    listen 3004;
    location / {
        proxy_pass http://127.0.0.1:3000;
    }
}
```

### 8.3 端口规划
- MyClawNote: 3004

## 9. 风险与应对

| 风险 | 应对措施 |
|------|----------|
| 平台反爬升级 | 保留手动导入兜底 |
| AI 处理效果不佳 | 支持手动编辑修正 |
| 数据丢失 | 自动备份 + 手动备份 |

## 10. 开发计划

### Phase 1: 基础框架（Day 1-2）
- Next.js 项目初始化
- 数据库设计与初始化
- 基础 UI 框架搭建

### Phase 2: 核心功能（Day 3-5）
- 抓取服务实现
- AI 服务集成
- 笔记 CRUD

### Phase 3: 管理功能（Day 6-7）
- 分类标签管理
- 搜索功能
- 导出功能

### Phase 4: 高级功能（Day 8-10）
- 知识图谱
- 规则引擎
- 素材库

### Phase 5: 优化与测试（Day 11-12）
- 性能优化
- 功能测试
- 部署上线