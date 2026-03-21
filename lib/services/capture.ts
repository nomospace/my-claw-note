import { Platform, CaptureTask } from '@/types';
import { generateId } from '@/lib/utils';
import { getDbSync, saveDbSync } from '@/lib/db';
import type { SqlValue } from 'sql.js';

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
