'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

export default function NewNotePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    tags: '',
  });

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast('error', '请输入标题');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          content: form.content,
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
          source_platform: 'manual',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast('success', '笔记创建成功');
        router.push(`/notes/${data.id}`);
      } else {
        toast('error', '创建失败');
      }
    } catch {
      toast('error', '网络错误');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <Link href="/notes" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </Link>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? '保存中...' : '保存'}
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <Input
            label="标题"
            placeholder="输入笔记标题..."
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-[400px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="输入笔记内容..."
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
            />
          </div>

          <Input
            label="标签（逗号分隔）"
            placeholder="例如: 投资, 心得, 学习"
            value={form.tags}
            onChange={e => setForm({ ...form, tags: e.target.value })}
          />
        </div>
      </Card>
    </div>
  );
}
