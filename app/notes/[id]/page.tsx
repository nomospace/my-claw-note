'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, ExternalLink, Edit2, Trash2, FileText, Link2, 
  Share2, Download, MoreVertical, Calendar, Tag
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PLATFORMS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

export default function NoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.id as string;

  const { data: note, isLoading } = useQuery({
    queryKey: ['note', noteId],
    queryFn: () => fetch(`/api/notes/${noteId}`).then(res => res.json()),
  });

  const { data: relatedData } = useQuery({
    queryKey: ['related', noteId],
    queryFn: () => fetch(`/api/notes/${noteId}/related`).then(res => res.json()),
    enabled: !!note && !note.error,
  });

  const relatedNotes = relatedData?.related || [];

  const handleDelete = async () => {
    if (!confirm('确定要删除这篇笔记吗？此操作不可恢复。')) return;
    try {
      await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
      router.push('/notes');
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-100 rounded w-1/2" />
            <div className="h-4 bg-gray-100 rounded w-1/3" />
            <div className="h-64 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!note || note.error) {
    return (
      <div className="page-container">
        <div className="page-content text-center py-12">
          <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: '#d1d5db' }} />
          <p className="mb-4" style={{ color: '#6b7280' }}>笔记不存在或已被删除</p>
          <Link href="/notes">
            <Button size="sm">返回笔记列表</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-content">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b" style={{ borderColor: '#e5e7eb' }}>
          <div className="flex items-center gap-3">
            <Link 
              href="/notes" 
              className="flex items-center gap-1 text-sm hover:underline"
              style={{ color: '#6b7280' }}
            >
              <ArrowLeft className="w-4 h-4" />
              返回列表
            </Link>
          </div>
          <div className="flex gap-2">
            {note.snapshot_path && (
              <Link href={`/snapshot/${noteId}`}>
                <Button variant="secondary" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  查看快照
                </Button>
              </Link>
            )}
            <Button variant="secondary" size="sm">
              <Edit2 className="w-4 h-4 mr-2" />
              编辑
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" style={{ color: '#ef4444' }} />
            </Button>
          </div>
        </div>

        {/* 标题 */}
        <h1 className="text-xl font-semibold mb-4" style={{ color: '#111827' }}>
          {note.title}
        </h1>

        {/* 元信息 */}
        <div className="flex items-center gap-4 mb-4 text-sm" style={{ color: '#6b7280' }}>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDate(note.created_at)}
          </div>
          {note.source_platform && PLATFORMS[note.source_platform as keyof typeof PLATFORMS] && (
            <span
              className="px-2.5 py-1 rounded-full text-xs"
              style={{
                backgroundColor: `${PLATFORMS[note.source_platform as keyof typeof PLATFORMS].color}15`,
                color: PLATFORMS[note.source_platform as keyof typeof PLATFORMS].color,
              }}
            >
              {PLATFORMS[note.source_platform as keyof typeof PLATFORMS].name}
            </span>
          )}
          {note.source_url && (
            <a
              href={note.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:underline"
              style={{ color: '#3b82f6' }}
            >
              <ExternalLink className="w-3 h-3" />
              原文链接
            </a>
          )}
        </div>

        {/* 标签 */}
        {note.tags?.length > 0 && (
          <div className="flex items-center gap-2 mb-6">
            <Tag className="w-4 h-4" style={{ color: '#9ca3af' }} />
            <div className="flex flex-wrap gap-2">
              {note.tags.map((tag: string) => (
                <span key={tag} className="tag tag-gray">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* AI 摘要 */}
        {note.summary && (
          <Card 
            className="p-4 mb-6" 
            style={{ backgroundColor: '#EBF5FF', borderColor: '#BFDBFE' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium" style={{ color: '#1e40af' }}>📝 AI 摘要</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#1e40af' }}>
              {note.summary}
            </p>
          </Card>
        )}

        {/* 正文内容 */}
        <Card className="p-6 mb-6">
          <div className="prose prose-sm max-w-none">
            {note.content ? (
              <div 
                className="text-sm leading-relaxed"
                style={{ color: '#374151' }}
                dangerouslySetInnerHTML={{ __html: note.content.replace(/\n/g, '<br/>') }} 
              />
            ) : (
              <p style={{ color: '#9ca3af' }}>暂无内容</p>
            )}
          </div>
        </Card>

        {/* 关键词 */}
        {note.keywords?.length > 0 && (
          <Card className="p-4 mb-6">
            <h3 className="text-sm font-medium mb-3" style={{ color: '#6b7280' }}>🔑 关键词</h3>
            <div className="flex flex-wrap gap-2">
              {note.keywords.map((kw: string) => (
                <span 
                  key={kw} 
                  className="tag"
                  style={{ backgroundColor: '#FEF3C7', color: '#92400e' }}
                >
                  {kw}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* 相关笔记 */}
        {relatedNotes.length > 0 && (
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: '#6b7280' }}>
              <Link2 className="w-4 h-4" />
              相关笔记
            </h3>
            <div className="space-y-2">
              {relatedNotes.map((rel: any) => (
                <Link
                  key={rel.id}
                  href={`/notes/${rel.id}`}
                  className="flex items-center justify-between p-3 rounded-lg transition-colors"
                  style={{ backgroundColor: '#f9fafb' }}
                >
                  <span className="text-sm font-medium" style={{ color: '#374151' }}>
                    {rel.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ 
                        backgroundColor: rel.relation_type === 'similar' ? '#DCFCE7' : '#DBEAFE',
                        color: rel.relation_type === 'similar' ? '#166534' : '#1e40af'
                      }}
                    >
                      {rel.relation_type === 'similar' ? '相似' : '关联'}
                    </span>
                    <span className="text-xs" style={{ color: '#9ca3af' }}>
                      {Math.round(rel.similarity_score * 100)}%
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
