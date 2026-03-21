'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import ReactFlow, { Node, Edge, Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from '@/components/ui/Card';

interface Note {
  id: string;
  title: string;
  source_platform: string | null;
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

    // 创建节点
    const nodeList: Node[] = notes.map((note, index) => {
      const angle = (2 * Math.PI * index) / notes.length;
      const radius = 200;
      return {
        id: note.id,
        type: 'default',
        data: { 
          label: note.title.length > 10 ? note.title.slice(0, 10) + '...' : note.title 
        },
        position: {
          x: 400 + radius * Math.cos(angle),
          y: 300 + radius * Math.sin(angle),
        },
        style: {
          background: '#fff',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '12px',
        },
      };
    });

    // 创建边
    const edgeList: Edge[] = relations.map(rel => ({
      id: rel.id,
      source: rel.note_id_a,
      target: rel.note_id_b,
      animated: true,
      style: { stroke: '#3B82F6', strokeWidth: 2 },
    }));

    return { nodes: nodeList, edges: edgeList };
  }, [notes, relations]);

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">知识图谱</h1>
        <p className="text-gray-500 mt-1">可视化展示知识关联</p>
      </div>

      {notes.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">暂无笔记，图谱为空</p>
        </Card>
      ) : (
        <Card className="h-[600px]">
          <ReactFlow nodes={nodes} edges={edges} fitView>
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </Card>
      )}
    </div>
  );
}
