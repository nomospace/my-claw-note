'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Power, PowerOff, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { RuleEditor } from '@/components/rules/RuleEditor';
import { useToast } from '@/components/ui/Toast';
import { formatDateShort } from '@/lib/utils';

interface Rule {
  id: string;
  name: string;
  trigger: {
    platform?: string;
    keywords?: string[];
  };
  actions: Array<{ type: string }>;
  is_active: boolean;
  created_at: string;
}

export default function RulesPage() {
  const [showEditor, setShowEditor] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rulesData, isLoading } = useQuery({
    queryKey: ['rules'],
    queryFn: () => fetch('/api/rules').then(res => res.json()),
  });

  const createMutation = useMutation({
    mutationFn: async (rule: any) => {
      const res = await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule),
      });
      if (!res.ok) throw new Error('创建失败');
      return res.json();
    },
    onSuccess: () => {
      toast('success', '规则创建成功');
      setShowEditor(false);
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
    onError: () => {
      toast('error', '创建失败');
    },
  });

  const rules: Rule[] = rulesData?.rules || [];

  const handleSaveRule = (rule: any) => {
    createMutation.mutate(rule);
  };

  const handleToggleActive = async (ruleId: string, isActive: boolean) => {
    try {
      await fetch(`/api/rules/${ruleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive }),
      });
      toast('success', isActive ? '规则已停用' : '规则已启用');
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    } catch {
      toast('error', '操作失败');
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (!confirm('确定要删除这个规则吗？')) return;
    try {
      await fetch(`/api/rules/${ruleId}`, { method: 'DELETE' });
      toast('success', '规则已删除');
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    } catch {
      toast('error', '删除失败');
    }
  };

  return (
    <div className="page-container">
      <div className="page-content">
        {/* 顶部 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="page-title mb-0">规则引擎</h1>
          <Button onClick={() => { setEditingRule(null); setShowEditor(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            新建规则
          </Button>
        </div>

        {/* 规则说明 */}
        <Card className="p-4 mb-6" style={{ backgroundColor: '#EBF5FF', borderColor: '#BFDBFE' }}>
          <p className="text-sm" style={{ color: '#1e40af' }}>
            规则引擎允许你自定义内容抓取后的处理流程。例如：抓取知乎回答后自动剔除广告、提取核心观点、生成金句等。
          </p>
        </Card>

        {/* 规则列表 */}
        {isLoading ? (
          <div className="text-center py-8" style={{ color: '#9ca3af' }}>加载中...</div>
        ) : rules.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-3xl mb-3">⚙️</div>
            <p className="mb-4" style={{ color: '#9ca3af' }}>暂无规则</p>
            <Button onClick={() => setShowEditor(true)}>创建第一条规则</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {rules.map(rule => (
              <Card key={rule.id} className={`p-4 ${!rule.is_active ? 'opacity-60' : ''}`}>
                <div className="flex items-center gap-4">
                  {/* 启用状态 */}
                  <button
                    onClick={() => handleToggleActive(rule.id, rule.is_active)}
                    className="cursor-pointer"
                  >
                    {rule.is_active ? (
                      <Power className="w-5 h-5" style={{ color: '#10b981' }} />
                    ) : (
                      <PowerOff className="w-5 h-5" style={{ color: '#9ca3af' }} />
                    )}
                  </button>
                  
                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium" style={{ color: '#111827' }}>{rule.name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: '#9ca3af' }}>
                      {rule.trigger?.platform && (
                        <span className="tag tag-gray">{rule.trigger.platform}</span>
                      )}
                      <span>{rule.actions?.length || 0} 个动作</span>
                      <span>{formatDateShort(rule.created_at)}</span>
                    </div>
                    
                    {/* 关键词 */}
                    {(rule.trigger?.keywords?.length ?? 0) > 0 && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {rule.trigger?.keywords?.map((kw: string) => (
                          <span key={kw} className="tag" style={{ backgroundColor: '#FEF3C7', color: '#92400e' }}>
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setEditingRule(rule); setShowEditor(true); }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(rule.id)}
                    >
                      <Trash2 className="w-4 h-4" style={{ color: '#ef4444' }} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* 规则编辑弹窗 */}
        <Modal
          open={showEditor}
          onClose={() => setShowEditor(false)}
          title={editingRule ? '编辑规则' : '新建规则'}
          size="lg"
        >
          <RuleEditor
            rule={editingRule || undefined}
            onSave={handleSaveRule}
            onCancel={() => setShowEditor(false)}
          />
        </Modal>
      </div>
    </div>
  );
}
