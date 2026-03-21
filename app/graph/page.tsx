'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ReactFlow, { Node, Edge, Background, Controls, MiniMap, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

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
  const [zoom, setZoom] = useState(0.6);

  const { data: notesData } = useQuery({
    queryKey: ['notes-for-graph'],
    queryFn: () => fetch('/api/notes?limit=30').then(res => res.json()),
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

    // 创建节点 - 圆形布局
    const nodeList: Node[] = notes.map((note, index) => {
      const angle = (2 * Math.PI * index) / notes.length;
      const radius = 180;
      return {
        id: note.id,
        type: 'default',
        data: { 
          label: note.title.length > 8 ? note.title.slice(0, 8) + '...' : note.title 
        },
        position: {
          x: 200 + radius * Math.cos(angle),
          y: 200 + radius * Math.sin(angle),
        },
        style: {
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '6px 10px',
          fontSize: '11px',
          width: 'auto',
        },
      };
    });

    // 创建边
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
    <div className="page-container" style={{ paddingBottom: '70px' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="hidden md:block">
          <h1 className="text-xl font-bold text-gray-900">知识图谱</h1>
          <p className="text-gray-500 text-sm">可视化展示知识关联</p>
        </div>
        
        {/* 移动端显示节点数量 */}
        <div className="md:hidden text-sm text-gray-500">
          {notes.length} 个节点 · {relations.length} 条关联
        </div>
        
        {/* 缩放控制 */}
        <div className="flex gap-1">
          <Button variant="secondary" size="sm" onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setZoom(0.6)}>
            <Maximize className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}>
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {notes.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-400 text-sm">暂无笔记，图谱为空</p>
        </Card>
      ) : (
        <Card className="h-[calc(100vh-180px)] md:h-[500px]" style={{ minHeight: '400px' }}>
          <ReactFlow 
            nodes={nodes} 
            edges={edges} 
            fitView
            defaultViewport={{ x: 0, y: 0, zoom }}
            minZoom={0.2}
            maxZoom={2}
            nodesDraggable={true}
            nodesConnectable={false}
            elementsSelectable={true}
            panOnDrag={true}
            zoomOnScroll={true}
            zoomOnPinch={true}
            preventScrolling={true}
          >
            <Background color="#e5e7eb" gap={16} />
            {/* 移动端隐藏 MiniMap */}
            <MiniMap className="hidden md:block" />
            {/* 移动端隐藏 Controls，使用自定义按钮 */}
            <Controls className="hidden md:block" />
          </ReactFlow>
        </Card>
      )}
    </div>
  );
}
