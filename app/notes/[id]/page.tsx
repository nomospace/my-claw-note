'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ExternalLink, Edit2, Trash2, Tag, Calendar, FileText, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PLATFORMS } from '@/lib/constants';
import { formatDateShort } from '@/lib/utils';

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
      <div className="page-container max-w-3xl mx-auto">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-48 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!note || note.error) {
    return (
      <div className="page-container text-center py-12">
        <p className="text-gray-400">笔记不存在</p>
        <Link href="/notes">
          <Button className="mt-4" size="sm">返回列表</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container max-w-3xl mx-auto">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between mb-4">
        {/* 移动端返回按钮在顶部标题栏 */}
        <div className="hidden md:block">
          <Link href="/notes" className="text-sm text-gray-500 hover:text-gray-700">
            ← 返回列表
          </Link>
        </div>
        <div className="flex gap-2 ml-auto">
          {note.snapshot_path && (
            <Link href={`/snapshot/${noteId}`}>
              <Button variant="secondary" size="sm">
                <FileText className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">快照</span>
              </Button>
            </Link>
          )}
          <Button variant="secondary" size="sm">
            <Edit2 className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">编辑</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>

      {/* 标题 */}
      <h1 className="text-lg md:text-2xl font-bold text-gray-900 mb-3">{note.title}</h1>

      {/* 元信息 */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDateShort(note.created_at)}
        </span>
        {note.source_platform && PLATFORMS[note.source_platform as keyof typeof PLATFORMS] && (
          <span
            className="px-2 py-0.5 rounded-full text-xs"
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
            className="flex items-center gap-1 text-blue-600"
          >
            <ExternalLink className="w-3 h-3" />
            原文
          </a>
        )}
      </div>

      {/* 标签 */}
      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {note.tags.map((tag: string) => (
            <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 摘要 */}
      {note.summary && (
        <Card className="p-3 mb-4 bg-blue-50 border-blue-200">
          <p className="text-xs font-medium text-blue-800 mb-1">📝 AI 摘要</p>
          <p className="text-sm text-blue-700">{note.summary}</p>
        </Card>
      )}

      {/* 正文 */}
      <Card className="p-4 mb-4">
        <div className="prose prose-sm max-w-none text-sm md:text-base">
          {note.content ? (
            <div dangerouslySetInnerHTML={{ __html: note.content.replace(/\n/g, '<br/>') }} />
          ) : (
            <p className="text-gray-400">暂无内容</p>
          )}
        </div>
      </Card>

      {/* 关键词 */}
      {note.keywords?.length > 0 && (
        <Card className="p-3 mb-4">
          <p className="text-xs font-medium text-gray-500 mb-2">🔑 关键词</p>
          <div className="flex flex-wrap gap-1.5">
            {note.keywords.map((kw: string) => (
              <span key={kw} className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded">
                {kw}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* 相关笔记 */}
      {relatedNotes.length > 0 && (
        <Card className="p-3">
          <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
            <Link2 className="w-3 h-3" />
            相关笔记
          </p>
          <div className="space-y-1">
            {relatedNotes.map((rel: any) => (
              <Link
                key={rel.id}
                href={`/notes/${rel.id}`}
                className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm text-gray-700 truncate">{rel.title}</span>
                <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                  {Math.round(rel.similarity_score * 100)}%
                </span>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
