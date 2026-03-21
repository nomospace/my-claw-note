'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
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
    <div className="page-container max-w-3xl mx-auto">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between mb-4">
        {/* 移动端返回在顶部标题栏 */}
        <div className="hidden md:block text-sm text-gray-500">
          ← 返回列表
        </div>
        <Button onClick={handleSave} disabled={saving} size="sm" className="ml-auto">
          <Save className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">{saving ? '保存中...' : '保存'}</span>
        </Button>
      </div>

      <Card className="p-4">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-[300px] md:min-h-[400px] text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
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
