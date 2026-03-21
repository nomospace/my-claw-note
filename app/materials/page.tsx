'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Copy, Plus, Archive, Search, Filter } from 'lucide-react';
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
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
  
  // 搜索过滤
  const filteredMaterials = searchQuery 
    ? materials.filter(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : materials;

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast('success', '已复制到剪贴板');
  };

  const handleAddMaterial = async () => {
    if (!newMaterial.content.trim()) {
      toast('error', '请输入素材内容');
      return;
    }

    try {
      await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMaterial),
      });
      toast('success', '素材添加成功');
      setShowAddModal(false);
      setNewMaterial({ type: 'quote', content: '' });
      refetch();
    } catch {
      toast('error', '添加失败');
    }
  };

  return (
    <div className="page-container">
      <div className="page-content">
        {/* 页面标题栏 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="page-title mb-1">素材库</h1>
            <p className="text-sm" style={{ color: '#6b7280' }}>
              自动提取的可复用素材，支持快速复制和分类筛选
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setShowSearch(!showSearch)}>
              <Search className="w-4 h-4" />
            </Button>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              添加素材
            </Button>
          </div>
        </div>

        {/* 搜索框 */}
        {showSearch && (
          <div className="mb-4">
            <input
              type="search"
              placeholder="搜索素材内容..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input"
            />
          </div>
        )}

        {/* 类型筛选 */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            variant={selectedType === null ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedType(null)}
          >
            全部
          </Button>
          {Object.entries(MATERIAL_TYPES).map(([key, info]) => (
            <Button
              key={key}
              variant={selectedType === key ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedType(key)}
            >
              {info.name}
            </Button>
          ))}
        </div>

        {/* 统计 */}
        <p className="text-sm mb-4" style={{ color: '#6b7280' }}>
          共 {filteredMaterials.length} 条素材
        </p>

        {/* 素材列表 */}
        {isLoading ? (
          <div className="text-center py-8" style={{ color: '#9ca3af' }}>加载中...</div>
        ) : filteredMaterials.length === 0 ? (
          <Card className="p-8 text-center">
            <Archive className="w-12 h-12 mx-auto mb-4" style={{ color: '#d1d5db' }} />
            <p className="mb-2" style={{ color: '#6b7280' }}>暂无素材</p>
            <p className="text-sm mb-4" style={{ color: '#9ca3af' }}>
              抓取内容后会自动提取素材
            </p>
            <Link href="/capture">
              <Button size="sm">去抓取内容</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {filteredMaterials.map(mat => {
              const typeInfo = MATERIAL_TYPES[mat.type as keyof typeof MATERIAL_TYPES];
              return (
                <Card key={mat.id} className="p-4 card-hover">
                  <div className="flex items-start gap-3 mb-3">
                    <span
                      className="px-2 py-0.5 text-xs rounded flex-shrink-0"
                      style={{
                        backgroundColor: typeInfo ? `${typeInfo.color}15` : '#f3f4f6',
                        color: typeInfo?.color || '#6b7280',
                      }}
                    >
                      {typeInfo?.name || mat.type}
                    </span>
                    <p className="text-sm flex-1 leading-relaxed" style={{ color: '#374151' }}>
                      {mat.content}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: '#f3f4f6' }}>
                    <span className="text-xs" style={{ color: '#9ca3af' }}>
                      使用 {mat.use_count} 次
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => handleCopy(mat.content)}>
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
              <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>类型</label>
              <select
                className="input"
                value={newMaterial.type}
                onChange={e => setNewMaterial({ ...newMaterial, type: e.target.value })}
              >
                {Object.entries(MATERIAL_TYPES).map(([key, info]) => (
                  <option key={key} value={key}>{info.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>内容</label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg min-h-[120px] text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: '#e5e7eb' }}
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
    </div>
  );
}
