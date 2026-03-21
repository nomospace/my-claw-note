// 数据库 Schema

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