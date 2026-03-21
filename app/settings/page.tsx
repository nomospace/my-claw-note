'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Upload, Database, Folder, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

interface Category {
  id: string;
  name: string;
  icon: string | null;
  sort_order: number;
}

export default function SettingsPage() {
  const [newCategoryName, setNewCategoryName] = useState('');
  const { toast } = useToast();

  const { data: categoriesData, refetch: refetchCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then(res => res.json()),
  });

  const categories: Category[] = categoriesData?.categories || [];

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast('error', '请输入分类名称');
      return;
    }

    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName }),
      });
      toast('success', '分类添加成功');
      setNewCategoryName('');
      refetchCategories();
    } catch {
      toast('error', '添加失败');
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch('/api/export');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `myclawnote-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast('success', '导出成功');
    } catch {
      toast('error', '导出失败');
    }
  };

  return (
    <div className="page-container max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">设置</h1>
        <p className="text-gray-500 mt-1">管理分类、标签和数据</p>
      </div>

      {/* 分类管理 */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Folder className="w-5 h-5" />
          分类管理
        </h2>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="新分类名称"
            value={newCategoryName}
            onChange={e => setNewCategoryName(e.target.value)}
          />
          <Button onClick={handleAddCategory}>添加</Button>
        </div>

        <div className="space-y-2">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">{cat.name}</span>
              <span className="text-xs text-gray-400">ID: {cat.id}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* 数据管理 */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          数据管理
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">导出数据</h3>
              <p className="text-sm text-gray-500">导出所有笔记和素材</p>
            </div>
            <Button variant="secondary" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              导出
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">导入数据</h3>
              <p className="text-sm text-gray-500">从备份文件恢复</p>
            </div>
            <Button variant="secondary">
              <Upload className="w-4 h-4 mr-2" />
              导入
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <h3 className="font-medium text-red-900">清空数据</h3>
              <p className="text-sm text-red-500">删除所有数据（不可恢复）</p>
            </div>
            <Button variant="danger">
              <RefreshCw className="w-4 h-4 mr-2" />
              清空
            </Button>
          </div>
        </div>
      </Card>

      {/* 关于 */}
      <Card className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">关于</h2>
        <div className="text-sm text-gray-600 space-y-2">
          <p>MyClawNote - 个人知识管理工具</p>
          <p>版本: 0.1.0</p>
          <p>技术栈: Next.js 14 + React 18 + Tailwind CSS + sql.js</p>
          <p>Powered by OpenClaw</p>
        </div>
      </Card>
    </div>
  );
}
