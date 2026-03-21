import { NextResponse } from 'next/server';
import { ensureDbInitialized } from '@/lib/db/init';
import { getDbSync, saveDbSync } from '@/lib/db';

export async function POST() {
  try {
    await ensureDbInitialized();
    const db = getDbSync();
    
    // 清理所有 processing/pending 超过 2 分钟的任务
    const result = db.exec(`
      SELECT COUNT(*) as count FROM capture_tasks 
      WHERE status IN ('pending', 'processing')
      AND datetime(created_at) < datetime('now', '-2 minutes')
    `);
    
    const count = result.length > 0 ? (result[0].values[0] as number[])[0] : 0;
    
    if (count > 0) {
      db.run(`
        UPDATE capture_tasks 
        SET status = 'failed', 
            error_message = '任务超时，已自动清理',
            completed_at = datetime('now')
        WHERE status IN ('pending', 'processing')
        AND datetime(created_at) < datetime('now', '-2 minutes')
      `);
      saveDbSync();
    }
    
    return NextResponse.json({ 
      success: true, 
      cleaned: count,
      message: count > 0 ? `已清理 ${count} 个超时任务` : '没有需要清理的任务'
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: 'Failed to cleanup' }, { status: 500 });
  }
}
