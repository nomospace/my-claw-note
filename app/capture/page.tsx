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
    <div className="page-container">
      <div className="page-content">
        {/* Header */}
        <h1 className="page-title">内容抓取</h1>

        {/* 抓取表单 */}
        <Card className="p-5 mb-6">
          <form onSubmit={handleSubmit}>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="url"
                  placeholder="粘贴文章链接，支持微信/知乎/小红书..."
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  className="input"
                />
              </div>
              <Button
                type="submit"
                disabled={captureMutation.isPending || !url.trim()}
              >
                {captureMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Link2 className="w-4 h-4" />
                    抓取
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* 支持平台 */}
        <Card className="p-4 mb-6">
          <h3 className="text-sm font-medium mb-3" style={{ color: '#374151' }}>支持的平台</h3>
          <div className="flex gap-6">
            {Object.entries(PLATFORMS).filter(([k]) => k !== 'manual').map(([key, info]) => (
              <div key={key} className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded flex items-center justify-center"
                  style={{ backgroundColor: `${info.color}15` }}
                >
                  <Link2 className="w-4 h-4" style={{ color: info.color }} />
                </div>
                <span className="text-sm" style={{ color: '#4b5563' }}>{info.name}</span>
              </div>
            ))}
          </div>
          <p className="text-xs mt-3" style={{ color: '#9ca3af' }}>
            ⚠️ 知乎专栏因平台限制，建议手动导入
          </p>
        </Card>

        {/* 任务列表 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">抓取任务</h2>
          <Button variant="ghost" size="sm" onClick={() => cleanupMutation.mutate()}>
            <Trash2 className="w-4 h-4 mr-1" />
            清理超时
          </Button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8" style={{ color: '#9ca3af' }}>加载中...</div>
        ) : tasks.length === 0 ? (
          <Card className="p-8 text-center">
            <p style={{ color: '#9ca3af' }}>暂无抓取任务</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {tasks.map((task: CaptureTask) => (
              <Card key={task.id} className="p-4">
                <div className="flex items-center gap-4">
                  {/* 状态图标 */}
                  <div className="flex-shrink-0">
                    {task.status === 'completed' && <CheckCircle className="w-5 h-5" style={{ color: '#10b981' }} />}
                    {task.status === 'failed' && <XCircle className="w-5 h-5" style={{ color: '#ef4444' }} />}
                    {task.status === 'processing' && <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#3b82f6' }} />}
                    {task.status === 'pending' && <Clock className="w-5 h-5" style={{ color: '#9ca3af' }} />}
                  </div>
                  
                  {/* URL */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ color: '#374151' }}>{task.url}</p>
                    <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>{formatDateShort(task.created_at)}</p>
                    {task.error_message && (
                      <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{task.error_message}</p>
                    )}
                  </div>
                  
                  {/* 平台标签 */}
                  {task.platform && PLATFORMS[task.platform as keyof typeof PLATFORMS] && (
                    <span
                      className="px-2.5 py-1 text-xs rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: `${PLATFORMS[task.platform as keyof typeof PLATFORMS].color}15`,
                        color: PLATFORMS[task.platform as keyof typeof PLATFORMS].color,
                      }}
                    >
                      {PLATFORMS[task.platform as keyof typeof PLATFORMS].name}
                    </span>
                  )}
                  
                  {/* 状态标签 */}
                  <span
                    className="px-2.5 py-1 text-xs rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: `${TASK_STATUS[task.status].color}15`,
                      color: TASK_STATUS[task.status].color,
                    }}
                  >
                    {TASK_STATUS[task.status].name}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
