'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import ReactFlow, { Node, Edge, Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from '@/components/ui/Card';

interface Note {
  id: string;
  title: string;
}

interface Relation {
  id: string;
  note_id_a: string;
  note_id_b: string;
  relation_type: string;
  similarity_score: number;
}

export default function GraphPage() {
  const { data: notesData } = useQuery({
    queryKey: ['notes-for-graph'],
    queryFn: () => fetch('/api/notes?limit=50').then(res => res.json()),
  });

  const { data: relationsData } = useQuery({
    queryKey: ['relations'],
    queryFn: () => fetch('/api/relations').then(res => res.json()),
  });

  const notes: Note[] = notesData?.notes || [];
  const relations: Relation[] = relationsData?.relations || [];

  const { nodes, edges } = useMemo(() => {
    if (notes.length === 0) {
      return { nodes: [], edges: [] };
    }

    const nodeList: Node[] = notes.map((note, index) => {
      const angle = (2 * Math.PI * index) / notes.length;
      const radius = 220;
      return {
        id: note.id,
        type: 'default',
        data: { 
          label: note.title.length > 12 ? note.title.slice(0, 12) + '...' : note.title 
        },
        position: {
          x: 300 + radius * Math.cos(angle),
          y: 300 + radius * Math.sin(angle),
        },
        style: {
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '12px',
          color: '#374151',
        },
      };
    });

    const edgeList: Edge[] = relations.map(rel => ({
      id: rel.id,
      source: rel.note_id_a,
      target: rel.note_id_b,
      animated: false,
      style: { stroke: '#93c5fd', strokeWidth: 1.5 },
    }));

    return { nodes: nodeList, edges: edgeList };
  }, [notes, relations]);

  return (
    <div className="page-container">
      <div className="page-content">
        {/* Header */}
        <h1 className="page-title">知识图谱</h1>

        {/* 统计 */}
        <p className="text-sm mb-4" style={{ color: '#6b7280' }}>
          {notes.length} 个节点 · {relations.length} 条关联
        </p>

        {notes.length === 0 ? (
          <Card className="p-8 text-center">
            <p style={{ color: '#9ca3af' }}>暂无笔记，图谱为空</p>
          </Card>
        ) : (
          <Card className="h-[500px]">
            <ReactFlow 
              nodes={nodes} 
              edges={edges} 
              fitView
              defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
              minZoom={0.2}
              maxZoom={2}
            >
              <Background color="#e5e7eb" gap={16} />
              <MiniMap />
              <Controls />
            </ReactFlow>
          </Card>
        )}
      </div>
    </div>
  );
}
