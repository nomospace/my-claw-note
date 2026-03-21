'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Upload, Database, Folder, Plus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

interface Category {
  id: string;
  name: string;
  icon: string | null;
  sort_order: number;
}

export default function SettingsPage() {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const { toast } = useToast();

  const { data: categoriesData, refetch } = useQuery({
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
      setShowCategoryModal(false);
      refetch();
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
    <div className="page-container max-w-2xl mx-auto">
      {/* Header - 移动端隐藏 */}
      <div className="mb-4 hidden md:block">
        <h1 className="text-xl font-bold text-gray-900">设置</h1>
        <p className="text-gray-500 text-sm">管理分类、标签和数据</p>
      </div>

      {/* 分类管理 */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium text-gray-900 flex items-center gap-2">
            <Folder className="w-4 h-4" />
            分类管理
          </h2>
          <Button variant="ghost" size="sm" onClick={() => setShowCategoryModal(true)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-1">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">{cat.name}</span>
              <span className="text-xs text-gray-400">{cat.id}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* 数据管理 */}
      <Card className="p-4 mb-4">
        <h2 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Database className="w-4 h-4" />
          数据管理
        </h2>

        <div className="space-y-2">
          {/* 导出数据 */}
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="text-left">
              <p className="font-medium text-gray-900 text-sm">导出数据</p>
              <p className="text-xs text-gray-500">导出所有笔记和素材</p>
            </div>
            <Download className="w-4 h-4 text-gray-400" />
          </button>

          {/* 导入数据 */}
          <button
            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="text-left">
              <p className="font-medium text-gray-900 text-sm">导入数据</p>
              <p className="text-xs text-gray-500">从备份文件恢复</p>
            </div>
            <Upload className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </Card>

      {/* 关于 */}
      <Card className="p-4">
        <h2 className="font-medium text-gray-900 mb-2">关于</h2>
        <div className="text-xs text-gray-500 space-y-1">
          <p>MyClawNote - 个人知识管理工具</p>
          <p>版本: 0.1.0</p>
          <p>Powered by OpenClaw</p>
        </div>
      </Card>

      {/* 添加分类弹窗 */}
      <Modal open={showCategoryModal} onClose={() => setShowCategoryModal(false)} title="添加分类">
        <div className="space-y-4">
          <Input
            label="分类名称"
            placeholder="输入分类名称"
            value={newCategoryName}
            onChange={e => setNewCategoryName(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>取消</Button>
            <Button onClick={handleAddCategory}>添加</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
