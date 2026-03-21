'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Search, Plus, FolderOpen } from 'lucide-react';
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

interface Category {
  id: string;
  name: string;
  icon: string | null;
}

export default function NotesPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  // 获取分类列表
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      return res.json();
    },
  });

  // 获取笔记列表
  const { data: notesData, isLoading } = useQuery({
    queryKey: ['notes', search, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedCategory) params.set('category', selectedCategory);
      const res = await fetch(`/api/notes?${params}`);
      return res.json();
    },
  });

  const categories: Category[] = categoriesData?.categories || [];
  const notes: Note[] = notesData?.notes || [];
  const total = notesData?.total || 0;

  return (
    <div className="page-container flex gap-6">
      {/* 侧边分类栏 */}
      <aside className="w-56 flex-shrink-0">
        <Card className="p-4 sticky top-6">
          <h3 className="font-medium text-gray-900 mb-3">分类</h3>
          <ul className="space-y-1">
            <li>
              <button
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === null
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedCategory(null)}
              >
                全部
              </button>
            </li>
            {categories.map(cat => (
              <li key={cat.id}>
                <button
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 min-w-0">
        {/* 顶部操作栏 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">笔记</h1>
            <p className="text-gray-500 text-sm mt-1">共 {total} 条笔记</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowSearch(!showSearch)}>
              <Search className="w-4 h-4" />
            </Button>
            <Link href="/notes/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                新建
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
            />
          </div>
        )}

        {/* 笔记列表 */}
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">加载中...</div>
        ) : notes.length === 0 ? (
          <Card className="p-8 text-center">
            <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">暂无笔记</p>
            <Link href="/capture">
              <Button>去抓取内容</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {notes.map(note => (
              <Link key={note.id} href={`/notes/${note.id}`}>
                <Card className="p-4" hover>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{note.title}</h3>
                      {note.summary && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{note.summary}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-400">{formatDateShort(note.created_at)}</span>
                        {note.tags?.length > 0 && (
                          <div className="flex gap-1">
                            {note.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {note.source_platform && PLATFORMS[note.source_platform as keyof typeof PLATFORMS] && (
                      <span
                        className="ml-4 px-2 py-1 text-xs rounded-full flex-shrink-0"
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
      </main>
    </div>
  );
}
