'use client';

import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { PLATFORMS } from '@/lib/constants';

const ACTION_TYPES = [
  { value: 'denoise', label: '内容降噪', description: '去除广告、推广等无关内容' },
  { value: 'extract', label: '提取信息', description: '提取摘要、关键词、素材' },
  { value: 'generate', label: '生成内容', description: '生成金句、观点总结' },
  { value: 'transform', label: '内容转换', description: '格式化、重新排版' },
];

interface RuleEditorProps {
  rule?: any;
  onSave: (rule: any) => void;
  onCancel: () => void;
}

export function RuleEditor({ rule, onSave, onCancel }: RuleEditorProps) {
  const [form, setForm] = useState<any>(rule || {
    name: '',
    trigger: {},
    actions: [],
    output: {},
    is_active: true,
  });

  const [newKeyword, setNewKeyword] = useState('');
  const [newTag, setNewTag] = useState('');

  const addAction = (type: string) => {
    setForm({
      ...form,
      actions: [...(form.actions || []), { type, options: {} }],
    });
  };

  const removeAction = (index: number) => {
    setForm({
      ...form,
      actions: form.actions.filter((_: any, i: number) => i !== index),
    });
  };

  const addKeyword = () => {
    if (newKeyword.trim()) {
      setForm({
        ...form,
        trigger: {
          ...form.trigger,
          keywords: [...(form.trigger?.keywords || []), newKeyword.trim()],
        },
      });
      setNewKeyword('');
    }
  };

  const removeKeyword = (index: number) => {
    setForm({
      ...form,
      trigger: {
        ...form.trigger,
        keywords: form.trigger.keywords?.filter((_: any, i: number) => i !== index),
      },
    });
  };

  const addTag = () => {
    if (newTag.trim()) {
      setForm({
        ...form,
        output: {
          ...form.output,
          tags: [...(form.output?.tags || []), newTag.trim()],
        },
      });
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setForm({
      ...form,
      output: {
        ...form.output,
        tags: form.output.tags?.filter((_: any, i: number) => i !== index),
      },
    });
  };

  return (
    <div className="space-y-6">
      <Input
        label="规则名称"
        placeholder="例如：知乎回答处理规则"
        value={form.name || ''}
        onChange={e => setForm({ ...form, name: e.target.value })}
      />

      <Card className="p-4">
        <h3 className="font-medium text-gray-900 mb-4">触发条件</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">平台</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={form.trigger?.platform || ''}
              onChange={e => setForm({
                ...form,
                trigger: { ...form.trigger, platform: e.target.value || undefined },
              })}
            >
              <option value="">全部平台</option>
              {Object.entries(PLATFORMS).filter(([k]) => k !== 'manual').map(([key, info]) => (
                <option key={key} value={key}>{info.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">内容类型</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={form.trigger?.type || ''}
              onChange={e => setForm({
                ...form,
                trigger: { ...form.trigger, type: e.target.value || undefined },
              })}
            >
              <option value="">全部类型</option>
              <option value="article">文章</option>
              <option value="answer">回答</option>
              <option value="note">笔记</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">关键词触发</label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="输入关键词"
                value={newKeyword}
                onChange={e => setNewKeyword(e.target.value)}
              />
              <Button variant="secondary" onClick={addKeyword}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.trigger?.keywords?.map((kw: string, i: number) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                  {kw}
                  <button onClick={() => removeKeyword(i)} className="text-gray-400 hover:text-red-500">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-medium text-gray-900 mb-4">执行动作</h3>
        <div className="flex gap-2 mb-4 flex-wrap">
          {ACTION_TYPES.map(action => (
            <Button key={action.value} variant="secondary" size="sm" onClick={() => addAction(action.value)}>
              <Plus className="w-4 h-4 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>
        <div className="space-y-2">
          {form.actions?.map((action: any, index: number) => (
            <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
              <div className="flex-1">
                <span className="font-medium text-gray-700">
                  {ACTION_TYPES.find(t => t.value === action.type)?.label}
                </span>
                <p className="text-xs text-gray-500">
                  {ACTION_TYPES.find(t => t.value === action.type)?.description}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeAction(index)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
          {(!form.actions || form.actions.length === 0) && (
            <p className="text-sm text-gray-500 text-center py-4">点击上方按钮添加动作</p>
          )}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-medium text-gray-900 mb-4">输出设置</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">自动添加标签</label>
          <div className="flex gap-2 mb-2">
            <Input placeholder="输入标签" value={newTag} onChange={e => setNewTag(e.target.value)} />
            <Button variant="secondary" onClick={addTag}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.output?.tags?.map((tag: string, i: number) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded">
                {tag}
                <button onClick={() => removeTag(i)} className="text-blue-400 hover:text-red-500">×</button>
              </span>
            ))}
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>取消</Button>
        <Button onClick={() => onSave(form)} disabled={!form.name?.trim()}>保存规则</Button>
      </div>
    </div>
  );
}
