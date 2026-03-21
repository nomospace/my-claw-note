# MyClawNote 全量实现计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建完整的个人知识管理工具，实现内容抓取、AI 结构化、知识图谱、规则引擎、素材库等全量功能。

**Architecture:** Next.js 14 全栈应用，SQLite 数据库，OpenClaw 提供 AI 能力，RSSHub + Playwright 实现内容抓取。

**Tech Stack:** Next.js 14, React 18, Tailwind CSS, SQLite, Zustand, React Flow, TipTap

---

## 文件结构

```
myclawnote/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 根布局
│   ├── page.tsx                  # 首页仪表盘
│   ├── capture/
│   │   └── page.tsx              # 抓取页面
│   ├── notes/
│   │   ├── page.tsx              # 笔记列表
│   │   └── [id]/
│   │       └── page.tsx          # 笔记详情
│   ├── graph/
│   │   └── page.tsx              # 知识图谱
│   ├── materials/
│   │   └── page.tsx              # 素材库
│   ├── rules/
│   │   └── page.tsx              # 规则引擎
│   ├── settings/
│   │   └── page.tsx              # 设置页面
│   └── api/
│       ├── notes/
│       │   └── route.ts          # 笔记 API
│       ├── capture/
│       │   └── route.ts          # 抓取 API
│       ├── ai/
│       │   └── route.ts          # AI 处理 API
│       ├── materials/
│       │   └── route.ts          # 素材 API
│       ├── rules/
│       │   └── route.ts          # 规则 API
│       └── export/
│           └── route.ts          # 导出 API
├── components/
│   ├── ui/                       # 基础 UI 组件
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── Toast.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx           # 侧边栏
│   │   ├── Header.tsx            # 顶部导航
│   │   └── BottomNav.tsx         # 移动端底部导航
│   ├── notes/
│   │   ├── NoteCard.tsx          # 笔记卡片
│   │   ├── NoteEditor.tsx        # 富文本编辑器
│   │   ├── NoteList.tsx          # 笔记列表
│   │   └── CategoryTree.tsx      # 分类树
│   ├── capture/
│   │   ├── UrlInput.tsx          # URL 输入框
│   │   ├── TaskList.tsx          # 任务列表
│   │   └── PlatformBadge.tsx     # 平台标识
│   ├── graph/
│   │   └── KnowledgeGraph.tsx    # 知识图谱组件
│   ├── materials/
│   │   ├── MaterialCard.tsx      # 素材卡片
│   │   └── MaterialFilter.tsx    # 素材筛选
│   └── rules/
│       ├── RuleEditor.tsx        # 规则编辑器
│       └── RuleCard.tsx          # 规则卡片
├── lib/
│   ├── db/
│   │   ├── index.ts              # 数据库连接
│   │   ├── schema.ts             # 表结构定义
│   │   └── migrations.ts         # 迁移脚本
│   ├── services/
│   │   ├── capture.ts            # 抓取服务
│   │   ├── ai.ts                 # AI 服务
│   │   ├── snapshot.ts           # 快照服务
│   │   ├── rule-engine.ts        # 规则引擎
│   │   └── export.ts             # 导出服务
│   ├── utils/
│   │   ├── uuid.ts               # UUID 生成
│   │   ├── date.ts               # 日期处理
│   │   └── file.ts               # 文件操作
│   └── constants.ts              # 常量定义
├── store/
│   ├── notes.ts                  # 笔记状态
│   ├── capture.ts                # 抓取状态
│   └── ui.ts                     # UI 状态
├── types/
│   └── index.ts                  # 类型定义
├── public/
│   └── icons/                    # 图标资源
├── snapshots/                    # 快照存储目录
├── backups/                      # 备份目录
└── exports/                      # 导出文件目录
```

---

## Chunk 1: 项目初始化与基础框架

### Task 1.1: 创建 Next.js 项目

**Files:**
- Create: `package.json`
- Create: `next.config.js`
- Create: `tailwind.config.js`
- Create: `tsconfig.json`

- [ ] **Step 1: 初始化 Next.js 项目**

```bash
cd /home/admin/.openclaw/workspace/myclawnote
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-pnpm
```

选择：
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: No
- App Router: Yes
- Import alias: @/*

- [ ] **Step 2: 安装核心依赖**

```bash
pnpm add better-sqlite3 uuid date-fns
pnpm add @types/better-sqlite3 @types/uuid -D
```

- [ ] **Step 3: 安装 UI 相关依赖**

```bash
pnpm add zustand @tanstack/react-query
pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
pnpm add reactflow
pnpm add lucide-react
```

- [ ] **Step 4: 验证项目启动**

```bash
pnpm dev
```

Expected: 项目在 localhost:3000 启动成功

- [ ] **Step 5: 提交**

```bash
git add . && git commit -m "chore: 初始化 Next.js 项目，安装核心依赖"
```

---

### Task 1.2: 数据库初始化

**Files:**
- Create: `lib/db/index.ts`
- Create: `lib/db/schema.ts`
- Create: `lib/db/migrations.ts`
- Create: `types/index.ts`

- [ ] **Step 1: 创建类型定义**

```typescript
// types/index.ts

export type Platform = 'wechat' | 'zhihu' | 'xiaohongshu' | 'manual';
export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type RelationType = 'similar' | 'reference' | 'extend';
export type MaterialType = 'quote' | 'case' | 'data' | 'viewpoint' | 'story';

export interface Note {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  source_url: string | null;
  source_platform: Platform | null;
  snapshot_path: string | null;
  category_id: string | null;
  tags: string[];
  keywords: string[];
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export interface Material {
  id: string;
  type: MaterialType;
  content: string;
  source_note_id: string | null;
  tags: string[];
  use_count: number;
  created_at: string;
}

export interface Rule {
  id: string;
  name: string;
  trigger: RuleTrigger;
  actions: RuleAction[];
  output: RuleOutput;
  is_active: boolean;
  created_at: string;
}

export interface RuleTrigger {
  platform?: Platform;
  type?: string;
  keywords?: string[];
}

export interface RuleAction {
  type: 'denoise' | 'extract' | 'generate' | 'transform';
  options: Record<string, unknown>;
}

export interface RuleOutput {
  category?: string;
  tags?: string[];
  template?: string;
}

export interface Relation {
  id: string;
  note_id_a: string;
  note_id_b: string;
  relation_type: RelationType;
  similarity_score: number;
  created_at: string;
}

export interface CaptureTask {
  id: string;
  url: string;
  platform: Platform | null;
  status: TaskStatus;
  result_note_id: string | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}
```

- [ ] **Step 2: 创建数据库 Schema**

```typescript
// lib/db/schema.ts

export const createTables = `
-- 笔记表
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  source_url TEXT,
  source_platform TEXT,
  snapshot_path TEXT,
  category_id TEXT,
  tags TEXT DEFAULT '[]',
  keywords TEXT DEFAULT '[]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_deleted INTEGER DEFAULT 0
);

-- 分类表
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 素材表
CREATE TABLE IF NOT EXISTS materials (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  source_note_id TEXT,
  tags TEXT DEFAULT '[]',
  use_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 规则表
CREATE TABLE IF NOT EXISTS rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  trigger TEXT NOT NULL,
  actions TEXT NOT NULL,
  output TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 知识关联表
CREATE TABLE IF NOT EXISTS relations (
  id TEXT PRIMARY KEY,
  note_id_a TEXT NOT NULL,
  note_id_b TEXT NOT NULL,
  relation_type TEXT NOT NULL,
  similarity_score REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 抓取任务表
CREATE TABLE IF NOT EXISTS capture_tasks (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  platform TEXT,
  status TEXT DEFAULT 'pending',
  result_note_id TEXT,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category_id);
CREATE INDEX IF NOT EXISTS idx_notes_created ON notes(created_at);
CREATE INDEX IF NOT EXISTS idx_notes_platform ON notes(source_platform);
CREATE INDEX IF NOT EXISTS idx_relations_note_a ON relations(note_id_a);
CREATE INDEX IF NOT EXISTS idx_relations_note_b ON relations(note_id_b);
CREATE INDEX IF NOT EXISTS idx_materials_type ON materials(type);
CREATE INDEX IF NOT EXISTS idx_capture_status ON capture_tasks(status);
`;
```

- [ ] **Step 3: 创建数据库连接**

```typescript
// lib/db/index.ts
import Database from 'better-sqlite3';
import { join } from 'path';
import { app } from 'electron';
import { createTables } from './schema';

const DB_PATH = join(process.cwd(), 'data', 'myclawnote.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    // 确保 data 目录存在
    const fs = require('fs');
    const dataDir = join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.exec(createTables);
  }
  return db;
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

// 通用查询方法
export function query<T>(sql: string, params: unknown[] = []): T[] {
  return getDb().prepare(sql).all(...params) as T[];
}

export function queryOne<T>(sql: string, params: unknown[] = []): T | undefined {
  return getDb().prepare(sql).get(...params) as T | undefined;
}

export function execute(sql: string, params: unknown[] = []): Database.RunResult {
  return getDb().prepare(sql).run(...params);
}
```

- [ ] **Step 4: 创建迁移脚本**

```typescript
// lib/db/migrations.ts
import { getDb } from './index';

export function runMigrations() {
  const db = getDb();
  
  // 检查 migrations 表是否存在
  const tableExists = db.prepare(`
    SELECT name FROM sqlite_master WHERE type='table' AND name='migrations'
  `).get();
  
  if (!tableExists) {
    db.exec(`
      CREATE TABLE migrations (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
  
  // 获取已执行的迁移
  const executed = db.prepare('SELECT name FROM migrations').all() as { name: string }[];
  const executedNames = new Set(executed.map(r => r.name));
  
  // 定义迁移列表
  const migrations = [
    // 未来迁移放在这里
  ];
  
  // 执行未运行的迁移
  for (const migration of migrations) {
    if (!executedNames.has(migration.name)) {
      db.exec(migration.sql);
      db.prepare('INSERT INTO migrations (name) VALUES (?)').run(migration.name);
      console.log(`Migration ${migration.name} executed`);
    }
  }
}

// 初始化默认数据
export function seedDefaultData() {
  const db = getDb();
  
  // 检查是否已有分类
  const count = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  
  if (count.count === 0) {
    // 插入默认分类
    const defaultCategories = [
      { id: 'default', name: '默认分类', icon: 'folder', sort_order: 0 },
      { id: 'wechat', name: '微信公众号', icon: 'message-circle', sort_order: 1 },
      { id: 'zhihu', name: '知乎精选', icon: 'help-circle', sort_order: 2 },
      { id: 'xiaohongshu', name: '小红书', icon: 'heart', sort_order: 3 },
    ];
    
    const stmt = db.prepare('INSERT INTO categories (id, name, icon, sort_order) VALUES (?, ?, ?, ?)');
    for (const cat of defaultCategories) {
      stmt.run(cat.id, cat.name, cat.icon, cat.sort_order);
    }
    
    // 插入默认规则
    const defaultRules = [
      {
        id: 'rule-default',
        name: '默认处理规则',
        trigger: JSON.stringify({}),
        actions: JSON.stringify([
          { type: 'denoise', options: { removeAds: true } },
          { type: 'extract', options: { keywords: true, summary: true } }
        ]),
        output: JSON.stringify({}),
        is_active: 1
      }
    ];
    
    const ruleStmt = db.prepare('INSERT INTO rules (id, name, trigger, actions, output, is_active) VALUES (?, ?, ?, ?, ?, ?)');
    for (const rule of defaultRules) {
      ruleStmt.run(rule.id, rule.name, rule.trigger, rule.actions, rule.output, rule.is_active);
    }
  }
}
```

- [ ] **Step 5: 验证数据库初始化**

```bash
pnpm exec ts-node -e "import('./lib/db/migrations').then(m => { m.runMigrations(); m.seedDefaultData(); console.log('DB initialized'); process.exit(0); })"
```

Expected: 输出 "DB initialized"

- [ ] **Step 6: 提交**

```bash
git add . && git commit -m "feat: 添加数据库初始化和类型定义"
```

---

### Task 1.3: 基础 UI 组件

**Files:**
- Create: `components/ui/Button.tsx`
- Create: `components/ui/Input.tsx`
- Create: `components/ui/Card.tsx`
- Create: `components/ui/Modal.tsx`
- Create: `components/ui/Toast.tsx`
- Create: `components/layout/Sidebar.tsx`
- Create: `components/layout/Header.tsx`
- Create: `lib/constants.ts`

- [ ] **Step 1: 创建常量定义**

```typescript
// lib/constants.ts

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
```

- [ ] **Step 2: 创建 Button 组件**

```tsx
// components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
            'bg-gray-100 text-gray-700 hover:bg-gray-200': variant === 'secondary',
            'bg-transparent text-gray-600 hover:bg-gray-100': variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
          },
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-sm': size === 'md',
            'px-6 py-3 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

- [ ] **Step 3: 创建 Input 组件**

```tsx
// components/ui/Input.tsx
import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-3 py-2 border border-gray-300 rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'placeholder:text-gray-400',
            error && 'border-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

- [ ] **Step 4: 创建 Card 组件**

```tsx
// components/ui/Card.tsx
import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white rounded-xl border border-gray-200 shadow-sm',
          hover && 'hover:shadow-md hover:border-gray-300 transition-shadow cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
```

- [ ] **Step 5: 创建 Modal 组件**

```tsx
// components/ui/Modal.tsx
'use client';

import { Fragment, ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity" 
          onClick={onClose}
        />
        
        {/* Modal */}
        <div
          className={cn(
            'relative bg-white rounded-xl shadow-xl w-full',
            'transform transition-all',
            {
              'max-w-sm': size === 'sm',
              'max-w-md': size === 'md',
              'max-w-lg': size === 'lg',
              'max-w-2xl': size === 'xl',
            }
          )}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          
          {/* Content */}
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: 创建 Toast 组件**

```tsx
// components/ui/Toast.tsx
'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastContextType {
  toast: (type: Toast['type'], message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((type: Toast['type'], message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <div
            key={t.id}
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg',
              'animate-in slide-in-from-right',
              {
                'bg-green-50 text-green-800 border border-green-200': t.type === 'success',
                'bg-red-50 text-red-800 border border-red-200': t.type === 'error',
                'bg-blue-50 text-blue-800 border border-blue-200': t.type === 'info',
              }
            )}
          >
            {t.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {t.type === 'info' && <Info className="w-5 h-5" />}
            <span className="text-sm">{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
```

- [ ] **Step 7: 创建工具函数**

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
```

- [ ] **Step 8: 安装 clsx**

```bash
pnpm add clsx
```

- [ ] **Step 9: 提交**

```bash
git add . && git commit -m "feat: 添加基础 UI 组件（Button/Input/Card/Modal/Toast）"
```

---

## Chunk 2: 核心页面与布局

### Task 2.1: 根布局与导航

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/layout/Sidebar.tsx`
- Create: `components/layout/Header.tsx`
- Create: `app/globals.css`

- [ ] **Step 1: 更新全局样式**

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 255 255 255;
    --foreground: 17 24 39;
    --primary: 37 99 235;
    --primary-foreground: 255 255 255;
  }
}

@layer components {
  .page-container {
    @apply min-h-screen bg-gray-50;
  }
  
  .page-content {
    @apply p-6;
  }
  
  .section-title {
    @apply text-lg font-semibold text-gray-900 mb-4;
  }
}
```

- [ ] **Step 2: 创建侧边栏**

```tsx
// components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Link2, 
  FileText, 
  GitBranch, 
  Archive, 
  Settings,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: '首页' },
  { href: '/capture', icon: Link2, label: '抓取' },
  { href: '/notes', icon: FileText, label: '笔记' },
  { href: '/graph', icon: GitBranch, label: '图谱' },
  { href: '/materials', icon: Archive, label: '素材' },
  { href: '/rules', icon: Sparkles, label: '规则' },
  { href: '/settings', icon: Settings, label: '设置' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🦞</span>
          <span className="font-bold text-xl text-gray-900">MyClawNote</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-400">
          Powered by OpenClaw
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: 更新根布局**

```tsx
// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { ToastProvider } from '@/components/ui/Toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MyClawNote - 个人知识管理',
  description: '基于 OpenClaw 的个人专属知识管理工具',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <ToastProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: 验证布局**

```bash
pnpm dev
```

访问 http://localhost:3000，确认侧边栏显示正常

- [ ] **Step 5: 提交**

```bash
git add . && git commit -m "feat: 添加根布局和侧边栏导航"
```

---

### Task 2.2: 首页仪表盘

**Files:**
- Modify: `app/page.tsx`
- Create: `components/dashboard/StatCard.tsx`
- Create: `components/dashboard/RecentNotes.tsx`
- Create: `app/api/stats/route.ts`

- [ ] **Step 1: 创建统计 API**

```typescript
// app/api/stats/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const notesCount = query<{ count: number }>(
      'SELECT COUNT(*) as count FROM notes WHERE is_deleted = 0'
    )[0];
    
    const materialsCount = query<{ count: number }>(
      'SELECT COUNT(*) as count FROM materials'
    )[0];
    
    const pendingTasks = query<{ count: number }>(
      "SELECT COUNT(*) as count FROM capture_tasks WHERE status = 'pending'"
    )[0];
    
    const recentNotes = query(
      `SELECT id, title, source_platform, created_at 
       FROM notes 
       WHERE is_deleted = 0 
       ORDER BY created_at DESC 
       LIMIT 5`
    );
    
    return NextResponse.json({
      notesCount: notesCount?.count || 0,
      materialsCount: materialsCount?.count || 0,
      pendingTasks: pendingTasks?.count || 0,
      recentNotes,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
```

- [ ] **Step 2: 创建统计卡片组件**

```tsx
// components/dashboard/StatCard.tsx
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
}

export function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </Card>
  );
}
```

- [ ] **Step 3: 创建最近笔记组件**

```tsx
// components/dashboard/RecentNotes.tsx
import Link from 'next/link';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Card } from '@/components/ui/Card';
import { PLATFORMS } from '@/lib/constants';

interface RecentNote {
  id: string;
  title: string;
  source_platform: string | null;
  created_at: string;
}

interface RecentNotesProps {
  notes: RecentNote[];
}

export function RecentNotes({ notes }: RecentNotesProps) {
  if (notes.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">暂无笔记，开始抓取内容吧！</p>
        <Link 
          href="/capture" 
          className="inline-block mt-4 text-blue-600 hover:underline"
        >
          去抓取 →
        </Link>
      </Card>
    );
  }

  return (
    <Card>
      <div className="divide-y divide-gray-100">
        {notes.map(note => (
          <Link
            key={note.id}
            href={`/notes/${note.id}`}
            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {note.title}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {format(new Date(note.created_at), 'MM-dd HH:mm', { locale: zhCN })}
              </p>
            </div>
            {note.source_platform && (
              <span 
                className="ml-4 px-2 py-1 text-xs rounded-full"
                style={{ 
                  backgroundColor: `${PLATFORMS[note.source_platform as keyof typeof PLATFORMS]?.color}20`,
                  color: PLATFORMS[note.source_platform as keyof typeof PLATFORMS]?.color
                }}
              >
                {PLATFORMS[note.source_platform as keyof typeof PLATFORMS]?.name}
              </span>
            )}
          </Link>
        ))}
      </div>
    </Card>
  );
}
```

- [ ] **Step 4: 创建首页**

```tsx
// app/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { FileText, Archive, Clock } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentNotes } from '@/components/dashboard/RecentNotes';
import { QuickCapture } from '@/components/dashboard/QuickCapture';

export default function HomePage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => fetch('/api/stats').then(res => res.json()),
  });

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded-xl" />
            <div className="h-64 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-content">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
          <p className="text-gray-500 mt-1">欢迎回来，今天想学点什么？</p>
        </div>

        {/* Quick Capture */}
        <div className="mb-6">
          <QuickCapture />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard
            title="笔记总数"
            value={stats?.notesCount || 0}
            icon={FileText}
            color="#3B82F6"
          />
          <StatCard
            title="素材数量"
            value={stats?.materialsCount || 0}
            icon={Archive}
            color="#10B981"
          />
          <StatCard
            title="待处理任务"
            value={stats?.pendingTasks || 0}
            icon={Clock}
            color="#F59E0B"
          />
        </div>

        {/* Recent Notes */}
        <div>
          <h2 className="section-title">最近笔记</h2>
          <RecentNotes notes={stats?.recentNotes || []} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: 创建快速抓取组件**

```tsx
// components/dashboard/QuickCapture.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export function QuickCapture() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (res.ok) {
        toast('success', '抓取任务已创建');
        setUrl('');
        router.push('/capture');
      } else {
        const data = await res.json();
        toast('error', data.error || '抓取失败');
      }
    } catch {
      toast('error', '网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1">
        <Input
          type="url"
          placeholder="粘贴文章链接，支持微信/知乎/小红书..."
          value={url}
          onChange={e => setUrl(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={loading || !url.trim()}>
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Link2 className="w-4 h-4 mr-2" />
            抓取
          </>
        )}
      </Button>
    </form>
  );
}
```

- [ ] **Step 6: 安装 date-fns**

```bash
pnpm add date-fns
```

- [ ] **Step 7: 验证首页**

```bash
pnpm dev
```

访问 http://localhost:3000，确认首页显示正常

- [ ] **Step 8: 提交**

```bash
git add . && git commit -m "feat: 添加首页仪表盘"
```

---

## Chunk 3: 抓取服务实现

### Task 3.1: 抓取 API

**Files:**
- Create: `app/api/capture/route.ts`
- Create: `lib/services/capture.ts`
- Create: `lib/services/platform-detector.ts`

- [ ] **Step 1: 创建平台检测服务**

```typescript
// lib/services/platform-detector.ts
import { Platform } from '@/types';

interface PlatformInfo {
  platform: Platform;
  type: 'article' | 'answer' | 'note';
  id: string;
}

export function detectPlatform(url: string): PlatformInfo | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const pathname = urlObj.pathname;

    // 微信公众号
    if (hostname === 'mp.weixin.qq.com' || hostname.includes('weixin.qq.com')) {
      const biz = urlObj.searchParams.get('__biz');
      const sn = urlObj.searchParams.get('sn');
      if (biz && sn) {
        return {
          platform: 'wechat',
          type: 'article',
          id: `${biz}_${sn}`,
        };
      }
    }

    // 知乎
    if (hostname === 'zhuanlan.zhihu.com') {
      const match = pathname.match(/\/p\/(\d+)/);
      if (match) {
        return {
          platform: 'zhihu',
          type: 'article',
          id: match[1],
        };
      }
    }
    if (hostname === 'www.zhihu.com') {
      const answerMatch = pathname.match(/\/answer\/(\d+)/);
      if (answerMatch) {
        return {
          platform: 'zhihu',
          type: 'answer',
          id: answerMatch[1],
        };
      }
    }

    // 小红书
    if (hostname === 'www.xiaohongshu.com' || hostname === 'xiaohongshu.com') {
      const match = pathname.match(/\/discovery\/item\/([a-zA-Z0-9]+)/);
      if (match) {
        return {
          platform: 'xiaohongshu',
          type: 'note',
          id: match[1],
        };
      }
      // 新版 URL 格式
      const match2 = pathname.match(/\/explore\/([a-zA-Z0-9]+)/);
      if (match2) {
        return {
          platform: 'xiaohongshu',
          type: 'note',
          id: match2[1],
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: 创建抓取服务**

```typescript
// lib/services/capture.ts
import { Platform, CaptureTask, Note } from '@/types';
import { generateId } from '@/lib/utils';
import { execute, queryOne } from '@/lib/db';

const RSSHUB_BASE = 'https://rsshub.app';

interface CaptureResult {
  title: string;
  content: string;
  author?: string;
  publishTime?: string;
  images?: string[];
}

export async function captureFromRSSHub(
  platform: Platform,
  type: string,
  id: string
): Promise<CaptureResult | null> {
  let rssPath = '';

  switch (platform) {
    case 'wechat':
      // 微信公众号需要特殊处理
      return null;
    
    case 'zhihu':
      if (type === 'article') {
        rssPath = `/zhihu/zhuanlan/${id}`;
      } else if (type === 'answer') {
        rssPath = `/zhihu/answer/${id}`;
      }
      break;
    
    case 'xiaohongshu':
      // 小红书暂不支持 RSSHub
      return null;
    
    default:
      return null;
  }

  try {
    const response = await fetch(`${RSSHUB_BASE}${rssPath}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) return null;

    // RSSHub 返回的是 RSS XML，需要解析
    // 这里简化处理，实际需要 XML 解析
    const text = await response.text();
    
    // 提取标题和内容（简化版）
    const titleMatch = text.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
    const descMatch = text.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/s);
    
    if (!titleMatch) return null;

    return {
      title: titleMatch[1],
      content: descMatch ? descMatch[1] : '',
    };
  } catch (error) {
    console.error('RSSHub capture failed:', error);
    return null;
  }
}

export async function captureWithPlaywright(
  url: string,
  platform: Platform
): Promise<CaptureResult | null> {
  // Playwright 抓取实现
  // 这里需要启动浏览器，由于是服务端，需要特殊处理
  // 简化版：返回 null，表示需要手动导入
  return null;
}

export function createCaptureTask(url: string, platform: Platform | null): string {
  const id = generateId();
  
  execute(
    `INSERT INTO capture_tasks (id, url, platform, status) VALUES (?, ?, ?, 'pending')`,
    [id, url, platform]
  );

  return id;
}

export function updateCaptureTask(
  id: string,
  status: string,
  resultNoteId?: string,
  errorMessage?: string
) {
  const completedAt = status === 'completed' || status === 'failed' 
    ? new Date().toISOString() 
    : null;

  execute(
    `UPDATE capture_tasks 
     SET status = ?, result_note_id = ?, error_message = ?, completed_at = ?
     WHERE id = ?`,
    [status, resultNoteId || null, errorMessage || null, completedAt, id]
  );
}

export function getCaptureTask(id: string): CaptureTask | null {
  return queryOne<CaptureTask>(
    'SELECT * FROM capture_tasks WHERE id = ?',
    [id]
  ) || null;
}

export function getPendingTasks(): CaptureTask[] {
  const { query } = require('@/lib/db');
  return query<CaptureTask>(
    "SELECT * FROM capture_tasks WHERE status = 'pending' ORDER BY created_at ASC"
  );
}

export function getAllTasks(limit = 20): CaptureTask[] {
  const { query } = require('@/lib/db');
  return query<CaptureTask>(
    'SELECT * FROM capture_tasks ORDER BY created_at DESC LIMIT ?',
    [limit]
  );
}
```

- [ ] **Step 3: 创建抓取 API**

```typescript
// app/api/capture/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { detectPlatform } from '@/lib/services/platform-detector';
import { 
  createCaptureTask, 
  captureFromRSSHub,
  updateCaptureTask,
  getPendingTasks,
  getAllTasks
} from '@/lib/services/capture';
import { generateId } from '@/lib/utils';
import { execute } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // 检测平台
    const platformInfo = detectPlatform(url);
    
    if (!platformInfo) {
      // 不支持的平台，创建手动导入任务
      const taskId = createCaptureTask(url, null);
      return NextResponse.json({
        taskId,
        status: 'manual_required',
        message: '不支持的平台，请手动导入内容',
      });
    }

    const taskId = createCaptureTask(url, platformInfo.platform);

    // 尝试 RSSHub 抓取
    const result = await captureFromRSSHub(
      platformInfo.platform,
      platformInfo.type,
      platformInfo.id
    );

    if (result) {
      // 抓取成功，创建笔记
      const noteId = generateId();
      execute(
        `INSERT INTO notes (id, title, content, source_url, source_platform) 
         VALUES (?, ?, ?, ?, ?)`,
        [noteId, result.title, result.content, url, platformInfo.platform]
      );

      updateCaptureTask(taskId, 'completed', noteId);

      return NextResponse.json({
        taskId,
        status: 'completed',
        noteId,
        title: result.title,
      });
    }

    // RSSHub 失败，标记为需要手动处理
    updateCaptureTask(taskId, 'processing');
    
    return NextResponse.json({
      taskId,
      status: 'processing',
      message: '正在处理中，请稍后刷新查看结果',
    });

  } catch (error) {
    console.error('Capture error:', error);
    return NextResponse.json(
      { error: 'Failed to capture' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  
  try {
    let tasks;
    if (status === 'pending') {
      tasks = getPendingTasks();
    } else {
      tasks = getAllTasks();
    }

    return NextResponse.json({ tasks });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 4: 提交**

```bash
git add . && git commit -m "feat: 添加抓取服务和 API"
```

---

由于计划较长，我将分块保存。这是第一部分，包含：
- 项目初始化
- 数据库设计
- 基础 UI 组件
- 核心页面布局
- 抓取服务

我将继续编写后续任务（AI 服务、笔记管理、知识图谱、素材库、规则引擎等）。

**要继续吗？** 或者你想先执行这部分？