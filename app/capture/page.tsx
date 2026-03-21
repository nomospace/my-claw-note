'use client';

import { useState, useEffect } from 'react';
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
  const [urls, setUrls] = useState('');
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 获取任务列表
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['capture-tasks'],
    queryFn: () => fetch('/api/capture').then(res => res.json()),
    refetchInterval: 5000,
  });

  // 清理超时任务
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

  // 抓取突变
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
        toast('success', `抓取成功：${data.title}`);
      } else if (data.status === 'manual_required') {
        toast('info', '不支持的平台，请手动导入');
      } else {
        toast('info', '任务已创建，处理中...');
      }
      setUrl('');
      queryClient.invalidateQueries({ queryKey: ['capture-tasks'] });
    },
    onError: () => {
      toast('error', '抓取失败，请检查链接');
    },
  });

  // 页面加载时自动清理超时任务
  useEffect(() => {
    cleanupMutation.mutate();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'single' && url.trim()) {
      captureMutation.mutate(url.trim());
    } else if (mode === 'batch' && urls.trim()) {
      const urlList = urls.split('\n').filter(u => u.trim());
      urlList.forEach(u => captureMutation.mutate(u.trim()));
      setUrls('');
    }
  };

  const tasks = tasksData?.tasks || [];

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">内容抓取</h1>
        <p className="text-gray-500 mt-1">支持微信公众号、知乎专栏、知乎问答</p>
      </div>

      {/* 模式切换 */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={mode === 'single' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setMode('single')}
        >
          单链接抓取
        </Button>
        <Button
          variant={mode === 'batch' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setMode('batch')}
        >
          批量导入
        </Button>
      </div>

      {/* 抓取表单 */}
      <Card className="p-6 mb-6">
        <form onSubmit={handleSubmit}>
          {mode === 'single' ? (
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
              >
                {captureMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Link2 className="w-4 h-4 mr-2" />
                    抓取
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px]"
                placeholder="每行一个链接..."
                value={urls}
                onChange={e => setUrls(e.target.value)}
              />
              <div className="mt-4 flex justify-end">
                <Button
                  type="submit"
                  disabled={captureMutation.isPending || !urls.trim()}
                >
                  {captureMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  批量抓取
                </Button>
              </div>
            </div>
          )}
        </form>
      </Card>

      {/* 支持平台说明 */}
      <Card className="p-4 mb-6">
        <h3 className="font-medium text-gray-900 mb-3">支持的平台</h3>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(PLATFORMS).filter(([k]) => k !== 'manual').map(([key, info]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${info.color}20` }}
              >
                <Link2 className="w-4 h-4" style={{ color: info.color }} />
              </div>
              <span className="text-sm text-gray-700">{info.name}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          ⚠️ 知乎专栏因平台反爬限制，建议使用手动导入
        </p>
      </Card>

      {/* 任务列表 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">抓取任务</h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => cleanupMutation.mutate()}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            清理超时任务
          </Button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">加载中...</div>
        ) : tasks.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">暂无抓取任务</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {tasks.map((task: CaptureTask) => (
              <Card key={task.id} className="p-4" hover={task.status === 'completed'}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{task.url}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDateShort(task.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.platform && PLATFORMS[task.platform as keyof typeof PLATFORMS] && (
                      <span
                        className="px-2 py-1 text-xs rounded-full"
                        style={{
                          backgroundColor: `${PLATFORMS[task.platform as keyof typeof PLATFORMS].color}20`,
                          color: PLATFORMS[task.platform as keyof typeof PLATFORMS].color,
                        }}
                      >
                        {PLATFORMS[task.platform as keyof typeof PLATFORMS].name}
                      </span>
                    )}
                    <span
                      className="flex items-center gap-1 px-2 py-1 text-xs rounded-full"
                      style={{
                        backgroundColor: `${TASK_STATUS[task.status].color}20`,
                        color: TASK_STATUS[task.status].color,
                      }}
                    >
                      {task.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                      {task.status === 'failed' && <XCircle className="w-3 h-3" />}
                      {task.status === 'processing' && <Loader2 className="w-3 h-3 animate-spin" />}
                      {task.status === 'pending' && <Clock className="w-3 h-3" />}
                      {TASK_STATUS[task.status].name}
                    </span>
                  </div>
                </div>
                {task.error_message && (
                  <p className="text-xs text-red-500 mt-2">{task.error_message}</p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
