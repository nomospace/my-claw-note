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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">规则引擎</h1>
          <p className="text-gray-500 mt-1">自定义内容处理流程</p>
        </div>
        <Button onClick={() => { setEditingRule(null); setShowEditor(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          新建规则
        </Button>
      </div>

      {/* 规则说明 */}
      <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
        <h3 className="font-medium text-gray-900 mb-2">📋 规则引擎是什么？</h3>
        <p className="text-sm text-gray-600 mb-3">
          规则引擎允许你自定义内容抓取后的处理流程。当新内容抓取后，系统会自动匹配规则并执行相应动作。
        </p>
        <div className="text-sm text-gray-600">
          <strong>示例：</strong>抓取知乎回答后 → 自动剔除广告 → 提取核心观点 → 生成金句 → 添加"知乎"标签
        </div>
      </Card>

      {/* 规则列表 */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">加载中...</div>
      ) : rules.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-4xl mb-4">⚙️</div>
          <p className="text-gray-500 mb-4">暂无规则</p>
          <Button onClick={() => setShowEditor(true)}>创建第一条规则</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {rules.map(rule => (
            <Card key={rule.id} className={`p-4 ${!rule.is_active ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleActive(rule.id, rule.is_active)}
                    className="cursor-pointer"
                  >
                    {rule.is_active ? (
                      <Power className="w-5 h-5 text-green-500" />
                    ) : (
                      <PowerOff className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <div>
                    <h3 className="font-medium text-gray-900">{rule.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {rule.trigger?.platform && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          {rule.trigger.platform}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {rule.actions?.length || 0} 个动作
                      </span>
                      <span className="text-xs text-gray-400">
                        创建于 {formatDateShort(rule.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
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
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
              
              {/* 规则详情 */}
              {(rule.trigger?.keywords?.length || rule.actions?.length) && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  {(rule.trigger?.keywords?.length || 0) > 0 && (
                    <div className="text-sm mb-2">
                      <span className="text-gray-500">触发关键词：</span>
                      {rule.trigger.keywords?.map(kw => (
                        <span key={kw} className="mr-2 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded">
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                  {rule.actions?.length > 0 && (
                    <div className="text-sm">
                      <span className="text-gray-500">执行动作：</span>
                      {rule.actions.map((action, i) => (
                        <span key={i} className="mr-2 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                          {action.type}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
  );
}
