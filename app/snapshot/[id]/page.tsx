'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';

export default function SnapshotPage() {
  const params = useParams();
  const snapshotId = params.id as string;

  const { data: snapshot, isLoading } = useQuery({
    queryKey: ['snapshot', snapshotId],
    queryFn: () => fetch(`/api/snapshot/${snapshotId}`).then(res => res.json()),
  });

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!snapshot || snapshot.error) {
    return (
      <div className="page-container text-center py-12">
        <p className="text-gray-500">快照不存在</p>
        <Link href="/notes">
          <Button className="mt-4">返回笔记列表</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container max-w-4xl">
      <div className="mb-6">
        <Link href={`/notes/${snapshotId}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          返回笔记
        </Link>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">原文快照</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            {formatDate(snapshot.meta.captureTime)}
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6 text-sm">
          <span className="text-gray-500">来源: {snapshot.meta.platform}</span>
          {snapshot.meta.url && (
            <a
              href={snapshot.meta.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              查看原文
            </a>
          )}
        </div>

        <div className="border-t pt-6">
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: snapshot.content }}
          />
        </div>
      </Card>
    </div>
  );
}
