'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/': '仪表盘',
  '/capture': '内容抓取',
  '/notes': '笔记',
  '/graph': '知识图谱',
  '/materials': '素材库',
  '/rules': '规则引擎',
  '/settings': '设置',
};

export function MobileHeader() {
  const pathname = usePathname();
  
  // 获取当前页面标题
  const getTitle = () => {
    if (pathname.startsWith('/notes/') && pathname !== '/notes') {
      return '笔记详情';
    }
    if (pathname.startsWith('/snapshot/')) {
      return '原文快照';
    }
    return pageTitles[pathname] || 'MyClawNote';
  };

  const showBack = pathname.startsWith('/notes/') && pathname !== '/notes' || 
                   pathname.startsWith('/snapshot/');

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 safe-area-pt">
      <div className="flex items-center justify-between h-12 px-4">
        <div className="flex items-center gap-2">
          {showBack ? (
            <Link href="/notes" className="p-1 -ml-1">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl">🦞</span>
            </Link>
          )}
          <h1 className="font-semibold text-gray-900">{getTitle()}</h1>
        </div>
      </div>
    </header>
  );
}
