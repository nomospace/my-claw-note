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
          <div className="grid grid-cols-3 gap-4">
            <div className="h-32 bg-gray-200 rounded-xl" />
            <div className="h-32 bg-gray-200 rounded-xl" />
            <div className="h-32 bg-gray-200 rounded-xl" />
          </div>
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
        <p className="text-gray-500 mt-1">欢迎回来，今天想学点什么？</p>
      </div>

      <div className="mb-6">
        <QuickCapture />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

      <div>
        <h2 className="section-title">最近笔记</h2>
        <RecentNotes notes={stats?.recentNotes || []} />
      </div>
    </div>
  );
}
