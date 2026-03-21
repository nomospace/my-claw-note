import { Platform, CaptureTask } from '@/types';
import { generateId } from '@/lib/utils';
import { getDbSync, saveDbSync } from '@/lib/db';
import { generateSummary, extractKeywords, extractMaterials, denoiseContent } from './ai';
import { saveSnapshot, generateSnapshotHtml } from './snapshot';
import type { SqlValue } from 'sql.js';

const RSSHUB_BASE = 'https://rsshub.app';

interface CaptureResult {
  title: string;
  content: string;
  author?: string;
  publishTime?: string;
  images?: string[];
}

// RSSHub 抓取
export async function captureFromRSSHub(
  platform: Platform,
  type: string,
  id: string
): Promise<CaptureResult | null> {
  let rssPath = '';

  switch (platform) {
    case 'wechat':
      return null;
    
    case 'zhihu':
      if (type === 'article') {
        rssPath = `/zhihu/zhuanlan/${id}`;
      } else if (type === 'answer') {
        rssPath = `/zhihu/answer/${id}`;
      }
      break;
    
    case 'xiaohongshu':
      return null;
    
    default:
      return null;
  }

  try {
    const response = await fetch(`${RSSHUB_BASE}${rssPath}`, {
      headers: { 'Accept': 'application/xml' },
    });

    if (!response.ok) return null;

    const text = await response.text();
    
    const titleMatch = text.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
    const descMatch = text.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/);
    const authorMatch = text.match(/<author>(.*?)<\/author>/);
    const pubDateMatch = text.match(/<pubDate>(.*?)<\/pubDate>/);
    
    if (!titleMatch) return null;

    return {
      title: titleMatch[1],
      content: descMatch ? descMatch[1] : '',
      author: authorMatch ? authorMatch[1] : undefined,
      publishTime: pubDateMatch ? pubDateMatch[1] : undefined,
    };
  } catch (error) {
    console.error('RSSHub capture failed:', error);
    return null;
  }
}

// 创建抓取任务
export function createCaptureTask(url: string, platform: Platform | null): string {
  const db = getDbSync();
  const id = generateId();
  const now = new Date().toISOString();
  
  db.run(
    `INSERT INTO capture_tasks (id, url, platform, status, created_at) VALUES (?, ?, ?, 'pending', ?)`,
    [id, url, platform, now] as SqlValue[]
  );
  saveDbSync();

  return id;
}

// 更新抓取任务
export function updateCaptureTask(
  id: string,
  status: string,
  resultNoteId?: string,
  errorMessage?: string
) {
  const db = getDbSync();
  const completedAt = status === 'completed' || status === 'failed' 
    ? new Date().toISOString() 
    : null;

  db.run(
    `UPDATE capture_tasks 
     SET status = ?, result_note_id = ?, error_message = ?, completed_at = ?
     WHERE id = ?`,
    [status, resultNoteId || null, errorMessage || null, completedAt, id] as SqlValue[]
  );
  saveDbSync();
}

// 获取所有任务
export function getAllTasks(limit = 20): CaptureTask[] {
  const db = getDbSync();
  const result = db.exec(
    'SELECT id, url, platform, status, result_note_id, error_message, created_at, completed_at FROM capture_tasks ORDER BY created_at DESC LIMIT ?',
    [limit]
  );
  
  if (result.length === 0) return [];
  
  return result[0].values.map((row) => ({
    id: row[0] as string,
    url: row[1] as string,
    platform: row[2] as Platform | null,
    status: row[3] as 'pending' | 'processing' | 'completed' | 'failed',
    result_note_id: row[4] as string | null,
    error_message: row[5] as string | null,
    created_at: row[6] as string,
    completed_at: row[7] as string | null,
  }));
}

// 创建笔记并处理
export async function createNoteWithProcess(
  title: string,
  content: string,
  sourceUrl: string,
  platform: Platform
): Promise<string> {
  const db = getDbSync();
  const noteId = generateId();
  const now = new Date().toISOString();
  
  // 1. 内容降噪
  const cleanedContent = await denoiseContent(content);
  
  // 2. 生成摘要
  const summary = await generateSummary(cleanedContent);
  
  // 3. 提取关键词
  const keywords = await extractKeywords(cleanedContent);
  
  // 4. 保存快照
  const snapshotHtml = generateSnapshotHtml(title, cleanedContent, sourceUrl, platform);
  await saveSnapshot(noteId, snapshotHtml, {
    url: sourceUrl,
    title,
    captureTime: now,
    platform,
  });
  
  // 5. 保存笔记
  const snapshotPath = `snapshots/${noteId}`;
  db.run(
    `INSERT INTO notes (id, title, content, summary, source_url, source_platform, snapshot_path, keywords, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [noteId, title, cleanedContent, summary, sourceUrl, platform, snapshotPath, JSON.stringify(keywords), now, now] as SqlValue[]
  );
  
  // 6. 提取素材
  const materials = await extractMaterials(cleanedContent, noteId);
  for (const mat of materials) {
    const matId = generateId();
    db.run(
      `INSERT INTO materials (id, type, content, source_note_id, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [matId, mat.type, mat.content, noteId, now] as SqlValue[]
    );
  }
  
  saveDbSync();
  
  return noteId;
}
