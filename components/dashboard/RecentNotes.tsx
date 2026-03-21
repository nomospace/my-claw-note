import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { formatDateShort } from '@/lib/utils';
import { PLATFORMS } from '@/lib/constants';

interface RecentNote {
  id: string;
  title: string;
  source_platform: string | null;
  created_at: string;
}

interface RecentNotesProps {
  notes: RecentNote[];
}

export function RecentNotes({ notes }: RecentNotesProps) {
  if (notes.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">暂无笔记，开始抓取内容吧！</p>
        <Link 
          href="/capture" 
          className="inline-block mt-4 text-blue-600 hover:underline"
        >
          去抓取 →
        </Link>
      </Card>
    );
  }

  return (
    <Card>
      <div className="divide-y divide-gray-100">
        {notes.map(note => (
          <Link
            key={note.id}
            href={`/notes/${note.id}`}
            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {note.title}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDateShort(note.created_at)}
              </p>
            </div>
            {note.source_platform && PLATFORMS[note.source_platform as keyof typeof PLATFORMS] && (
              <span 
                className="ml-4 px-2 py-1 text-xs rounded-full"
                style={{ 
                  backgroundColor: `${PLATFORMS[note.source_platform as keyof typeof PLATFORMS].color}20`,
                  color: PLATFORMS[note.source_platform as keyof typeof PLATFORMS].color
                }}
              >
                {PLATFORMS[note.source_platform as keyof typeof PLATFORMS].name}
              </span>
            )}
          </Link>
        ))}
      </div>
    </Card>
  );
}
