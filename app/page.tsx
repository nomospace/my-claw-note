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
        <div className="page-content">
          <div className="animate-pulse space-y-6">
            <div className="h-14 bg-gray-100 rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="h-24 bg-gray-100 rounded-lg" />
              <div className="h-24 bg-gray-100 rounded-lg" />
              <div className="h-24 bg-gray-100 rounded-lg" />
            </div>
            <div className="h-48 bg-gray-100 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-content">
        {/* Header */}
        <h1 className="page-title">仪表盘</h1>

        {/* Quick Capture */}
        <div className="mb-6">
          <QuickCapture />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
    </div>
  );
}
