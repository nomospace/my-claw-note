'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Upload, Database, Folder, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
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
    <div className="page-container">
      <div className="page-content">
        {/* Header */}
        <h1 className="page-title">设置</h1>

        {/* 分类管理 */}
        <Card className="p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium flex items-center gap-2" style={{ color: '#111827' }}>
              <Folder className="w-4 h-4" />
              分类管理
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setShowCategoryModal(true)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {categories.map(cat => (
              <div 
                key={cat.id} 
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: '#f9fafb' }}
              >
                <span className="text-sm" style={{ color: '#374151' }}>{cat.name}</span>
                <span className="text-xs" style={{ color: '#9ca3af' }}>{cat.id}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* 数据管理 */}
        <Card className="p-5 mb-6">
          <h2 className="font-medium mb-4 flex items-center gap-2" style={{ color: '#111827' }}>
            <Database className="w-4 h-4" />
            数据管理
          </h2>

          <div className="space-y-2">
            {/* 导出数据 */}
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-between p-3 rounded-lg transition-colors"
              style={{ backgroundColor: '#f9fafb' }}
            >
              <div className="text-left">
                <p className="font-medium text-sm" style={{ color: '#111827' }}>导出数据</p>
                <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>导出所有笔记和素材</p>
              </div>
              <Download className="w-4 h-4" style={{ color: '#9ca3af' }} />
            </button>

            {/* 导入数据 */}
            <button
              className="w-full flex items-center justify-between p-3 rounded-lg transition-colors"
              style={{ backgroundColor: '#f9fafb' }}
            >
              <div className="text-left">
                <p className="font-medium text-sm" style={{ color: '#111827' }}>导入数据</p>
                <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>从备份文件恢复</p>
              </div>
              <Upload className="w-4 h-4" style={{ color: '#9ca3af' }} />
            </button>
          </div>
        </Card>

        {/* 关于 */}
        <Card className="p-5">
          <h2 className="font-medium mb-3" style={{ color: '#111827' }}>关于</h2>
          <div className="text-xs space-y-1" style={{ color: '#6b7280' }}>
            <p>MyClawNote - 个人知识管理工具</p>
            <p>版本: 1.0.0</p>
            <p>技术栈: Next.js 14 + React 18 + Tailwind CSS + sql.js</p>
            <p>Powered by OpenClaw</p>
          </div>
        </Card>

        {/* 添加分类弹窗 */}
        <Modal open={showCategoryModal} onClose={() => setShowCategoryModal(false)} title="添加分类">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>分类名称</label>
              <input
                type="text"
                placeholder="输入分类名称"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                className="input"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>取消</Button>
              <Button onClick={handleAddCategory}>添加</Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
