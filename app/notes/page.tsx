'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Search, Plus, FolderOpen, Filter, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PLATFORMS } from '@/lib/constants';
import { formatDateShort } from '@/lib/utils';

interface Note {
  id: string;
  title: string;
  summary: string | null;
  source_platform: string | null;
  tags: string[];
  created_at: string;
}

export default function NotesPage() {
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const { data: notesData, isLoading } = useQuery({
    queryKey: ['notes', search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const res = await fetch(`/api/notes?${params}`);
      return res.json();
    },
  });

  const notes: Note[] = notesData?.notes || [];
  const total = notesData?.total || 0;

  return (
    <div className="page-container">
      <div className="page-content">
        {/* 页面标题栏 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="page-title mb-1">笔记</h1>
            <p className="text-sm" style={{ color: '#6b7280' }}>
              管理你的知识笔记，支持搜索、筛选和批量操作
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setShowSearch(!showSearch)}>
              <Search className="w-4 h-4" />
            </Button>
            <Link href="/notes/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                新建笔记
              </Button>
            </Link>
          </div>
        </div>

        {/* 搜索框 */}
        {showSearch && (
          <div className="mb-4">
            <input
              type="search"
              placeholder="搜索笔记标题或内容..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input"
              autoFocus
            />
          </div>
        )}

        {/* 统计 */}
        <p className="text-sm mb-4" style={{ color: '#6b7280' }}>
          共 {total} 条笔记
        </p>

        {/* 笔记列表 */}
        {isLoading ? (
          <div className="text-center py-8" style={{ color: '#9ca3af' }}>加载中...</div>
        ) : notes.length === 0 ? (
          <Card className="p-8 text-center">
            <FolderOpen className="w-12 h-12 mx-auto mb-4" style={{ color: '#d1d5db' }} />
            <p className="mb-2" style={{ color: '#6b7280' }}>暂无笔记</p>
            <p className="text-sm mb-4" style={{ color: '#9ca3af' }}>
              开始抓取内容或手动创建笔记
            </p>
            <div className="flex gap-2 justify-center">
              <Link href="/capture">
                <Button variant="secondary" size="sm">去抓取</Button>
              </Link>
              <Link href="/notes/new">
                <Button size="sm">新建笔记</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-2">
            {notes.map(note => (
              <Link key={note.id} href={`/notes/${note.id}`}>
                <Card className="p-4 card-hover cursor-pointer">
                  <div className="flex items-start gap-4">
                    {/* 内容区 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate" style={{ color: '#111827' }}>
                        {note.title}
                      </h3>
                      {note.summary && (
                        <p className="text-sm mt-1 line-clamp-2" style={{ color: '#6b7280' }}>
                          {note.summary}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="text-xs" style={{ color: '#9ca3af' }}>
                          {formatDateShort(note.created_at)}
                        </span>
                        {note.tags?.length > 0 && (
                          <div className="flex gap-1">
                            {note.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="tag tag-gray">
                                {tag}
                              </span>
                            ))}
                            {note.tags.length > 3 && (
                              <span className="text-xs" style={{ color: '#9ca3af' }}>
                                +{note.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* 平台标签 */}
                    {note.source_platform && PLATFORMS[note.source_platform as keyof typeof PLATFORMS] && (
                      <span
                        className="px-2.5 py-1 text-xs rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: `${PLATFORMS[note.source_platform as keyof typeof PLATFORMS].color}15`,
                          color: PLATFORMS[note.source_platform as keyof typeof PLATFORMS].color,
                        }}
                      >
                        {PLATFORMS[note.source_platform as keyof typeof PLATFORMS].name}
                      </span>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
