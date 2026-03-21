'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Link2, 
  FileText, 
  GitBranch, 
  Archive, 
  Settings,
  Sparkles
} from 'lucide-react';

const navItems = [
  { href: '/', icon: Home, label: '首页' },
  { href: '/capture', icon: Link2, label: '抓取' },
  { href: '/notes', icon: FileText, label: '笔记' },
  { href: '/graph', icon: GitBranch, label: '图谱' },
  { href: '/materials', icon: Archive, label: '素材' },
  { href: '/rules', icon: Sparkles, label: '规则' },
  { href: '/settings', icon: Settings, label: '设置' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside 
      className="hidden md:flex flex-col h-screen flex-shrink-0 border-r"
      style={{ 
        width: '240px',
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb'
      }}
    >
      {/* Logo */}
      <div 
        className="flex items-center px-5 border-b"
        style={{ height: '64px', borderColor: '#e5e7eb' }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <span className="text-2xl">🦞</span>
          <span className="font-semibold text-lg" style={{ color: '#111827' }}>
            MyClawNote
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-0.5 px-3">
          {navItems.map(item => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
                  style={{
                    color: isActive ? '#E53935' : '#4b5563',
                    backgroundColor: isActive ? '#FFEBEE' : 'transparent',
                    fontWeight: isActive ? 500 : 400
                  }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t" style={{ borderColor: '#e5e7eb' }}>
        <span className="text-xs" style={{ color: '#9ca3af' }}>
          Powered by OpenClaw
        </span>
      </div>
    </aside>
  );
}
