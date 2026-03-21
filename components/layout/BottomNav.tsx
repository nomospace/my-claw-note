'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Link2, FileText, Archive, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: '首页' },
  { href: '/capture', icon: Link2, label: '抓取' },
  { href: '/notes', icon: FileText, label: '笔记' },
  { href: '/materials', icon: Archive, label: '素材' },
  { href: '/settings', icon: Settings, label: '设置' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t md:hidden safe-area-pb"
      style={{ borderColor: '#e5e7eb' }}
    >
      <div className="flex items-center justify-around h-14">
        {navItems.map(item => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full',
                'transition-colors'
              )}
              style={{ color: isActive ? '#E53935' : '#6b7280' }}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
