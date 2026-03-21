'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export function QuickCapture() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (res.ok) {
        const data = await res.json();
        toast('success', '抓取任务已创建');
        setUrl('');
        if (data.noteId) {
          router.push(`/notes/${data.noteId}`);
        } else {
          router.push('/capture');
        }
      } else {
        const data = await res.json();
        toast('error', data.error || '抓取失败');
      }
    } catch {
      toast('error', '网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1">
        <Input
          type="url"
          placeholder="粘贴文章链接，支持微信/知乎/小红书..."
          value={url}
          onChange={e => setUrl(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={loading || !url.trim()}>
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Link2 className="w-4 h-4 mr-2" />
            抓取
          </>
        )}
      </Button>
    </form>
  );
}
