// 类型定义

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

export interface Stats {
  notesCount: number;
  materialsCount: number;
  pendingTasks: number;
  recentNotes: Note[];
}