import { NextRequest, NextResponse } from 'next/server';
import { detectPlatform } from '@/lib/services/platform-detector';
import { 
  createCaptureTask, 
  captureFromRSSHub,
  updateCaptureTask,
  getAllTasks,
  createNoteWithProcess
} from '@/lib/services/capture';
import { ensureDbInitialized } from '@/lib/db/init';
import { getDbSync, saveDbSync } from '@/lib/db';

// 自动清理超时任务（超过 2 分钟的 pending/processing）
function cleanupStaleTasks() {
  try {
    const db = getDbSync();
    db.run(`
      UPDATE capture_tasks 
      SET status = 'failed', 
          error_message = '任务超时，已自动清理',
          completed_at = datetime('now')
      WHERE status IN ('pending', 'processing')
      AND datetime(created_at) < datetime('now', '-2 minutes')
    `);
    saveDbSync();
  } catch (e) {
    console.error('Cleanup error:', e);
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDbInitialized();
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const platformInfo = detectPlatform(url);
    
    if (!platformInfo) {
      const taskId = createCaptureTask(url, null);
      return NextResponse.json({
        taskId,
        status: 'manual_required',
        message: '不支持的平台，请手动导入内容',
      });
    }

    const taskId = createCaptureTask(url, platformInfo.platform);

    try {
      const result = await captureFromRSSHub(
        platformInfo.platform,
        platformInfo.type,
        platformInfo.id
      );

      if (result) {
        const noteId = await createNoteWithProcess(
          result.title,
          result.content,
          url,
          platformInfo.platform
        );

        updateCaptureTask(taskId, 'completed', noteId);

        return NextResponse.json({
          taskId,
          status: 'completed',
          noteId,
          title: result.title,
        });
      } else {
        updateCaptureTask(taskId, 'failed', undefined, 'RSSHub 抓取失败，请检查链接或稍后重试');
        
        return NextResponse.json({
          taskId,
          status: 'failed',
          message: '抓取失败，可能是网络问题或内容不可访问',
        });
      }
    } catch (captureError) {
      console.error('Capture from RSSHub error:', captureError);
      updateCaptureTask(taskId, 'failed', undefined, String(captureError));
      
      return NextResponse.json({
        taskId,
        status: 'failed',
        message: '抓取过程出错: ' + String(captureError),
      });
    }

  } catch (error) {
    console.error('Capture error:', error);
    return NextResponse.json(
      { error: 'Failed to capture' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await ensureDbInitialized();
    
    // 自动清理超时任务
    cleanupStaleTasks();
    
    const tasks = getAllTasks();
    return NextResponse.json({ tasks });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}
