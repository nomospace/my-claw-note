import { NextResponse } from 'next/server';
import { ensureDbInitialized } from '@/lib/db/init';
import { getDbSync, saveDbSync } from '@/lib/db';

export async function GET() {
  try {
    await ensureDbInitialized();
    const db = getDbSync();
    
    // 查询笔记数量
    const notesResult = db.exec('SELECT COUNT(*) as count FROM notes WHERE is_deleted = 0');
    const notesCount = notesResult.length > 0 ? (notesResult[0].values[0] as number[])[0] : 0;
    
    // 查询素材数量
    const materialsResult = db.exec('SELECT COUNT(*) as count FROM materials');
    const materialsCount = materialsResult.length > 0 ? (materialsResult[0].values[0] as number[])[0] : 0;
    
    // 查询待处理任务
    const tasksResult = db.exec("SELECT COUNT(*) as count FROM capture_tasks WHERE status = 'pending'");
    const pendingTasks = tasksResult.length > 0 ? (tasksResult[0].values[0] as number[])[0] : 0;
    
    // 查询最近笔记
    const recentResult = db.exec(`
      SELECT id, title, source_platform, created_at 
      FROM notes 
      WHERE is_deleted = 0 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    const recentNotes = recentResult.length > 0 
      ? recentResult[0].values.map((row: unknown[]) => ({
          id: row[0] as string,
          title: row[1] as string,
          source_platform: row[2] as string | null,
          created_at: row[3] as string
        }))
      : [];
    
    return NextResponse.json({
      notesCount,
      materialsCount,
      pendingTasks,
      recentNotes,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ 
      notesCount: 0, 
      materialsCount: 0, 
      pendingTasks: 0, 
      recentNotes: [] 
    });
  }
}
