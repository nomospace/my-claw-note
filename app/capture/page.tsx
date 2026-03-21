'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link2, Loader2, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { PLATFORMS, TASK_STATUS } from '@/lib/constants';
import { formatDateShort } from '@/lib/utils';

interface CaptureTask {
  id: string;
  url: string;
  platform: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result_note_id: string | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export default function CapturePage() {
  const [url, setUrl] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['capture-tasks'],
    queryFn: () => fetch('/api/capture').then(res => res.json()),
    refetchInterval: 5000,
  });

  const cleanupMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/capture/cleanup', { method: 'POST' });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.cleaned > 0) {
        toast('info', data.message);
      }
      queryClient.invalidateQueries({ queryKey: ['capture-tasks'] });
    },
  });

  const captureMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await fetch('/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error('抓取失败');
      return res.json();
    },
    onSuccess: (data) => {
      if (data.noteId) {
        toast('success', '抓取成功');
      } else if (data.status === 'manual_required') {
        toast('info', '不支持的平台，请手动导入');
      } else {
        toast('info', '任务已创建');
      }
      setUrl('');
      queryClient.invalidateQueries({ queryKey: ['capture-tasks'] });
    },
    onError: () => {
      toast('error', '抓取失败，请检查链接');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      captureMutation.mutate(url.trim());
    }
  };

  const tasks = tasksData?.tasks || [];

  return (
    <div className="page-container max-w-2xl mx-auto">
      {/* Header - 移动端隐藏 */}
      <div className="mb-4 hidden md:block">
        <h1 className="text-2xl font-bold text-gray-900">内容抓取</h1>
        <p className="text-gray-500 mt-1 text-sm">支持微信公众号、知乎专栏、知乎问答</p>
      </div>

      {/* 抓取表单 */}
      <Card className="p-4 mb-4">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="url"
                placeholder="粘贴文章链接..."
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={captureMutation.isPending || !url.trim()}
              className="flex-shrink-0"
            >
              {captureMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Link2 className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="hidden md:inline">抓取</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* 支持平台 - 移动端简化 */}
      <Card className="p-3 mb-4">
        <div className="flex items-center gap-4 overflow-x-auto">
          {Object.entries(PLATFORMS).filter(([k]) => k !== 'manual').map(([key, info]) => (
            <div key={key} className="flex items-center gap-1.5 flex-shrink-0">
              <div
                className="w-6 h-6 rounded flex items-center justify-center"
                style={{ backgroundColor: `${info.color}20` }}
              >
                <Link2 className="w-3 h-3" style={{ color: info.color }} />
              </div>
              <span className="text-xs text-gray-600">{info.name}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          ⚠️ 知乎专栏因平台限制，建议手动导入
        </p>
      </Card>

      {/* 任务列表 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-700">抓取任务</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => cleanupMutation.mutate()}
            className="text-xs"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            清理
          </Button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8 text-gray-400 text-sm">加载中...</div>
        ) : tasks.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-400 text-sm">暂无抓取任务</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {tasks.map((task: CaptureTask) => (
              <Card key={task.id} className="p-3">
                <div className="flex items-start gap-3">
                  {/* 状态图标 */}
                  <div className="flex-shrink-0 mt-0.5">
                    {task.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {task.status === 'failed' && <XCircle className="w-4 h-4 text-red-500" />}
                    {task.status === 'processing' && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                    {task.status === 'pending' && <Clock className="w-4 h-4 text-gray-400" />}
                  </div>
                  
                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{task.url}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDateShort(task.created_at)}</p>
                    {task.error_message && (
                      <p className="text-xs text-red-500 mt-1">{task.error_message}</p>
                    )}
                  </div>
                  
                  {/* 平台标签 */}
                  {task.platform && PLATFORMS[task.platform as keyof typeof PLATFORMS] && (
                    <span
                      className="flex-shrink-0 px-2 py-0.5 text-xs rounded-full"
                      style={{
                        backgroundColor: `${PLATFORMS[task.platform as keyof typeof PLATFORMS].color}20`,
                        color: PLATFORMS[task.platform as keyof typeof PLATFORMS].color,
                      }}
                    >
                      {PLATFORMS[task.platform as keyof typeof PLATFORMS].name}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
