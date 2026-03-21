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

    const result = await captureFromRSSHub(
      platformInfo.platform,
      platformInfo.type,
      platformInfo.id
    );

    if (result) {
      // 使用新的处理流程（降噪、摘要、关键词、素材、快照）
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
    }

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

export async function GET() {
  try {
    await ensureDbInitialized();
    const tasks = getAllTasks();
    return NextResponse.json({ tasks });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}
