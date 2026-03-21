'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
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
    <div className="page-container">
      <div className="page-content">
        {/* 顶部操作栏 */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/notes" className="text-sm hover:underline" style={{ color: '#6b7280' }}>
            ← 返回列表
          </Link>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>

        <Card className="p-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>标题</label>
              <input
                type="text"
                placeholder="输入笔记标题..."
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>内容</label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg min-h-[400px] text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: '#e5e7eb' }}
                placeholder="输入笔记内容..."
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>标签（逗号分隔）</label>
              <input
                type="text"
                placeholder="例如: 投资, 心得, 学习"
                value={form.tags}
                onChange={e => setForm({ ...form, tags: e.target.value })}
                className="input"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
