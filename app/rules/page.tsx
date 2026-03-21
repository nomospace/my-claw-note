'use client';

import { useQuery } from '@tanstack/react-query';
import { Plus, Power, PowerOff, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatDateShort } from '@/lib/utils';

interface Rule {
  id: string;
  name: string;
  trigger: string;
  actions: string;
  is_active: boolean;
  created_at: string;
}

export default function RulesPage() {
  const { data: rulesData, isLoading } = useQuery({
    queryKey: ['rules'],
    queryFn: () => fetch('/api/rules').then(res => res.json()),
  });

  const rules: Rule[] = rulesData?.rules || [];

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">规则引擎</h1>
          <p className="text-gray-500 mt-1">自定义内容处理流程</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          新建规则
        </Button>
      </div>

      {/* 规则说明 */}
      <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
        <h3 className="font-medium text-gray-900 mb-2">规则引擎是什么？</h3>
        <p className="text-sm text-gray-600">
          规则引擎允许你自定义内容抓取后的处理流程。例如：抓取知乎回答后自动剔除广告、提取核心观点、生成金句等。
        </p>
      </Card>

      {/* 规则列表 */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">加载中...</div>
      ) : rules.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">暂无规则</p>
          <Button className="mt-4">创建第一条规则</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {rules.map(rule => (
            <Card key={rule.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {rule.is_active ? (
                    <Power className="w-5 h-5 text-green-500" />
                  ) : (
                    <PowerOff className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900">{rule.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      创建于 {formatDateShort(rule.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
              
              {/* 规则详情 */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-sm">
                  <span className="text-gray-500">触发条件：</span>
                  <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
                    {rule.trigger}
                  </code>
                </div>
                <div className="text-sm mt-2">
                  <span className="text-gray-500">执行动作：</span>
                  <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
                    {rule.actions.slice(0, 50)}...
                  </code>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
