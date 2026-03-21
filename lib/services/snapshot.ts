// 快照服务 - 保存原文快照
import { join } from 'path';
import { writeFile, mkdir, readFile, access } from 'fs/promises';
import { existsSync } from 'fs';

const SNAPSHOT_DIR = join(process.cwd(), 'snapshots');

interface SnapshotMeta {
  url: string;
  title: string;
  author?: string;
  publishTime?: string;
  captureTime: string;
  platform: string;
}

// 确保快照目录存在
async function ensureSnapshotDir() {
  if (!existsSync(SNAPSHOT_DIR)) {
    await mkdir(SNAPSHOT_DIR, { recursive: true });
  }
}

// 保存快照
export async function saveSnapshot(
  noteId: string,
  content: string,
  meta: SnapshotMeta
): Promise<string> {
  await ensureSnapshotDir();
  
  const noteDir = join(SNAPSHOT_DIR, noteId);
  await mkdir(noteDir, { recursive: true });
  
  // 保存 HTML
  const htmlPath = join(noteDir, 'original.html');
  await writeFile(htmlPath, content, 'utf-8');
  
  // 保存元数据
  const metaPath = join(noteDir, 'metadata.json');
  await writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf-8');
  
  return noteDir;
}

// 读取快照
export async function readSnapshot(noteId: string): Promise<{
  content: string;
  meta: SnapshotMeta;
} | null> {
  try {
    const noteDir = join(SNAPSHOT_DIR, noteId);
    
    const htmlPath = join(noteDir, 'original.html');
    const metaPath = join(noteDir, 'metadata.json');
    
    const content = await readFile(htmlPath, 'utf-8');
    const metaJson = await readFile(metaPath, 'utf-8');
    const meta = JSON.parse(metaJson) as SnapshotMeta;
    
    return { content, meta };
  } catch {
    return null;
  }
}

// 检查快照是否存在
export async function snapshotExists(noteId: string): Promise<boolean> {
  const noteDir = join(SNAPSHOT_DIR, noteId);
  return existsSync(noteDir);
}

// 生成快照 HTML
export function generateSnapshotHtml(
  title: string,
  content: string,
  sourceUrl: string,
  platform: string
): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.8;
      color: #333;
    }
    .header {
      border-bottom: 1px solid #eee;
      padding-bottom: 20px;
      margin-bottom: 20px;
    }
    .meta {
      font-size: 14px;
      color: #666;
      margin-top: 10px;
    }
    .content {
      white-space: pre-wrap;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 12px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <div class="meta">
      来源: ${platform} | <a href="${sourceUrl}" target="_blank">原文链接</a>
    </div>
  </div>
  <div class="content">${content}</div>
  <div class="footer">
    快照保存时间: ${new Date().toLocaleString('zh-CN')}
  </div>
</body>
</html>`;
}
