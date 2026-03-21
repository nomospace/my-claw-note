'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Copy, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { MATERIAL_TYPES } from '@/lib/constants';

interface Material {
  id: string;
  type: string;
  content: string;
  tags: string[];
  use_count: number;
  created_at: string;
}

export default function MaterialsPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ type: 'quote', content: '' });
  const { toast } = useToast();

  const { data: materialsData, isLoading, refetch } = useQuery({
    queryKey: ['materials', selectedType],
    queryFn: async () => {
      const params = selectedType ? `?type=${selectedType}` : '';
      return fetch(`/api/materials${params}`).then(res => res.json());
    },
  });

  const materials: Material[] = materialsData?.materials || [];

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast('success', '已复制');
  };

  const handleAddMaterial = async () => {
    if (!newMaterial.content.trim()) {
      toast('error', '请输入内容');
      return;
    }

    try {
      await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMaterial),
      });
      toast('success', '添加成功');
      setShowAddModal(false);
      setNewMaterial({ type: 'quote', content: '' });
      refetch();
    } catch {
      toast('error', '添加失败');
    }
  };

  return (
    <div className="page-container max-w-3xl mx-auto">
      {/* 顶部 */}
      <div className="flex items-center justify-between mb-4">
        <div className="hidden md:block">
          <h1 className="text-xl font-bold text-gray-900">素材库</h1>
          <p className="text-gray-500 text-sm">自动提取的可复用素材</p>
        </div>
        <Button size="sm" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">添加素材</span>
        </Button>
      </div>

      {/* 类型筛选 - 横向滚动 */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        <Button
          variant={selectedType === null ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setSelectedType(null)}
          className="flex-shrink-0"
        >
          全部
        </Button>
        {Object.entries(MATERIAL_TYPES).map(([key, info]) => (
          <Button
            key={key}
            variant={selectedType === key ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedType(key)}
            className="flex-shrink-0"
          >
            {info.name}
          </Button>
        ))}
      </div>

      {/* 素材列表 */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-400">加载中...</div>
      ) : materials.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-400 text-sm">暂无素材</p>
          <p className="text-xs text-gray-300 mt-2">抓取内容后会自动提取素材</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {materials.map(mat => {
            const typeInfo = MATERIAL_TYPES[mat.type as keyof typeof MATERIAL_TYPES];
            return (
              <Card key={mat.id} className="p-3 md:p-4">
                <div className="flex items-start gap-2 mb-2">
                  <span
                    className="px-2 py-0.5 text-xs rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: typeInfo ? `${typeInfo.color}20` : '#eee',
                      color: typeInfo?.color || '#666',
                    }}
                  >
                    {typeInfo?.name || mat.type}
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed flex-1">{mat.content}</p>
                </div>
                <div className="flex items-center justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(mat.content)}
                    className="text-xs"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    复制
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 添加素材弹窗 */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="添加素材" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base"
              value={newMaterial.type}
              onChange={e => setNewMaterial({ ...newMaterial, type: e.target.value })}
            >
              {Object.entries(MATERIAL_TYPES).map(([key, info]) => (
                <option key={key} value={key}>{info.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-[100px] text-base"
              placeholder="输入素材内容..."
              value={newMaterial.content}
              onChange={e => setNewMaterial({ ...newMaterial, content: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>取消</Button>
            <Button onClick={handleAddMaterial}>添加</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
