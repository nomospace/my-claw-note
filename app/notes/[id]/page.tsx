'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Edit2, Trash2, Tag, Calendar, FileText } from 'lucide-react';
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

  const handleDelete = async () => {
    if (!confirm('确定要删除这篇笔记吗？')) return;
    
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
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!note || note.error) {
    return (
      <div className="page-container text-center py-12">
        <p className="text-gray-500">笔记不存在</p>
        <Link href="/notes">
          <Button className="mt-4">返回列表</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container max-w-4xl">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/notes" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </Link>
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
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>

      {/* 标题 */}
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{note.title}</h1>

      {/* 元信息 */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {formatDate(note.created_at)}
        </div>
        {note.source_platform && PLATFORMS[note.source_platform as keyof typeof PLATFORMS] && (
          <span
            className="px-2 py-1 rounded-full text-xs"
            style={{
              backgroundColor: `${PLATFORMS[note.source_platform as keyof typeof PLATFORMS].color}20`,
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
            className="flex items-center gap-1 text-blue-600 hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            原文链接
          </a>
        )}
      </div>

      {/* 标签 */}
      {note.tags?.length > 0 && (
        <div className="flex items-center gap-2 mb-6">
          <Tag className="w-4 h-4 text-gray-400" />
          <div className="flex flex-wrap gap-2">
            {note.tags.map((tag: string) => (
              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 摘要 */}
      {note.summary && (
        <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
          <h3 className="font-medium text-gray-900 mb-2">📝 AI 摘要</h3>
          <p className="text-gray-700">{note.summary}</p>
        </Card>
      )}

      {/* 正文 */}
      <Card className="p-6">
        <div className="prose prose-sm max-w-none">
          {note.content ? (
            <div dangerouslySetInnerHTML={{ __html: note.content.replace(/\n/g, '<br/>') }} />
          ) : (
            <p className="text-gray-400">暂无内容</p>
          )}
        </div>
      </Card>

      {/* 关键词 */}
      {note.keywords?.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">🔑 关键词</h3>
          <div className="flex flex-wrap gap-2">
            {note.keywords.map((kw: string) => (
              <span key={kw} className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
