'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Search, Plus, FolderOpen, Filter } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PLATFORMS } from '@/lib/constants';
import { formatDateShort } from '@/lib/utils';

interface Note {
  id: string;
  title: string;
  summary: string | null;
  source_platform: string | null;
  category_id: string | null;
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
    <div className="page-container max-w-3xl mx-auto">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="hidden md:block">
          <h1 className="text-xl font-bold text-gray-900">笔记</h1>
          <p className="text-gray-500 text-sm">共 {total} 条笔记</p>
        </div>
        
        {/* 移动端显示数量 */}
        <div className="md:hidden text-sm text-gray-500">
          {total} 条笔记
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="w-4 h-4" />
          </Button>
          <Link href="/notes/new">
            <Button size="sm">
              <Plus className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">新建</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 搜索框 */}
      {showSearch && (
        <div className="mb-4">
          <Input
            type="search"
            placeholder="搜索笔记..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>
      )}

      {/* 笔记列表 */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-400">加载中...</div>
      ) : notes.length === 0 ? (
        <Card className="p-8 text-center">
          <FolderOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm mb-4">暂无笔记</p>
          <Link href="/capture">
            <Button size="sm">去抓取内容</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-2">
          {notes.map(note => (
            <Link key={note.id} href={`/notes/${note.id}`}>
              <Card className="p-3 md:p-4" hover>
                <div className="flex items-start gap-3">
                  {/* 内容区 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm md:text-base line-clamp-2">
                      {note.title}
                    </h3>
                    {note.summary && (
                      <p className="text-xs md:text-sm text-gray-500 mt-1 line-clamp-2 hidden md:block">
                        {note.summary}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-xs text-gray-400">{formatDateShort(note.created_at)}</span>
                      {note.tags?.length > 0 && (
                        <div className="flex gap-1 overflow-hidden">
                          {note.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded truncate max-w-[60px]">
                              {tag}
                            </span>
                          ))}
                          {note.tags.length > 2 && (
                            <span className="text-xs text-gray-400">+{note.tags.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 平台标签 */}
                  {note.source_platform && PLATFORMS[note.source_platform as keyof typeof PLATFORMS] && (
                    <span
                      className="flex-shrink-0 px-2 py-0.5 text-xs rounded-full"
                      style={{
                        backgroundColor: `${PLATFORMS[note.source_platform as keyof typeof PLATFORMS].color}20`,
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
  );
}
