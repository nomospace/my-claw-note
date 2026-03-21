'use client';

import { useQuery } from '@tanstack/react-query';
import { FileText, Archive, Clock } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentNotes } from '@/components/dashboard/RecentNotes';
import { QuickCapture } from '@/components/dashboard/QuickCapture';

export default function HomePage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => fetch('/api/stats').then(res => res.json()),
  });

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-gray-200 rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="h-28 bg-gray-200 rounded-xl" />
            <div className="h-28 bg-gray-200 rounded-xl" />
            <div className="h-28 bg-gray-200 rounded-xl" />
          </div>
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-4xl mx-auto">
      {/* Header - 移动端隐藏，已在顶部标题栏显示 */}
      <div className="mb-4 hidden md:block">
        <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
        <p className="text-gray-500 mt-1">欢迎回来，今天想学点什么？</p>
      </div>

      {/* Quick Capture */}
      <div className="mb-4">
        <QuickCapture />
      </div>

      {/* Stats Grid - 移动端纵向排列 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <StatCard
          title="笔记总数"
          value={stats?.notesCount || 0}
          icon={FileText}
          color="#3B82F6"
        />
        <StatCard
          title="素材数量"
          value={stats?.materialsCount || 0}
          icon={Archive}
          color="#10B981"
        />
        <StatCard
          title="待处理任务"
          value={stats?.pendingTasks || 0}
          icon={Clock}
          color="#F59E0B"
        />
      </div>

      {/* Recent Notes */}
      <div>
        <h2 className="section-title">最近笔记</h2>
        <RecentNotes notes={stats?.recentNotes || []} />
      </div>
    </div>
  );
}
